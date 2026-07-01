// import React from 'react';
// export default function AddUser() {
//   return <div style={{ padding: 24 }}>AddUser (test)</div>;
// }



// import React, { useMemo, useState } from 'react';
// import {
//   TextField, Select, MenuItem, Button, FormGroup, FormControlLabel,
//   Switch, Stack, Paper, Typography, FormHelperText, Divider
// } from '@mui/material';

// const API = process.env.REACT_APP_API_URL;

// // Keep in sync with backend utils/rbac.py ROLE_DEFAULTS
// const ROLE_DEFAULTS = {
//   admin: {
//     assignment_adder: true,
//     applications: true,
//     phd_applications: true,
//     student_summary_page: true,
//     bulk_upload_assignments: true,
//     manage_assignments: true,
//     login: true,
//     master_dashboard: true,
//   },
//   level1: {
//     assignment_adder: false,
//     applications: true,
//     phd_applications: true,
//     student_summary_page: true,
//     bulk_upload_assignments: true,
//     manage_assignments: true,
//     login: false,
//     master_dashboard: false,
//   },
//   level2: {
//     assignment_adder: true,
//     applications: true,
//     phd_applications: true,
//     student_summary_page: false,
//     bulk_upload_assignments: false,
//     manage_assignments: false,
//     login: false,
//     master_dashboard: false,
//   },
// };

// const FLAG_KEYS = Object.keys(ROLE_DEFAULTS.admin);

// export default function AddUser() {
//   const [asuId, setAsuId] = useState('');
//   const [rolePreset, setRolePreset] = useState('level1'); // admin | level1 | level2 | custom
//   const [flags, setFlags] = useState(structuredClone(ROLE_DEFAULTS.level1));
//   const [saving, setSaving] = useState(false);

//   const switchesDisabled = rolePreset !== 'custom';
//   const allOnCount = useMemo(() => Object.values(flags).filter(Boolean).length, [flags]);

//   const handlePresetChange = (value) => {
//     setRolePreset(value);
//     if (value === 'custom') return; // keep current flags to edit manually
//     setFlags(structuredClone(ROLE_DEFAULTS[value]));
//   };

//   const submit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       const payload = {
//         asu_id: asuId.trim().toLowerCase(),
//         role: rolePreset === 'custom' ? 'level1' : rolePreset, // assign base role if custom
//         ...flags,
//       };

//       const r = await fetch(`${API}/api/admin/users`, {
//         method: 'POST',
//         credentials: 'include',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       if (!r.ok) throw new Error(await r.text());
//       window.location.href = '/admin/users';
//     } catch (err) {
//       alert(err.message || 'Failed to create user');
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Paper sx={{ p: 3, maxWidth: 760 }}>
//       <Typography variant="h5" sx={{ mb: 2 }}>
//         Add User
//       </Typography>

//       <form onSubmit={submit}>
//         <Stack spacing={2}>
//           {/* ASURITE input */}
//           <TextField
//             label="ASURITE"
//             value={asuId}
//             onChange={(e) => setAsuId(e.target.value)}
//             required
//             inputProps={{ maxLength: 50 }}
//           />

//           {/* Role preset selector */}
//           <div>
//             <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
//               Role Preset
//             </Typography>
//             <Select
//               size="small"
//               value={rolePreset}
//               onChange={(e) => handlePresetChange(e.target.value)}
//             >
//               <MenuItem value="admin">admin (all access)</MenuItem>
//               <MenuItem value="level1">level1 (apps + bulk + manage)</MenuItem>
//               <MenuItem value="level2">level2 (limited)</MenuItem>
//               <MenuItem value="custom">custom (choose manually)</MenuItem>
//             </Select>
//             <FormHelperText>
//               Preset will auto-toggle permissions. Choose <b>custom</b> to modify individually.
//             </FormHelperText>
//           </div>

//           <Divider />

//           {/* Permissions section */}
//           <div>
//             <Typography variant="subtitle2" sx={{ mb: 1 }}>
//               Permissions {switchesDisabled && '(read-only — set by preset)'}
//             </Typography>
//             <FormGroup>
//               {FLAG_KEYS.map((k) => (
//                 <FormControlLabel
//                   key={k}
//                   control={
//                     <Switch
//                       checked={!!flags[k]}
//                       disabled={switchesDisabled}
//                       onChange={(e) =>
//                         setFlags((s) => ({ ...s, [k]: e.target.checked }))
//                       }
//                     />
//                   }
//                   label={k}
//                 />
//               ))}
//             </FormGroup>
//             <FormHelperText sx={{ mt: 0.5 }}>
//               Enabled: {allOnCount} / {FLAG_KEYS.length}
//             </FormHelperText>
//           </div>

//           <Stack direction="row" spacing={2}>
//             <Button
//               type="submit"
//               variant="contained"
//               disabled={saving || !asuId.trim()}
//             >
//               {saving ? 'Saving…' : 'Create'}
//             </Button>
//             <Button variant="outlined" href="/admin/users">
//               Cancel
//             </Button>
//           </Stack>
//         </Stack>
//       </form>
//     </Paper>
//   );
// }



