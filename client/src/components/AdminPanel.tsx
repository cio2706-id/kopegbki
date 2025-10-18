import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import {
  AdminPanelSettings,
  CheckCircle,
  Error,
  Refresh,
  OpenInNew,
} from '@mui/icons-material';
import api from '../services/api';

const AdminPanel: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'not_authenticated'>('checking');
  const [message, setMessage] = useState('');
  const [authUrl, setAuthUrl] = useState('');

  const checkAuthStatus = async () => {
    setAuthStatus('checking');
    try {
      const response = await api.get('/auth-status');
      setAuthStatus('authenticated');
      setMessage(response.data.message);
    } catch (error: any) {
      setAuthStatus('not_authenticated');
      setMessage(error.response?.data?.message || 'Authentication check failed');
      setAuthUrl(error.response?.data?.authUrl || '');
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleAuthenticate = () => {
    if (authUrl) {
      window.open(authUrl, '_blank');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <AdminPanelSettings sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Admin Panel
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage Accurate.id Integration
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Authentication Status
              </Typography>
              
              {authStatus === 'checking' && (
                <Box display="flex" alignItems="center" py={2}>
                  <CircularProgress size={20} sx={{ mr: 2 }} />
                  <Typography>Checking authentication status...</Typography>
                </Box>
              )}

              {authStatus === 'authenticated' && (
                <Alert 
                  severity="success" 
                  icon={<CheckCircle />}
                  action={
                    <Button color="inherit" size="small" onClick={checkAuthStatus} startIcon={<Refresh />}>
                      Refresh
                    </Button>
                  }
                >
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    ✅ Accurate.id is Authenticated
                  </Typography>
                  <Typography variant="body2">
                    {message}
                  </Typography>
                </Alert>
              )}

              {authStatus === 'not_authenticated' && (
                <Alert 
                  severity="warning" 
                  icon={<Error />}
                  action={
                    <Button color="inherit" size="small" onClick={checkAuthStatus} startIcon={<Refresh />}>
                      Refresh
                    </Button>
                  }
                >
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    ⚠️ Authentication Required
                  </Typography>
                  <Typography variant="body2">
                    {message}
                  </Typography>
                </Alert>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quick Actions
              </Typography>
              
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAuthenticate}
                  disabled={!authUrl}
                  startIcon={<OpenInNew />}
                >
                  Authenticate with Accurate.id
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={checkAuthStatus}
                  startIcon={<Refresh />}
                >
                  Check Status
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Information
              </Typography>
              
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                <Typography variant="body2" paragraph>
                  <strong>One-time Authentication:</strong> Once you authenticate with Accurate.id, 
                  the application will store your access token and use it for all future API calls. 
                  You won't need to authenticate again unless the token expires.
                </Typography>
                
                <Typography variant="body2" paragraph>
                  <strong>Token Storage:</strong> Your authentication tokens are stored securely 
                  in a local file (.accurate-tokens.json) and are not shared with any third parties.
                </Typography>
                
                <Typography variant="body2">
                  <strong>Security:</strong> The tokens are used only to access your Accurate.id 
                  data and are automatically refreshed when needed.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminPanel;