import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { api } from '../config/api';

const Share = () => {
  const { audioId } = useParams<{ audioId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToAudio = async () => {
      try {
        // Verify the audio exists
        await api.get(`/api/audio/${audioId}`);
        
        // Navigate to home with the specific audio index
        navigate('/', { state: { sharedAudioId: audioId } });
      } catch (error) {
        console.error('Error fetching shared audio:', error);
        navigate('/'); // Redirect to home if audio not found
      }
    };

    redirectToAudio();
  }, [audioId, navigate]);

  return (
    <Box className="fixed inset-0 flex items-center justify-center bg-black">
      <CircularProgress className="text-white" size={60} />
    </Box>
  );
};

export default Share; 