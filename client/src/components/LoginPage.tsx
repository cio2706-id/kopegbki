import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Login as LoginIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

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
      id={`login-tabpanel-${index}`}
      aria-labelledby={`login-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const LoginPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setUsername('');
    setPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/login', {
        username,
        password,
      });

      if (response.data.success) {
        login(response.data.token, {
          id: response.data.user.id,
          name: response.data.user.name,
          userType: response.data.userType,
        });

        // Navigate based on user type
        if (response.data.userType === 'anggota') {
          navigate('/anggota/dashboard');
        } else {
          navigate('/pengurus/dashboard');
        }
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Grid container spacing={4} alignItems="center">
          {/* Left side - Branding */}
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: isMobile ? 'center' : 'left', mb: 4 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 2,
                }}
              >
                Koperasi Digital
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  mb: 4,
                }}
              >
                Platform Terintegrasi untuk Mengelola Keuangan Koperasi
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  <Typography variant="body1">Login Anggota</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                  <AdminIcon sx={{ mr: 1 }} />
                  <Typography variant="body1">Login Pengurus</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right side - Login Form */}
          <Grid item xs={12} md={6}>
            <Paper elevation={10} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 'bold',
                    },
                  }}
                >
                  <Tab
                    icon={<PersonIcon />}
                    iconPosition="start"
                    label="Anggota"
                    id="login-tab-0"
                    aria-controls="login-tabpanel-0"
                  />
                  <Tab
                    icon={<AdminIcon />}
                    iconPosition="start"
                    label="Pengurus"
                    id="login-tab-1"
                    aria-controls="login-tabpanel-1"
                  />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Login Anggota
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Masuk untuk mengakses dashboard anggota dan mengelola data pribadi
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleLogin}>
                  <TextField
                    fullWidth
                    label="Nama Lengkap"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    margin="normal"
                    required
                    disabled={loading}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required
                    disabled={loading}
                    sx={{ mb: 3 }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                    sx={{ py: 1.5, mb: 2 }}
                  >
                    {loading ? 'Memproses...' : 'Masuk sebagai Anggota'}
                  </Button>
                </form>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Gunakan nama lengkap yang terdaftar di sistem
                  </Typography>
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Login Pengurus
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Masuk untuk mengakses dashboard pengurus dan mengelola sistem
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleLogin}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    margin="normal"
                    required
                    disabled={loading}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required
                    disabled={loading}
                    sx={{ mb: 3 }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                    sx={{ py: 1.5, mb: 2 }}
                  >
                    {loading ? 'Memproses...' : 'Masuk sebagai Pengurus'}
                  </Button>
                </form>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Gunakan kredensial admin yang telah diberikan
                  </Typography>
                </Box>
              </TabPanel>
            </Paper>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/')}
                sx={{ color: 'white' }}
              >
                Kembali ke Beranda
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LoginPage;