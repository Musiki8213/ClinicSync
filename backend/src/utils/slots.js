const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function dayNameFromDate(d) {
  return DAY_NAMES[new Date(d).getDay()];
}

function parseTime(t) {
  if (!t || typeof t !== 'string') return 0;
  const parts = t.split(':').map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  return h * 60 + m;
}

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Time windows for a weekday from either an array of { day, startTime, endTime, slotMinutes }
 * or legacy { days, windowStart, windowEnd, slotMinutes }.
 */
export function timeWindowsForDay(dayName, availability) {
  const day = dayName.toLowerCase();
  if (Array.isArray(availability) && availability.length > 0) {
    return availability
      .filter((e) => e?.day?.toLowerCase() === day)
      .map((e) => ({
        start: parseTime(e.startTime),
        end: parseTime(e.endTime),
        slotMinutes: e.slotMinutes ?? 30,
      }))
      .filter((w) => w.end > w.start && w.slotMinutes > 0);
  }
  const av = availability || {};
  const {
    days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    windowStart = '09:00',
    windowEnd = '17:00',
    slotMinutes = 30,
  } = av;
  if (!days.length) {
    return [{ start: parseTime(windowStart), end: parseTime(windowEnd), slotMinutes }];
  }
  if (!days.map((d) => String(d).toLowerCase()).includes(day)) return [];
  return [{ start: parseTime(windowStart), end: parseTime(windowEnd), slotMinutes }];
}

/** Slot strings (HH:mm) for a calendar date, using that weekday's windows. */
export function generateSlotsForDayDate(date, availability) {
  const day = dayNameFromDate(date);
  const windows = timeWindowsForDay(day, availability);
  const slots = [];
  for (const { start, end, slotMinutes } of windows) {
    for (let t = start; t + slotMinutes <= end; t += slotMinutes) {
      slots.push(formatTime(t));
    }
  }
  return slots;
}

/**
 * @deprecated Prefer generateSlotsForDayDate for per-day logic. Kept for callers that only need generic slots from legacy shape.
 */
export function generateSlotsForDay(availability) {
  const av = availability || {};
  const {
    days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    windowStart = '09:00',
    windowEnd = '17:00',
    slotMinutes = 30,
  } = av;
  const start = parseTime(windowStart);
  const end = parseTime(windowEnd);
  const slots = [];
  for (let t = start; t + slotMinutes <= end; t += slotMinutes) {
    slots.push(formatTime(t));
  }
  return { days, slots };
}

export function isDayAvailable(date, availability) {
  const day = dayNameFromDate(date);
  if (Array.isArray(availability) && availability.length > 0) {
    return availability.some((e) => e?.day?.toLowerCase() === day);
  }
  const { days = [] } = availability || {};
  if (!days.length) return true;
  return days.map((d) => String(d).toLowerCase()).includes(day);
}

/** True when the doctor has at least one weekday with a valid bookable time window. */
export function hasBookableWeeklySchedule(availability) {
  if (!Array.isArray(availability) || availability.length === 0) return false;
  return DAY_NAMES.some((day) => timeWindowsForDay(day, availability).length > 0);
}
