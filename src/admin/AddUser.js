import React, { useMemo, useState } from 'react';
import {
  TextField, Select, MenuItem, Button, FormGroup, FormControlLabel,
  Switch, Stack, Paper, Typography, FormHelperText, Divider
} from '@mui/material';

const API = process.env.REACT_APP_API_BASE;

// Keep in sync with backend utils/rbac.py ROLE_DEFAULTS
const ROLE_DEFAULTS = {
  admin: {
    assignment_adder: true,
    applications: true,
    phd_applications: true,
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
    phd_applications: false,
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
    phd_applications: false,
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
    phd_applications: false,
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

const FLAG_KEYS = Object.keys(ROLE_DEFAULTS.admin);
const ROLE_OPTIONS = ['admin', 'program_chair', 'faculty_grader', 'custom', 'default'];

export default function AddUser() {
  const [asuId, setAsuId] = useState('');
  const [name, setName] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [rolePreset, setRolePreset] = useState('custom');
  const [flags, setFlags] = useState(structuredClone(ROLE_DEFAULTS.default));
  const [saving, setSaving] = useState(false);

  const switchesDisabled = rolePreset !== 'custom';
  const allOnCount = useMemo(() => Object.values(flags).filter(Boolean).length, [flags]);

  const handlePresetChange = (value) => {
    setRolePreset(value);
    if (value === 'custom') {
      return;
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
        role: rolePreset,
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
          <TextField
            label="ASURITE"
            value={asuId}
            onChange={(e) => setAsuId(e.target.value)}
            required
            inputProps={{ maxLength: 50 }}
          />

          <TextField
            label="Name (Last Name, First Name)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Lorents, Troy"
            inputProps={{ maxLength: 100 }}
          />

          <TextField
            label="Position/Title"
            value={positionTitle}
            onChange={(e) => setPositionTitle(e.target.value)}
            placeholder="e.g., Graduate Student, Faculty"
            inputProps={{ maxLength: 100 }}
          />

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
                  label={k}
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
              {saving ? 'Saving...' : 'Create'}
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
