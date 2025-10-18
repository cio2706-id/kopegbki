import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  AdminPanelSettings,
  People,
  CreditCard,
  CheckCircle,
  Close,
  Pending,
  Logout,
  FilterList,
  Refresh,
  TrendingUp,
  AccountBalance,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  salary: number;
  utang: number;
  joinDate: string;
  email: string;
  phone: string;
}

interface LoanApplication {
  id: number;
  employeeId: number;
  memberName: string;
  amount: number;
  tenure: number;
  status: string;
  createdAt: string;
  approver_level_1_id?: number;
  approver_level_2_id?: number;
  approver_level_3_id?: number;
  approver_level_4_id?: number;
  rejectionReason?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pengurus-tabpanel-${index}`}
      aria-labelledby={`pengurus-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PengurusDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch employees
      const employeesResponse = await api.get('/employees');
      setEmployees(employeesResponse.data);

      // Fetch loan applications
      const loansResponse = await api.get('/loan-applications');
      setLoanApplications(loansResponse.data);
    } catch (err: any) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleApprovalAction = (application: LoanApplication, action: 'approve' | 'reject') => {
    setSelectedApplication(application);
    setApprovalAction(action);
    setRejectionReason('');
    setApprovalDialogOpen(true);
  };

  const handleApprovalSubmit = async () => {
    if (!selectedApplication) return;

    setProcessing(true);
    try {
      const payload: any = { action: approvalAction };
      
      if (approvalAction === 'reject' && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }

      await api.patch(`/loan-applications/${selectedApplication.id}`, payload);

      setApprovalDialogOpen(false);
      setSelectedApplication(null);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process approval');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING_STAFF_APPROVAL':
        return 'warning';
      case 'PENDING_MANAGER_APPROVAL':
        return 'info';
      case 'PENDING_BENDAHARA_APPROVAL':
        return 'secondary';
      case 'PENDING_KETUA_APPROVAL':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle />;
      case 'REJECTED':
        return <Close />;
      default:
        return <Pending />;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredLoanApplications = filterStatus === 'all' 
    ? loanApplications 
    : loanApplications.filter(app => app.status === filterStatus);

  const employeeColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Nama', width: 200 },
    { field: 'position', headerName: 'Posisi', width: 150 },
    { field: 'department', headerName: 'Departemen', width: 150 },
    { field: 'salary', headerName: 'Gaji', width: 120, renderCell: (params) => formatCurrency(params.value) },
    { field: 'utang', headerName: 'Sisa Pinjaman', width: 150, renderCell: (params) => formatCurrency(params.value) },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Telepon', width: 150 },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Dashboard Pengurus
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Selamat datang, {user?.name}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <People color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {employees.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Anggota
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <CreditCard color="warning" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {loanApplications.filter(app => app.status === 'PENDING_STAFF_APPROVAL').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Menunggu Persetujuan
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <CheckCircle color="success" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {loanApplications.filter(app => app.status === 'APPROVED').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Disetujui
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AccountBalance color="info" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(loanApplications.reduce((sum, app) => sum + app.amount, 0))}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Pinjaman
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant={isMobile ? 'scrollable' : 'fullWidth'}>
              <Tab label="Data Anggota" id="pengurus-tab-0" />
              <Tab label="Persetujuan Pinjaman" id="pengurus-tab-1" />
            </Tabs>
          </Box>

          {/* Data Anggota Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={employees}
                columns={employeeColumns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                sx={{
                  border: 0,
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f0f0f0',
                  },
                }}
              />
            </Box>
          </TabPanel>

          {/* Persetujuan Pinjaman Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filter Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Filter Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">Semua Status</MenuItem>
                  <MenuItem value="PENDING_STAFF_APPROVAL">Menunggu Staff</MenuItem>
                  <MenuItem value="PENDING_MANAGER_APPROVAL">Menunggu Manager</MenuItem>
                  <MenuItem value="PENDING_BENDAHARA_APPROVAL">Menunggu Bendahara</MenuItem>
                  <MenuItem value="PENDING_KETUA_APPROVAL">Menunggu Ketua</MenuItem>
                  <MenuItem value="APPROVED">Disetujui</MenuItem>
                  <MenuItem value="REJECTED">Ditolak</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchData}
                size="small"
              >
                Refresh
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Tanggal</strong></TableCell>
                    <TableCell><strong>Nama Anggota</strong></TableCell>
                    <TableCell><strong>Jumlah</strong></TableCell>
                    <TableCell><strong>Tenor</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Aksi</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLoanApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        {new Date(application.createdAt).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>{application.memberName}</TableCell>
                      <TableCell>{formatCurrency(application.amount)}</TableCell>
                      <TableCell>{application.tenure} bulan</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(application.status)}
                          label={getStatusLabel(application.status)}
                          color={getStatusColor(application.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {application.status !== 'APPROVED' && application.status !== 'REJECTED' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={() => handleApprovalAction(application, 'approve')}
                            >
                              Setujui
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              startIcon={<Close />}
                              onClick={() => handleApprovalAction(application, 'reject')}
                            >
                              Tolak
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredLoanApplications.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Tidak ada data pengajuan pinjaman
                </Typography>
              </Box>
            )}
          </TabPanel>
        </Card>
      </Container>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {approvalAction === 'approve' ? 'Setujui Pengajuan Pinjaman' : 'Tolak Pengajuan Pinjaman'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Detail Pengajuan:
              </Typography>
              <Typography variant="body2">
                <strong>Nama:</strong> {selectedApplication.memberName}
              </Typography>
              <Typography variant="body2">
                <strong>Jumlah:</strong> {formatCurrency(selectedApplication.amount)}
              </Typography>
              <Typography variant="body2">
                <strong>Tenor:</strong> {selectedApplication.tenure} bulan
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {getStatusLabel(selectedApplication.status)}
              </Typography>
            </Box>
          )}

          {approvalAction === 'reject' && (
            <TextField
              fullWidth
              label="Alasan Penolakan"
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              margin="normal"
              required
              disabled={processing}
              helperText="Berikan alasan yang jelas untuk penolakan pengajuan"
            />
          )}

          {approvalAction === 'approve' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Pastikan data pengajuan sudah benar sebelum menyetujui. Setelah disetujui, pinjaman akan diproses secara otomatis.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)} disabled={processing}>
            Batal
          </Button>
          <Button
            onClick={handleApprovalSubmit}
            variant="contained"
            color={approvalAction === 'approve' ? 'success' : 'error'}
            disabled={processing || (approvalAction === 'reject' && !rejectionReason)}
            startIcon={processing ? <CircularProgress size={20} /> : (approvalAction === 'approve' ? <CheckCircle /> : <Close />)}
          >
            {processing ? 'Memproses...' : (approvalAction === 'approve' ? 'Setujui' : 'Tolak')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PengurusDashboard;