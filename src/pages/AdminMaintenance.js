import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Divider,
  Stack,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import UploadIcon from '@mui/icons-material/Upload';

const baseUrl = process.env.REACT_APP_API_URL;

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminMaintenance() {
  const [tabValue, setTabValue] = useState(0);
  const [environment, setEnvironment] = useState('PROD');
  const [tableType, setTableType] = useState('ClassSchedule');
  const [csvPath, setCsvPath] = useState('');
  const [validationLoading, setValidationLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  // Backend Changes Tab State
  const [currentTerm, setCurrentTerm] = useState('');
  const [newTerm, setNewTerm] = useState('');
  const [newTermName, setNewTermName] = useState('');
  const [previewResult, setPreviewResult] = useState(null);
  const [expandedFiles, setExpandedFiles] = useState({});

  const tableConfigs = {
    ClassSchedule: {
      table: 'dbo.ClassSchedule',
      defaultPath: 'C:\\Users\\tlorentsad\\Desktop\\MyDatabase\\ClassSchedule\\MM.dd\\ClassSchedule.csv',
    },
    MasterApplications: {
      table: 'dbo.MastersApplication',
      defaultPath: 'C:\\Users\\tlorentsad\\Desktop\\MyDatabase\\MastersApplication\\MM.dd\\MastersApplication.csv',
    },
    PhdApplications: {
      table: 'dbo.PhdApplication',
      defaultPath: 'C:\\Users\\tlorentsad\\Desktop\\MyDatabase\\PhdApplication\\MM.dd\\PhdApplication.csv',
    },
    StudentsData: {
      table: 'dbo.StudentsData',
      defaultPath: 'C:\\Users\\tlorentsad\\Desktop\\MyDatabase\\StudentsData\\MM.dd\\StudentsData.csv',
    },
  };

  const handleValidate = async () => {
    setValidationLoading(true);
    setError('');
    setValidationResult(null);
    setUploadResult(null);

    try {
      if (!csvPath.trim()) {
        throw new Error('Please provide a CSV file path');
      }

      const config = tableConfigs[tableType];
      // Remove surrounding quotes if user copy-pasted with quotes
      let cleanCsvPath = csvPath.trim();
      if (cleanCsvPath.startsWith('"') && cleanCsvPath.endsWith('"')) {
        cleanCsvPath = cleanCsvPath.slice(1, -1);
      }

      const payload = {
        environment,
        table: config.table,
        csv_path: cleanCsvPath,
        action: 'validate',
      };

      const response = await fetch(`${baseUrl}/api/admin/database-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Validation failed');
      }

      setValidationResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setValidationLoading(false);
    }
  };

  const handleUpload = async () => {
    setUploadLoading(true);
    setError('');
    setUploadResult(null);

    try {
      const config = tableConfigs[tableType];
      // Remove surrounding quotes if user copy-pasted with quotes
      let cleanCsvPath = csvPath.trim();
      if (cleanCsvPath.startsWith('"') && cleanCsvPath.endsWith('"')) {
        cleanCsvPath = cleanCsvPath.slice(1, -1);
      }

      const payload = {
        environment,
        table: config.table,
        csv_path: cleanCsvPath,
        action: 'upload',
      };

      const response = await fetch(`${baseUrl}/api/admin/database-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Upload failed');
      }

      setUploadResult(data);
      setValidationResult(null);
      setCsvPath('');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setValidationResult(null);
    setUploadResult(null);
  };

  const handlePreviewTermUpdate = async () => {
    setValidationLoading(true);
    setError('');
    setPreviewResult(null);
    setUploadResult(null);

    try {
      const payload = {
        current_term: currentTerm.trim(),
        new_term: newTerm.trim(),
        new_term_name: newTermName.trim(),
        confirm: false,
      };

      const response = await fetch(`${baseUrl}/api/admin/update-term`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Preview failed');
      }

      setPreviewResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setValidationLoading(false);
    }
  };

  const handleConfirmTermUpdate = async () => {
    setUploadLoading(true);
    setError('');

    try {
      const payload = {
        current_term: currentTerm.trim(),
        new_term: newTerm.trim(),
        new_term_name: newTermName.trim(),
        confirm: true,
      };

      const response = await fetch(`${baseUrl}/api/admin/update-term`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Update failed');
      }

      setUploadResult(data);
      setPreviewResult(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const isValidationSuccess = validationResult?.success === true;
  const isUploadSuccess = uploadResult?.success === true;

  return (
    <Paper elevation={3} sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Admin Maintenance
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tab label="Database Uploads" />
        <Tab label="Update Codebase" />
      </Tabs>

      {/* DATABASE UPLOADS TAB */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Upload CSV to Database
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Select your environment, table, and CSV file. Validate first, then upload if successful.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {uploadResult && isUploadSuccess && (
          <Alert
            severity="success"
            icon={<CheckCircleIcon />}
            sx={{ mb: 3 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              ✓ Upload Successful
            </Typography>
            <Typography variant="body2">
              {uploadResult.message}
            </Typography>
          </Alert>
        )}

        {uploadResult && !isUploadSuccess && (
          <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Upload Failed
            </Typography>
            <Typography variant="body2">
              {uploadResult.message}
            </Typography>
          </Alert>
        )}

        {/* FORM SECTION */}
        <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Upload Configuration
            </Typography>

            <Stack spacing={2}>
              {/* Environment */}
              <FormControl fullWidth size="small">
                <InputLabel>Environment</InputLabel>
                <Select
                  value={environment}
                  label="Environment"
                  onChange={(e) => setEnvironment(e.target.value)}
                >
                  <MenuItem value="DEV">DEV (EN4217770W\SQLEXPRESS)</MenuItem>
                  <MenuItem value="PROD">PROD (SCAI-SAMS\SQLEXPRESS)</MenuItem>
                </Select>
              </FormControl>

              {/* Table Type */}
              <FormControl fullWidth size="small">
                <InputLabel>Table</InputLabel>
                <Select
                  value={tableType}
                  label="Table"
                  onChange={(e) => setTableType(e.target.value)}
                >
                  <MenuItem value="ClassSchedule">ClassSchedule</MenuItem>
                  <MenuItem value="MasterApplications">Master Applications</MenuItem>
                  <MenuItem value="PhdApplications">PhD Applications</MenuItem>
                  <MenuItem value="StudentsData">Students Data</MenuItem>
                </Select>
              </FormControl>

              {/* CSV Path */}
              <TextField
                fullWidth
                label="CSV File Path"
                value={csvPath}
                onChange={(e) => setCsvPath(e.target.value)}
                placeholder={tableConfigs[tableType]?.defaultPath}
                size="small"
                multiline
                rows={2}
              />

              {/* Buttons */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={handleValidate}
                  disabled={validationLoading || uploadLoading || !csvPath.trim()}
                >
                  {validationLoading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Validating...
                    </>
                  ) : (
                    'Validate CSV'
                  )}
                </Button>

                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={handleUpload}
                  disabled={uploadLoading || !isValidationSuccess}
                  sx={{
                    backgroundColor: '#8c1d40',
                    '&:hover': { backgroundColor: '#701831' },
                  }}
                >
                  {uploadLoading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Uploading...
                    </>
                  ) : (
                    'Upload to Database'
                  )}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* VALIDATION RESULTS */}
        {validationResult && (
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
                {isValidationSuccess ? (
                  <CheckCircleIcon sx={{ color: 'green', fontSize: 28 }} />
                ) : (
                  <ErrorIcon sx={{ color: 'red', fontSize: 28 }} />
                )}
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {isValidationSuccess ? 'Validation Passed ✓' : 'Validation Failed ✗'}
                </Typography>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {validationResult.message}
              </Typography>

              {validationResult.details && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Details:
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                          <TableCell>Key</TableCell>
                          <TableCell>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(validationResult.details).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell>{String(value)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </TabPanel>

      {/* BACKEND CHANGES TAB */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Update Term Number
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Update term numbers across the entire codebase (backend models, routes, frontend components).
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* FORM SECTION */}
        <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Term Update Configuration
            </Typography>

            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Current Term Number"
                placeholder="e.g., 2261"
                value={currentTerm}
                onChange={(e) => setCurrentTerm(e.target.value)}
                size="small"
              />

              <TextField
                fullWidth
                label="New Term Number"
                placeholder="e.g., 2264"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                size="small"
              />

              <TextField
                fullWidth
                label="New Term Name"
                placeholder="e.g., Summer 2026"
                value={newTermName}
                onChange={(e) => setNewTermName(e.target.value)}
                size="small"
              />

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={handlePreviewTermUpdate}
                  disabled={validationLoading || !currentTerm.trim() || !newTerm.trim() || !newTermName.trim()}
                >
                  {validationLoading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Previewing...
                    </>
                  ) : (
                    'Preview Changes'
                  )}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* PREVIEW RESULTS */}
        {previewResult && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
                {previewResult.success ? (
                  <CheckCircleIcon sx={{ color: 'green', fontSize: 28 }} />
                ) : (
                  <ErrorIcon sx={{ color: 'red', fontSize: 28 }} />
                )}
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {previewResult.success ? 'Preview Successful ✓' : 'Preview Failed ✗'}
                </Typography>
              </Stack>

              <Typography variant="body2" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                {previewResult.message}
              </Typography>

              {previewResult.ready_to_confirm && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Files to be updated ({Object.keys(previewResult.preview).length}):
                  </Typography>
                  <TableContainer sx={{ maxHeight: 600 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                          <TableCell width="30"></TableCell>
                          <TableCell><strong>File</strong></TableCell>
                          <TableCell align="center"><strong>Changes</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(previewResult.preview).map(([file, changes]) => {
                          // Extract relative path for display
                          const displayPath = file.includes('py-student-ui')
                            ? 'src/' + file.split('src\\')[1] || file.split('src/')[1]
                            : file.includes('StudentApi')
                            ? file.split('StudentApi\\')[1] || file.split('StudentApi/')[1]
                            : file;

                          const isExpanded = expandedFiles[file];

                          return (
                            <>
                              <TableRow
                                key={file}
                                onClick={() => setExpandedFiles({ ...expandedFiles, [file]: !isExpanded })}
                                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f9f9f9' } }}
                              >
                                <TableCell>{isExpanded ? '▼' : '▶'}</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{displayPath}</TableCell>
                                <TableCell align="center">{changes.length}</TableCell>
                              </TableRow>
                              {isExpanded && changes.map((change, idx) => (
                                <TableRow key={`${file}-${idx}`} sx={{ backgroundColor: '#fafafa' }}>
                                  <TableCell colSpan="3">
                                    <Box sx={{ pl: 2, py: 1 }}>
                                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666' }}>
                                        Line {change.line_number}:
                                      </Typography>
                                      <Box sx={{ mt: 0.5, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                        <Box sx={{ color: '#d32f2f', mb: 0.5 }}>
                                          - {change.old_line}
                                        </Box>
                                        <Box sx={{ color: '#388e3c' }}>
                                          + {change.old_line.replace(currentTerm, newTerm)}
                                        </Box>
                                      </Box>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: '#8c1d40',
                        '&:hover': { backgroundColor: '#701831' },
                      }}
                      onClick={handleConfirmTermUpdate}
                      disabled={uploadLoading}
                    >
                      {uploadLoading ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Applying...
                        </>
                      ) : (
                        'Apply Changes'
                      )}
                    </Button>
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* UPDATE RESULTS */}
        {uploadResult && uploadResult.summary && (
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
                {uploadResult.success ? (
                  <CheckCircleIcon sx={{ color: 'green', fontSize: 28 }} />
                ) : (
                  <ErrorIcon sx={{ color: 'red', fontSize: 28 }} />
                )}
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {uploadResult.success ? 'Update Complete ✓' : 'Update Failed ✗'}
                </Typography>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" sx={{ mb: 3 }}>
                {uploadResult.message}
              </Typography>

              <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Summary:
                </Typography>
                <Typography variant="body2">• Files updated: {uploadResult.summary.files_updated}</Typography>
                <Typography variant="body2">• Total changes: {uploadResult.summary.total_changes}</Typography>
                <Typography variant="body2">• Current term: {uploadResult.summary.current_term}</Typography>
                <Typography variant="body2">• New term: {uploadResult.summary.new_term}</Typography>
                <Typography variant="body2">• New term name: {uploadResult.summary.new_term_name}</Typography>
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Updated Files:
              </Typography>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                      <TableCell><strong>File</strong></TableCell>
                      <TableCell align="center"><strong>Changes</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(uploadResult.updated_files).map(([file, changes]) => {
                      // Extract relative path for display
                      const displayPath = file.includes('py-student-ui')
                        ? 'src/' + file.split('src\\')[1] || file.split('src/')[1]
                        : file.includes('StudentApi')
                        ? file.split('StudentApi\\')[1] || file.split('StudentApi/')[1]
                        : file;
                      return (
                        <TableRow key={file}>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{displayPath}</TableCell>
                          <TableCell align="center">{Array.isArray(changes) ? changes.length : 0}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </TabPanel>
    </Paper>
  );
}
