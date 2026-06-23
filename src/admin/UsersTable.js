import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import {
  Button, Select, MenuItem, Switch, Stack, Snackbar, Alert, Box
} from '@mui/material';
import { useAuth } from '../AuthContext';
import { FLAG_KEYS, flagLabel } from '../constants/permissions';

const API = process.env.REACT_APP_API_URL;

// Current roles supported
const ROLE_OPTIONS = ['admin', 'program_chair', 'faculty_grader', 'custom', 'default'];

export default function UsersTable() {
  const { asurite } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const openSnack = useCallback((msg, severity = 'success') => {
    setSnack({ open: true, msg, severity });
  }, []);

  const closeSnack = useCallback(() => {
    setSnack((s) => ({ ...s, open: false }));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/admin/users`, { credentials: 'include' });
      const data = await r.json();
      setRows(data.map((x) => ({ id: x.asu_id, ...x })));
    } catch (e) {
      openSnack('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [openSnack]);

  useEffect(() => {
    load();
  }, [load]);

  const patchUser = useCallback(
    async (asu_id, payload, successMsg = 'Saved') => {
      // SECURITY: Prevent users from modifying their own account
      if (asu_id.toLowerCase() === asurite?.toLowerCase()) {
        openSnack('Cannot modify your own account. Ask another admin for help.', 'error');
        return;
      }

      const r = await fetch(`${API}/api/admin/users/${asu_id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(await r.text());
      openSnack(successMsg, 'success');
      await load();
    },
    [load, openSnack, asurite]
  );

  const deleteUser = useCallback(
    async (asu_id) => {
      // SECURITY: Prevent users from deleting their own account
      if (asu_id.toLowerCase() === asurite?.toLowerCase()) {
        openSnack('Cannot delete your own account. Ask another admin for help.', 'error');
        return;
      }

      const r = await fetch(`${API}/api/admin/users/${asu_id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!r.ok) throw new Error(await r.text());
      openSnack('Deleted', 'success');
      await load();
    },
    [load, openSnack, asurite]
  );

  // Inline edit save (Position/Title). Returns the row to keep, or throws to revert.
  const processRowUpdate = useCallback(
    async (newRow, oldRow) => {
      if (newRow.position_title === oldRow.position_title) return oldRow; // no change
      if (newRow.asu_id.toLowerCase() === asurite?.toLowerCase()) {
        openSnack('Cannot modify your own account. Ask another admin for help.', 'error');
        return oldRow;
      }
      const r = await fetch(`${API}/api/admin/users/${newRow.asu_id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position_title: newRow.position_title }),
      });
      if (!r.ok) throw new Error(await r.text());
      openSnack('Position/Title updated', 'success');
      return newRow;
    },
    [openSnack, asurite],
  );

  const columns = useMemo(() => {
    const nameCol = {
      field: 'name',
      headerName: 'Name',
      width: 200,
      sortable: true,
    };

    const positionCol = {
      field: 'position_title',
      headerName: 'Position/Title',
      width: 200,
      sortable: true,
      editable: true,
    };

    const roleCol = {
      field: 'role',
      headerName: 'Role',
      width: 140,
      sortable: true,
      renderCell: (params) => {
        const isSelf = params.row.asu_id?.toLowerCase() === asurite?.toLowerCase();
        return (
          <Select
            size="small"
            value={params.row.role}
            disabled={isSelf}
            onChange={async (e) => {
              try {
                await patchUser(params.row.asu_id, { role: e.target.value }, 'Role updated');
              } catch {
                openSnack('Failed to update role', 'error');
              }
            }}
            title={isSelf ? 'Cannot modify your own role' : ''}
          >
            {ROLE_OPTIONS.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </Select>
        );
      },
    };

    const flagCols = FLAG_KEYS.map((k) => ({
      field: k,
      headerName: flagLabel(k),
      width: 200,
      sortable: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const isSelf = params.row.asu_id?.toLowerCase() === asurite?.toLowerCase();
        return (
          <Switch
            checked={!!params.row[k]}
            disabled={isSelf}
            onChange={async (e) => {
              try {
                await patchUser(params.row.asu_id, { [k]: e.target.checked }, `${flagLabel(k)} updated`);
              } catch {
                openSnack(`Failed to update ${flagLabel(k)}`, 'error');
              }
            }}
            title={isSelf ? 'Cannot modify your own permissions' : ''}
          />
        );
      },
    }));

    const actionsCol = {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      renderCell: (params) => {
        const isSelf = params.row.asu_id?.toLowerCase() === asurite?.toLowerCase();
        return (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              color="error"
              disabled={isSelf}
              onClick={async () => {
                if (!window.confirm(`Delete ${params.row.asu_id}?`)) return;
                try {
                  await deleteUser(params.row.asu_id);
                } catch {
                  openSnack('Failed to delete', 'error');
                }
              }}
              title={isSelf ? 'Cannot delete your own account' : ''}
            >
              Delete
            </Button>
          </Stack>
        );
      },
    };

    return [{ field: 'asu_id', headerName: 'ASURITE', width: 140 }, nameCol, positionCol, roleCol, ...flagCols, actionsCol];
  }, [patchUser, deleteUser, openSnack, asurite]);

  return (
    <Box sx={{ width: 'auto', p: 2 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
        <Button variant="contained" href="/admin/users/new">
          Add User
        </Button>
        <Button variant="outlined" onClick={load}>
          Refresh
        </Button>
      </Stack>
      <div style={{ height: '900px', width: '100%' }}>
         <DataGridPro
         sx={{
            '& .MuiDataGrid-toolbar': { justifyContent: 'flex-start' },
          }}
          rows={rows}
          columns={columns}
          loading={loading}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={() => openSnack('Failed to save Position/Title', 'error')}
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25, page: 0 } },
            filter: { filterModel: { items: [] } },
          }}
          showToolbar
          pagination
          headerFilters
          // headerAlign="center"
        />
      </div>
      <Snackbar open={snack.open} autoHideDuration={2500} onClose={closeSnack}>
        <Alert onClose={closeSnack} severity={snack.severity} variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}