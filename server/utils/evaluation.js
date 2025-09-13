// utils/evaluation.js
export function getNoteColor(note) {
  if (note >= 80) return 'vert';
  if (note >= 60) return 'jaune';
  if (note >= 40) return 'orange';
  return 'rouge';
}
