import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  AccountBalance,
  People,
  TrendingUp,
  Security,
  Speed,
  Support,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AuthStatus from './AuthStatus';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showAuthStatus, setShowAuthStatus] = useState(true);

  const features = [
    {
      icon: <AccountBalance sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Manajemen Keuangan',
      description: 'Sistem keuangan terintegrasi dengan Accurate.id untuk transparansi dan akuntabilitas penuh.',
    },
    {
      icon: <People sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Data Anggota Terpusat',
      description: 'Kelola data anggota dengan mudah dan aman, terintegrasi langsung dengan sistem HR.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Simulasi Pinjaman',
      description: 'Hitung dan simulasi pinjaman dengan sistem yang transparan dan mudah dipahami.',
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Keamanan Data',
      description: 'Enkripsi tingkat enterprise dan sistem keamanan berlapis untuk melindungi data sensitif.',
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Proses Cepat',
      description: 'Sistem persetujuan multilevel yang efisien untuk pengajuan pinjaman yang lebih cepat.',
    },
    {
      icon: <Support sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Dukungan 24/7',
      description: 'Tim support profesional siap membantu Anda kapan saja dibutuhkan.',
    },
  ];

  const stats = [
    { label: 'Total Anggota', value: '1,250+', color: 'primary' },
    { label: 'Pinjaman Aktif', value: 'Rp 2.5M', color: 'success' },
    { label: 'Simpanan', value: 'Rp 5.8M', color: 'info' },
    { label: 'Tingkat Kepuasan', value: '98%', color: 'warning' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Koperasi Pegawai Biro Klasifikasi Indonesia
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              color="primary"
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
              sx={{ borderRadius: 2 }}
            >
              Masuk
            </Button>
            <Button
              color="secondary"
              variant="outlined"
              onClick={() => navigate('/admin')}
              sx={{ borderRadius: 2 }}
            >
              Admin
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Authentication Status */}
      {showAuthStatus && (
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <AuthStatus onAuthComplete={() => setShowAuthStatus(false)} />
        </Container>
      )}

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 8,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Koperasi Digital
                <br />
                <Typography variant="h2" component="span" sx={{ color: '#ffeb3b' }}>
                  Masa Depan
                </Typography>
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Platform terintegrasi untuk mengelola keuangan koperasi dengan teknologi terdepan.
                Transparan, aman, dan mudah digunakan.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' },
                    px: 4,
                    py: 1.5,
                  }}
                  onClick={() => navigate('/login')}
                >
                  Mulai Sekarang
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Pelajari Lebih Lanjut
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 400,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 4,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <AccountBalance sx={{ fontSize: 120, opacity: 0.8 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom sx={{ mb: 4 }}>
          Pencapaian Kami
        </Typography>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Typography variant="h4" component="div" color={`${stat.color}.main`} sx={{ fontWeight: 'bold' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
            Fitur Unggulan
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Siap Bergabung dengan Koperasi Digital?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Daftar sekarang dan nikmati kemudahan mengelola keuangan koperasi dengan teknologi terdepan.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' },
              px: 6,
              py: 2,
            }}
            onClick={() => navigate('/login')}
          >
            Daftar Sekarang
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Koperasi Pegawai Biro Klasifikasi Indonesia
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Platform digital terintegrasi untuk mengelola keuangan koperasi dengan transparansi dan akuntabilitas penuh.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Kontak
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Email: info@koperasi-bki.id
                <br />
                Telepon: (021) 1234-5678
                <br />
                Alamat: Jakarta, Indonesia
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="body2" textAlign="center" sx={{ opacity: 0.6 }}>
              © 2024 Koperasi Pegawai Biro Klasifikasi Indonesia. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;