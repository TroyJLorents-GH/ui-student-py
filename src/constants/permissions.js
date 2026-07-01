// Per-page RBAC permission flags shown in the admin user screens.
// Keep keys in sync with backend utils/rbac.py ROLE_DEFAULTS.
// Labels match the page names shown in the sidebar nav.
export const FLAG_LABELS = {
  assignment_adder: 'Quick Assign',
  applications: 'Masters & PhD Applications',
  student_summary_page: 'Edit Student Assignment',
  bulk_upload_assignments: 'Bulk Upload',
  manage_assignments: 'Manage Student Assignments',
  login: 'Login Access',
  master_dashboard: 'HR Master Dashboard',
  faculty_dashboard: 'Student Assignment Dashboard',
  program_chair_uploads: 'Program Chair Dashboard',
  faculty_quickassign: 'Faculty Quick Assign',
  faculty_grader_uploads: 'Faculty Grader Dashboard',
  analytics: 'Analytics',
  chat: 'Chat Assistant',
};

// Column / toggle order follows insertion order above.
export const FLAG_KEYS = Object.keys(FLAG_LABELS);

export const flagLabel = (k) => FLAG_LABELS[k] || k;
