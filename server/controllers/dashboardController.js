// server/controllers/dashboardController.js

import Report from '../models/report.js';
import User from '../models/User.js';
import NoteReport from '../models/NoteReport.js';
import Type from '../models/Type.js';

export const getGeneralStats = async (req, res) => {
  try {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalReports = await Report.countDocuments();
    const reportsThisMonth = await Report.countDocuments({ date: { $gte: lastMonth } });
    const reportsThisWeek = await Report.countDocuments({ date: { $gte: lastWeek } });

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isBlocked: false });
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    const totalNotes = await NoteReport.countDocuments();
    const avgNote = await NoteReport.aggregate([
      { $group: { _id: null, average: { $avg: "$note" } } }
    ]);

    const reportsByStatus = await Report.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json({
      general: {
        totalReports,
        reportsThisMonth,
        reportsThisWeek,
        totalUsers,
        activeUsers,
        blockedUsers,
        totalNotes,
        avgNote: avgNote[0]?.average || 0
      },
      reportsByStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getReportsByPeriod = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    let groupBy, dateRange = {};

    if (startDate && endDate) {
      dateRange = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    switch (period) {
      case 'day': groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$date" } }; break;
      case 'week': groupBy = { $dateToString: { format: "%Y-W%U", date: "$date" } }; break;
      case 'month': groupBy = { $dateToString: { format: "%Y-%m", date: "$date" } }; break;
      case 'year': groupBy = { $dateToString: { format: "%Y", date: "$date" } }; break;
    }

    const result = await Report.aggregate([
      { $match: dateRange },
      { $group: { _id: groupBy, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getReportsByType = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateRange = {};

    if (startDate && endDate) {
      dateRange = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const result = await Report.aggregate([
      { $match: dateRange },
      {
        $lookup: {
          from: 'types',
          localField: 'type',
          foreignField: '_id',
          as: 'typeInfo'
        }
      },
      { $unwind: '$typeInfo' },
      {
        $group: {
          _id: '$typeInfo.nom',
          count: { $sum: 1 },
          typeId: { $first: '$typeInfo._id' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getReportsByGravity = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateRange = {};

    if (startDate && endDate) {
      dateRange = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const result = await Report.aggregate([
      { $match: dateRange },
      {
        $group: {
          _id: '$gravite',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getReportsByStatus = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateRange = {};

    if (startDate && endDate) {
      dateRange = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const result = await Report.aggregate([
      { $match: dateRange },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGeographicAnalysis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateRange = {};

    if (startDate && endDate) {
      dateRange = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const heatmapData = await Report.find(dateRange, {
      coordinates: 1,
      gravite: 1,
      status: 1,
      date: 1
    });

    const densityData = await Report.aggregate([
      { $match: dateRange },
      {
        $group: {
          _id: {
            lat: { $floor: { $multiply: ["$coordinates.lat", 100] } },
            lng: { $floor: { $multiply: ["$coordinates.lng", 100] } }
          },
          count: { $sum: 1 },
          avgGravite: { $avg: "$gravite" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);

    res.json({ heatmapData, densityData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const usersByStatus = await User.aggregate([
      { $match: { isBlocked: false } },
      { $group: { _id: '$statut', count: { $sum: 1 } } }
    ]);

    const newUsersByMonth = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$_id" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const topUsers = await User.aggregate([
      { $match: { isBlocked: false } },
      {
        $addFields: {
          totalPoints: { $sum: "$points.valeur" }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: 10 },
      {
        $project: {
          pseudo: 1,
          totalPoints: 1,
          statut: 1
        }
      }
    ]);

    const userActivity = await Report.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'utilisateur',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $group: {
          _id: '$userInfo.pseudo',
          reportCount: { $sum: 1 },
          userId: { $first: '$userInfo._id' }
        }
      },
      { $sort: { reportCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      usersByStatus,
      newUsersByMonth,
      topUsers,
      userActivity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEvaluationStats = async (req, res) => {
  try {
    const noteDistribution = await NoteReport.aggregate([
      { $group: { _id: '$note', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const noteEvolution = await NoteReport.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          avgNote: { $avg: "$note" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const topRatedReports = await Report.aggregate([
      { $match: { "evaluation.nombre": { $gt: 0 } } },
      { $sort: { "evaluation.note": -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'types',
          localField: 'type',
          foreignField: '_id',
          as: 'typeInfo'
        }
      },
      { $unwind: '$typeInfo' },
      {
        $project: {
          description: { $substr: ["$description", 0, 50] },
          "evaluation.note": 1,
          "evaluation.nombre": 1,
          "typeInfo.nom": 1,
          date: 1
        }
      }
    ]);

    res.json({ noteDistribution, noteEvolution, topRatedReports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFilterOptions = async (req, res) => {
  try {
    const types = await Type.find({}, { nom: 1 });
    const statuses = ['en attente', 'validé', 'en cours', 'résolu', 'annulé'];
    const gravityLevels = [1, 2, 3, 4, 5];
    const userStatuses = ['Inconnu', 'Débutant', 'Fiable', 'Très fiable', 'Vérifié'];

    const dateRange = await Report.aggregate([
      {
        $group: {
          _id: null,
          minDate: { $min: "$date" },
          maxDate: { $max: "$date" }
        }
      }
    ]);

    res.json({
      types,
      statuses,
      gravityLevels,
      userStatuses,
      dateRange: dateRange[0] || { minDate: new Date(), maxDate: new Date() }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
