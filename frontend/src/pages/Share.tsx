import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { api } from '../config/api';

const Share = () => {
  const { audioId } = useParams<{ audioId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    const verifyAndRedirect = async () => {
      try {
        // Verify the audio exists
        await api.get(`/api/audio/${audioId}`);
        
        // Navigate to home with the specific audio index and prevent back navigation
        navigate('/', {
          replace: true,
          state: { sharedAudioId: audioId, fromShare: true }
        });
      } catch (error) {
        console.error('Error fetching shared audio:', error);
        setError(true);
      }
    };

    verifyAndRedirect();
  }, [audioId, navigate]);

  if (error) {
    return (
      <Box className="fixed inset-0 flex items-center justify-center bg-black text-white">
        Audio not found
      </Box>
    );
  }

  return (
    <Box className="fixed inset-0 flex items-center justify-center bg-black">
      <CircularProgress className="text-white" size={60} />
    </Box>
  );
};

export default Share; 