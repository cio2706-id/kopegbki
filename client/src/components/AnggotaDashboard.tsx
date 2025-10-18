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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  AccountBalance,
  Person,
  CreditCard,
  Savings,
  Add,
  Logout,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Pending,
  Close,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface DashboardData {
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
  amount: number;
  tenure: number;
  status: string;
  createdAt: string;
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
      id={`anggota-tabpanel-${index}`}
      aria-labelledby={`anggota-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AnggotaDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [loanAmount, setLoanAmount] = useState('');
  const [loanTenure, setLoanTenure] = useState('');
  const [submittingLoan, setSubmittingLoan] = useState(false);
  const [loanError, setLoanError] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
    fetchLoanApplications();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard-data');
      setDashboardData(response.data);
    } catch (err: any) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanApplications = async () => {
    try {
      const response = await api.get('/loan-applications');
      setLoanApplications(response.data);
    } catch (err: any) {
      console.error('Failed to fetch loan applications:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLoanSubmit = async () => {
    if (!loanAmount || !loanTenure) {
      setLoanError('Please fill in all fields');
      return;
    }

    setSubmittingLoan(true);
    setLoanError('');

    try {
      await api.post('/loan-applications', {
        amount: parseFloat(loanAmount),
        tenure: parseInt(loanTenure),
      });

      setLoanDialogOpen(false);
      setLoanAmount('');
      setLoanTenure('');
      fetchLoanApplications();
    } catch (err: any) {
      setLoanError(err.response?.data?.message || 'Failed to submit loan application');
    } finally {
      setSubmittingLoan(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'warning';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateMonthlyPayment = (amount: number, tenure: number) => {
    // Simple calculation - in real app, this would use proper loan calculation
    const monthlyRate = 0.01; // 1% monthly interest
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                          (Math.pow(1 + monthlyRate, tenure) - 1);
    return monthlyPayment;
  };

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
            Dashboard Anggota
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Selamat datang, {user?.name}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
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
                  <Person color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {dashboardData?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dashboardData?.position || 'N/A'}
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
                  <CreditCard color="error" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(dashboardData?.utang || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sisa Pinjaman
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
                  <Savings color="success" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      Rp 0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Simpanan (Coming Soon)
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
                      {formatCurrency(dashboardData?.salary || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Gaji Pokok
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
              <Tab label="Data Pribadi" id="anggota-tab-0" />
              <Tab label="Sisa Pinjaman" id="anggota-tab-1" />
              <Tab label="Simpanan" id="anggota-tab-2" />
              <Tab label="Pengajuan Pinjaman" id="anggota-tab-3" />
            </Tabs>
          </Box>

          {/* Data Pribadi Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Informasi Personal
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Nama Lengkap</strong></TableCell>
                        <TableCell>{dashboardData?.name || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Posisi</strong></TableCell>
                        <TableCell>{dashboardData?.position || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Departemen</strong></TableCell>
                        <TableCell>{dashboardData?.department || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell>{dashboardData?.email || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Telepon</strong></TableCell>
                        <TableCell>{dashboardData?.phone || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Tanggal Bergabung</strong></TableCell>
                        <TableCell>{dashboardData?.joinDate || 'N/A'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Informasi Keuangan
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Gaji Pokok</strong></TableCell>
                        <TableCell>{formatCurrency(dashboardData?.salary || 0)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Sisa Pinjaman</strong></TableCell>
                        <TableCell>
                          <Typography color={dashboardData?.utang ? 'error.main' : 'success.main'}>
                            {formatCurrency(dashboardData?.utang || 0)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Simpanan</strong></TableCell>
                        <TableCell>Rp 0 (Coming Soon)</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Sisa Pinjaman Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CreditCard sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                {formatCurrency(dashboardData?.utang || 0)}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Sisa Pinjaman
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboardData?.utang ? 'Anda memiliki pinjaman yang belum lunas' : 'Tidak ada pinjaman aktif'}
              </Typography>
            </Box>
          </TabPanel>

          {/* Simpanan Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Savings sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Fitur Simpanan
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Coming Soon
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fitur simpanan akan segera hadir untuk memberikan kemudahan dalam mengelola tabungan anggota.
              </Typography>
            </Box>
          </TabPanel>

          {/* Pengajuan Pinjaman Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Pengajuan Pinjaman
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setLoanDialogOpen(true)}
                sx={{ borderRadius: 2 }}
              >
                Ajukan Pinjaman
              </Button>
            </Box>

            {loanApplications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Belum ada pengajuan pinjaman
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Klik tombol "Ajukan Pinjaman" untuk membuat pengajuan baru
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Tanggal</strong></TableCell>
                      <TableCell><strong>Jumlah</strong></TableCell>
                      <TableCell><strong>Tenor</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loanApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          {new Date(application.createdAt).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>{formatCurrency(application.amount)}</TableCell>
                        <TableCell>{application.tenure} bulan</TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(application.status)}
                            label={application.status.replace(/_/g, ' ')}
                            color={getStatusColor(application.status) as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </Card>
      </Container>

      {/* Loan Application Dialog */}
      <Dialog open={loanDialogOpen} onClose={() => setLoanDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Ajukan Pinjaman Baru
          </Typography>
        </DialogTitle>
        <DialogContent>
          {loanError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loanError}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Jumlah Pinjaman (Rp)"
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            margin="normal"
            required
            disabled={submittingLoan}
            helperText="Masukkan jumlah pinjaman yang diinginkan"
          />

          <TextField
            fullWidth
            label="Tenor (Bulan)"
            type="number"
            value={loanTenure}
            onChange={(e) => setLoanTenure(e.target.value)}
            margin="normal"
            required
            disabled={submittingLoan}
            helperText="Masukkan jangka waktu pinjaman dalam bulan"
          />

          {loanAmount && loanTenure && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Simulasi Pembayaran:
              </Typography>
              <Typography variant="body2">
                <strong>Angsuran per bulan:</strong> {formatCurrency(calculateMonthlyPayment(parseFloat(loanAmount), parseInt(loanTenure)))}
              </Typography>
              <Typography variant="body2">
                <strong>Total pembayaran:</strong> {formatCurrency(calculateMonthlyPayment(parseFloat(loanAmount), parseInt(loanTenure)) * parseInt(loanTenure))}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoanDialogOpen(false)} disabled={submittingLoan}>
            Batal
          </Button>
          <Button
            onClick={handleLoanSubmit}
            variant="contained"
            disabled={submittingLoan || !loanAmount || !loanTenure}
            startIcon={submittingLoan ? <CircularProgress size={20} /> : <Add />}
          >
            {submittingLoan ? 'Mengirim...' : 'Ajukan Pinjaman'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnggotaDashboard;