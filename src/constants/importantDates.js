// Important faculty/staff dates rendered on Home page Event Calendar.
// Edit dates here each term — no DB change needed.
// @mui/x-scheduler v9 (beta) requires start/end as JS Date objects (NOT strings),
// each event needs id + title + start + end. For all-day events set allDay:true.
// new Date(year, monthIndex, day) — monthIndex is 0-based (Jan=0 ... Dec=11).
// Resource colors palette: red | pink | purple | indigo | blue | teal | green | lime | amber | orange | grey

export const EVENT_CALENDAR_RESOURCES = [
  { id: 'asu-cal',       title: 'ASU Academic Calendar', eventColor: 'red' },
  { id: 'app-deadlines', title: 'Application Deadlines', eventColor: 'blue' },
  { id: 'ta-recommendations', title: 'TA Recommendations', eventColor: 'green' },
  { id: 'sessions',      title: 'Summer Sessions A / B / C',    eventColor: 'amber' },
  { id: 'applications', title: 'Fall Applications Available', eventColor: 'teal' },
];

// Placeholder events — replace with real dates.
export const EVENT_CALENDAR_EVENTS = [
  // ── ASU Academic Calendar ──
  {
    id: 'fall-2026-classes-begin',
    title: 'Fall 2026 Classes Begin',
    start: new Date(2026, 7, 20),
    end: new Date(2026, 7, 20),
    allDay: true,
    resource: 'asu-cal',
  },
  // ── TA Recommendations ──
  {
    id: 'fall-2026-ta-recommendations-start',
    title: 'Fall 2026 TA Recommendations Start',
    start: new Date(2026, 5, 2),
    end: new Date(2026, 5, 2),
    allDay: true,
    resource: 'ta-recommendations',
  },
  {
    id: 'fall-2026-ta-recommendations-end',
    title: 'Fall 2026 TA Recommendations End',
    start: new Date(2026, 5, 30),
    end: new Date(2026, 5, 30),
    allDay: true,
    resource: 'ta-recommendations',
  },

  // ── Application Deadlines ──
  {
    id: 'fall-2026-masters-phd-apps-live',
    title: 'Masters and PhD Fall 2026 Applications Live',
    start: new Date(2026, 5, 3),
    end: new Date(2026, 5, 3),
    allDay: true,
    resource: 'applications',
  },
  {
    id: 'fall-2026-app-close',
    title: 'Student Applications Close — Fall 2026',
    start: new Date(2026, 6, 15),
    end: new Date(2026, 6, 15),
    allDay: true,
    resource: 'app-deadlines',
  },

  // ── Sessions A / B / C ──
  {
    id: 'summer-2026-session-c-start',
    title: 'Summer Session C Starts',
    start: new Date(2026, 4, 18),
    end: new Date(2026, 4, 18),
    allDay: true,
    resource: 'sessions',
  },
  {
    id: 'summer-2026-session-a-start',
    title: 'Summer Session A Starts',
    start: new Date(2026, 4, 18),
    end: new Date(2026, 4, 18),
    allDay: true,
    resource: 'sessions',
  },
  {
    id: 'summer-2026-session-b-start',
    title: 'Summer Session B Starts',
    start: new Date(2026, 5, 29),
    end: new Date(2026, 5, 29),
    allDay: true,
    resource: 'sessions',
  },
];
