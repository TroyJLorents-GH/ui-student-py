import React, { useEffect, useState, useCallback } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { Paper, Typography, Box, Chip } from '@mui/material';

const API = process.env.REACT_APP_API_BASE;

export default function AuditLogs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/admin/audit-logs?limit=500`, {
        credentials: 'include'
      });
      if (!r.ok) throw new Error('Failed to load audit logs');
      const data = await r.json();

      const mapped = data.logs.map((log) => ({
        id: log.id,
        admin_user: log.admin_user,
        action_type: log.action_type,
        timestamp: new Date(log.timestamp).toLocaleString(),
        timestampRaw: new Date(log.timestamp),
        status: log.status,
        summary: log.summary,
        details: log.details ? JSON.stringify(JSON.parse(log.details), null, 2) : '',
      }));

      setRows(mapped);
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      headerAlign: 'center',
      width: 180,
      sortComparator: (v1, v2, param1, param2) => {
        return param1.api.getCellValue(param1.id, 'timestampRaw') - param2.api.getCellValue(param2.id, 'timestampRaw');
      }
    },
    {
      field: 'admin_user',
      headerName: 'Admin User',
      headerAlign: 'center',
      width: 140
    },
    {
      field: 'action_type',
      headerName: 'Action Type',
      headerAlign: 'center',
      width: 150,
      renderCell: (params) => {
        const colorMap = {
          'user_modified': 'primary',
          'user_deleted': 'error',
          'database_upload': 'success',
          'term_update': 'warning',
        };
        return (
          <Chip
            label={params.value}
            color={colorMap[params.value] || 'default'}
            size="small"
          />
        );
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      headerAlign: 'center',
      flex: 1,
      minwidth: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Success' ? 'success' : 'error'}
          size="small"
        />
      )
    },
    {
      field: 'summary',
      headerName: 'Summary',
      headerAlign: 'center',
      flex: 2,
      minWidth: 250,
    },
    {
      field: 'details',
      headerName: 'Details',
      headerAlign: 'center',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <div style={{
          whiteSpace: 'pre-wrap',
          fontSize: '0.85em',
          fontFamily: 'monospace',
          overflow: 'auto',
          maxHeight: '100%',
        }}>
          {params.value}
        </div>
      )
    },
    {
      field: 'timestampRaw',
      headerName: 'Timestamp Raw',
      width: 0,
      hide: true
    },
  ];

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Typography variant="h5" gutterBottom>
        Admin Audit Logs
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
        Showing the 500 most recent admin actions. Use filters and search to find specific events.
      </Typography>

      <Box sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
        <DataGridPro
          sx={{
            '& .MuiDataGrid-cell': { textAlign: 'center' },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f9f9f9',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
              fontSize: '1.05em'
            },
          }}
          rows={rows}
          columns={columns}
          loading={loading}
          pagination
          initialState={{
            pagination: { paginationModel: { pageSize: 50, page: 0 } },
            density: 'compact',
            sorting: {
              sortModel: [{ field: 'timestampRaw', sort: 'desc' }],
            },
            columns: {
              columnVisibilityModel: {
                timestampRaw: false,
              },
            },
          }}
          pageSizeOptions={[25, 50, 100, { value: rows.length, label: 'All' }]}
          disableSelectionOnClick
          showToolbar
          headerFilters
          getRowHeight={() => 'auto'}
        />
      </Box>
    </Paper>
  );
}
