// Important faculty/staff dates rendered on Home page Event Calendar.
// Edit dates here each term — no DB change needed.
// @mui/x-scheduler v9 (beta.1) requires start/end as ISO wall-time STRINGS
// (e.g. "2026-08-20T00:00:00"), NOT JS Date objects. A string without a
// trailing "Z" is treated as wall-time in the event's timezone/"default".
// Each event needs id + title + start + end. For all-day events set allDay:true
// and span the whole day (T00:00:00 -> T23:59:59).
// Resource colors palette: red | pink | purple | indigo | blue | teal | green | lime | amber | orange | grey

export const EVENT_CALENDAR_RESOURCES = [
  { id: 'asu-cal',       title: 'Academic Calendar', eventColor: 'red' },
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
    start: '2026-08-20T00:00:00',
    end: '2026-08-20T23:59:59',
    allDay: true,
    resource: 'asu-cal',
  },
  // ── TA Recommendations ──
  {
    id: 'fall-2026-ta-recommendations-start',
    title: 'Fall 2026 TA Recommendations Start',
    start: '2026-06-02T00:00:00',
    end: '2026-06-02T23:59:59',
    allDay: true,
    resource: 'ta-recommendations',
  },
  {
    id: 'fall-2026-ta-recommendations-end',
    title: 'Fall 2026 TA Recommendations End',
    start: '2026-06-30T00:00:00',
    end: '2026-06-30T23:59:59',
    allDay: true,
    resource: 'ta-recommendations',
  },

  // ── Application Deadlines ──
  {
    id: 'fall-2026-masters-phd-apps-live',
    title: 'Masters and PhD Fall 2026 Applications Live',
    start: '2026-06-03T00:00:00',
    end: '2026-06-03T23:59:59',
    allDay: true,
    resource: 'applications',
  },
  {
    id: 'fall-2026-app-close',
    title: 'Student Applications Close — Fall 2026',
    start: '2026-07-15T00:00:00',
    end: '2026-07-15T23:59:59',
    allDay: true,
    resource: 'app-deadlines',
  },

  // ── Sessions A / B / C ──
  {
    id: 'summer-2026-session-c-start',
    title: 'Summer Session C Starts',
    start: '2026-05-18T00:00:00',
    end: '2026-05-18T23:59:59',
    allDay: true,
    resource: 'sessions',
  },
  {
    id: 'summer-2026-session-a-start',
    title: 'Summer Session A Starts',
    start: '2026-05-18T00:00:00',
    end: '2026-05-18T23:59:59',
    allDay: true,
    resource: 'sessions',
  },
  {
    id: 'summer-2026-session-b-start',
    title: 'Summer Session B Starts',
    start: '2026-06-29T00:00:00',
    end: '2026-06-29T23:59:59',
    allDay: true,
    resource: 'sessions',
  },
];
