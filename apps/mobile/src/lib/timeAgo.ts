const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);

  if (diff < MINUTE) return "just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
  if (diff < DAY * 7) return `${Math.floor(diff / DAY)}d`;

  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}
