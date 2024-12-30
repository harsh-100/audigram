import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register(email, username, password);
      navigate('/');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <Box className="max-w-md mx-auto">
      <Typography variant="h4" component="h1" className="mb-6 text-center">
        Create an Account
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Username"
          fullWidth
          value={username}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
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
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          value={confirmPassword}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
        >
          Register
        </Button>
      </form>
    </Box>
  );
};

export default Register; 