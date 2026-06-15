const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

function ordinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'TH';
  switch (day % 10) {
    case 1: return 'ST';
    case 2: return 'ND';
    case 3: return 'RD';
    default: return 'TH';
  }
}

export function formatTimeRange(time: string, durationMinutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const endTotal = h * 60 + m + durationMinutes;
  const endH = Math.floor(endTotal / 60) % 24;
  const endM = endTotal % 60;
  const end = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  return `${time}—${end}h`;
}

export function nextUpClassId(classes: { id: string; time: string; duration: number }[]): string | null {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  let nextId: string | null = null;
  let minDiff = Infinity;

  for (const c of classes) {
    const [h, m] = c.time.split(':').map(Number);
    const startMins = h * 60 + m;
    const diff = startMins - nowMins;
    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      nextId = c.id;
    }
  }

  return nextId;
}

export function formatDate(date: Date): string {
  const day = date.getDate();
  return `${DAYS[date.getDay()]}, ${day}${ordinalSuffix(day)} ${MONTHS[date.getMonth()]}`;
}
