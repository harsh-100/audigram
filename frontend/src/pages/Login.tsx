import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginInput, password);
      
      // Check if there was a saved audio index
      const lastViewedAudio = localStorage.getItem('lastViewedAudio');
      localStorage.removeItem('lastViewedAudio'); // Clean up
      
      if (lastViewedAudio) {
        navigate('/', { state: { audioIndex: parseInt(lastViewedAudio) } });
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="max-w-md mx-auto">
      <Typography variant="h4" component="h1" className="mb-6 text-center">
        Login to Your Account
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Email or Username"
          fullWidth
          value={loginInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setLoginInput(e.target.value)}
          required
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <Box className="mt-4 text-center">
          <Typography variant="body2" color="textSecondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Register here
            </Link>
          </Typography>
        </Box>
      </form>
    </Box>
  );
};

export default Login; 