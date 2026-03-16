const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parseDate(date: Date | string): Date {
  if (date instanceof Date) return date;
  // Hermes on Android can fail with certain ISO formats.
  // Ensure the string ends with a timezone designator.
  let s = date;
  if (!s.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(s)) {
    s += "Z";
  }
  const d = new Date(s);
  if (isNaN(d.getTime())) return new Date();
  return d;
}

export function timeAgo(date: Date | string): string {
  const d = parseDate(date);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);

  if (diff < MINUTE) return "just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
  if (diff < DAY * 7) return `${Math.floor(diff / DAY)}d`;

  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}
