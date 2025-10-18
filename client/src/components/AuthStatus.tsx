import React, { useState, useEffect } from 'react';
import {
  Alert,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Refresh,
} from '@mui/icons-material';
import api from '../services/api';

interface AuthStatusProps {
  onAuthComplete?: () => void;
}

const AuthStatus: React.FC<AuthStatusProps> = ({ onAuthComplete }) => {
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'not_authenticated'>('checking');
  const [message, setMessage] = useState('');
  const [authUrl, setAuthUrl] = useState('');

  const checkAuthStatus = async () => {
    setStatus('checking');
    try {
      const response = await api.get('/auth-status');
      setStatus('authenticated');
      setMessage(response.data.message);
      if (onAuthComplete) {
        onAuthComplete();
      }
    } catch (error: any) {
      setStatus('not_authenticated');
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

  if (status === 'checking') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Box textAlign="center">
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Checking Accurate.id authentication...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (status === 'authenticated') {
    return (
      <Alert 
        severity="success" 
        icon={<CheckCircle />}
        action={
          <Button color="inherit" size="small" onClick={checkAuthStatus} startIcon={<Refresh />}>
            Refresh
          </Button>
        }
      >
        {message}
      </Alert>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Alert 
          severity="warning" 
          icon={<Error />}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" gutterBottom>
            Accurate.id Authentication Required
          </Typography>
          <Typography variant="body2">
            {message}
          </Typography>
        </Alert>
        
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The application needs to be authenticated with Accurate.id to access employee data and financial information.
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleAuthenticate}
            sx={{ mr: 2 }}
          >
            Authenticate with Accurate.id
          </Button>
          
          <Button
            variant="outlined"
            onClick={checkAuthStatus}
            startIcon={<Refresh />}
          >
            Check Again
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AuthStatus;