import React, { useMemo, useState } from 'react';
import {
  TextField, Select, MenuItem, Button, FormGroup, FormControlLabel,
  Switch, Stack, Paper, Typography, FormHelperText, Divider
} from '@mui/material';
import { FLAG_KEYS, flagLabel } from '../constants/permissions';

const API = process.env.REACT_APP_API_URL;

// Keep in sync with backend utils/rbac.py ROLE_DEFAULTS
const ROLE_DEFAULTS = {
  admin: {
    assignment_adder: true,
    applications: true,
    student_summary_page: true,
    bulk_upload_assignments: true,
    manage_assignments: true,
    login: true,
    master_dashboard: true,
    faculty_dashboard: true,
    program_chair_uploads: true,
    faculty_quickassign: true,
    faculty_grader_uploads: true,
  },
  default: {
    assignment_adder: false,
    applications: false,
    student_summary_page: false,
    bulk_upload_assignments: false,
    manage_assignments: false,
    login: true,
    master_dashboard: false,
    faculty_dashboard: true,
    program_chair_uploads: false,
    faculty_quickassign: false,
    faculty_grader_uploads: false,
  },
  program_chair: {
    assignment_adder: true,
    applications: true,
    student_summary_page: true,
    bulk_upload_assignments: true,
    manage_assignments: false,
    login: true,
    master_dashboard: false,
    faculty_dashboard: true,
    program_chair_uploads: true,
    faculty_quickassign: false,
    faculty_grader_uploads: false,
  },
  faculty_grader: {
    assignment_adder: false,
    applications: true,
    student_summary_page: false,
    bulk_upload_assignments: false,
    manage_assignments: false,
    login: true,
    master_dashboard: false,
    faculty_dashboard: true,
    program_chair_uploads: false,
    faculty_quickassign: true,
    faculty_grader_uploads: true,
  },
};

const ROLE_OPTIONS = ['admin', 'program_chair', 'faculty_grader', 'custom', 'default'];

export default function AddUser() {
  const [asuId, setAsuId] = useState('');
  const [name, setName] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [rolePreset, setRolePreset] = useState('custom'); // admin | level1 | level2 | custom
  const [flags, setFlags] = useState(structuredClone(ROLE_DEFAULTS.default));
  const [saving, setSaving] = useState(false);

  const switchesDisabled = rolePreset !== 'custom';
  const allOnCount = useMemo(() => Object.values(flags).filter(Boolean).length, [flags]);

  const handlePresetChange = (value) => {
    setRolePreset(value);
    if (value === 'custom') {
      return; // keep current flags to edit manually
    }
    setFlags(structuredClone(ROLE_DEFAULTS[value]));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        asu_id: asuId.trim().toLowerCase(),
        name: name.trim(),
        position_title: positionTitle.trim(),
        role: rolePreset, // saves to actual selected role, including custom in backend
        ...flags,
      };
      const r = await fetch(`${API}/api/admin/users`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(await r.text());
      window.location.href = '/admin/users';
    } catch (err) {
      alert(err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 760 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add User
      </Typography>

      <form onSubmit={submit}>
        <Stack spacing={2}>
          {/* ASURITE input */}
          <TextField
            label="ASURITE"
            value={asuId}
            onChange={(e) => setAsuId(e.target.value)}
            required
            inputProps={{ maxLength: 50 }}
          />

          {/* Name input */}
          <TextField
            label="Name (Last Name, First Name)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Lorents, Troy"
            inputProps={{ maxLength: 100 }}
          />

          {/* Position/Title input */}
          <TextField
            label="Position/Title"
            value={positionTitle}
            onChange={(e) => setPositionTitle(e.target.value)}
            placeholder="e.g., Graduate Student, Faculty"
            inputProps={{ maxLength: 100 }}
          />

          {/* Role preset selector */}
          <div>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Role Preset
            </Typography>
            <Select
              size="small"
              value={rolePreset}
              onChange={(e) => handlePresetChange(e.target.value)}
            >
              {ROLE_OPTIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              <MenuItem value="custom">custom (choose manually)</MenuItem>
            </Select>
            <FormHelperText>
              Preset will auto-toggle permissions. Choose <b>custom</b> to modify individually.
            </FormHelperText>
          </div>

          <Divider />

          {/* Permissions section */}
          <div>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Permissions {switchesDisabled && '(read-only — set by preset)'}
            </Typography>
            <FormGroup>
              {FLAG_KEYS.map((k) => (
                <FormControlLabel
                  key={k}
                  control={
                    <Switch
                      checked={!!flags[k]}
                      disabled={switchesDisabled}
                      onChange={(e) =>
                        setFlags((s) => ({ ...s, [k]: e.target.checked }))
                      }
                    />
                  }
                  label={flagLabel(k)}
                />
              ))}
            </FormGroup>
            <FormHelperText sx={{ mt: 0.5 }}>
              Enabled: {allOnCount} / {FLAG_KEYS.length}
            </FormHelperText>
          </div>

          <Stack direction="row" spacing={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving || !asuId.trim()}
            >
              {saving ? 'Saving…' : 'Create'}
            </Button>
            <Button variant="outlined" href="/admin/users">
              Cancel
            </Button>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
}
