/** Monday-start week range in local time */
export function getCurrentWeekRange(now = new Date()) {
  const start = new Date(now);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return { start, end };
}

export function isWithinCurrentWeek(iso?: string, now = new Date()) {
  if (!iso) return true;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return true;

  const { start, end } = getCurrentWeekRange(now);
  return date >= start && date < end;
}

export function formatWeekLabel(now = new Date()) {
  const { start, end } = getCurrentWeekRange(now);
  const endDisplay = new Date(end);
  endDisplay.setDate(endDisplay.getDate() - 1);

  const fmt = new Intl.DateTimeFormat("en-LK", {
    month: "short",
    day: "numeric",
  });

  return `${fmt.format(start)} – ${fmt.format(endDisplay)}`;
}
