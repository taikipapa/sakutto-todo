export function isSameDay(timestamp, ref = Date.now()) {
  if (!timestamp) return false;
  const a = new Date(timestamp);
  const b = new Date(ref);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
