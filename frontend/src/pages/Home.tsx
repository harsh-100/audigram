import { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, IconButton } from '@mui/material';
import { Person, CloudUpload, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FullScreenAudioCard from '../components/FullScreenAudioCard';

interface Audio {
  id: string;
  title: string;
  description: string;
  filePath: string;
  user: {
    username: string;
    avatar?: string;
  };
  likes: number;
  comments: number;
  isLiked: boolean;
}

const Home = () => {
  const navigate = useNavigate();
  const [audios, setAudios] = useState<Audio[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    fetchAudios();

    // Add a click listener to detect first interaction
    const handleFirstInteraction = () => {
      setHasInteracted(true);
      // Remove the listener after first interaction
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const fetchAudios = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/audio/feed', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setAudios(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching audios:', error);
      setLoading(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaY = touchEndY - touchStartY.current;
    const deltaX = touchEndX - touchStartX.current;

    // Only handle vertical swipes if horizontal movement is minimal
    if (Math.abs(deltaX) < Math.abs(deltaY) && !isTransitioning) {
      if (deltaY < -50 && currentIndex < audios.length - 1) {
        setIsTransitioning(true);
        setCurrentIndex(prev => prev + 1);
        setTimeout(() => setIsTransitioning(false), 300);
      } else if (deltaY > 50 && currentIndex > 0) {
        setIsTransitioning(true);
        setCurrentIndex(prev => prev - 1);
        setTimeout(() => setIsTransitioning(false), 300);
      }
    }
  };

  const handleLike = async (audioId: string) => {
    try {
      await axios.post(
        `http://localhost:5000/api/audio/${audioId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      setAudios(prevAudios =>
        prevAudios.map(audio =>
          audio.id === audioId
            ? {
                ...audio,
                likes: audio.isLiked ? audio.likes - 1 : audio.likes + 1,
                isLiked: !audio.isLiked,
              }
            : audio
        )
      );
    } catch (error) {
      console.error('Error liking audio:', error);
    }
  };

  const handleComment = (audioId: string) => {
    // TODO: Implement comment functionality
    console.log('Comment clicked for audio:', audioId);
  };

  const handleUserClick = (username: string) => {
    // TODO: Navigate to user profile
    console.log('Navigate to user profile:', username);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleUploadClick = () => {
    navigate('/upload');
  };

  if (loading) {
    return (
      <Box className="fixed inset-0 flex items-center justify-center bg-black">
        <CircularProgress className="text-white" size={60} />
      </Box>
    );
  }

  if (audios.length === 0) {
    return (
      <Box className="fixed inset-0 flex items-center justify-center bg-black text-white">
        No audios found. Follow some users to see their content!
      </Box>
    );
  }

  return (
    <Box 
      className="fixed inset-0 bg-black overflow-hidden touch-none flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Box className="flex-1 relative overflow-hidden">
        <Box
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{
            transform: `translateY(-${currentIndex * 100}%)`,
          }}
        >
          {audios.map((audio, index) => (
            <Box
              key={audio.id}
              className="absolute inset-0 w-full h-full"
              style={{
                transform: `translateY(${index * 100}%)`,
              }}
            >
              <FullScreenAudioCard
                audio={audio}
                onLike={() => handleLike(audio.id)}
                onComment={() => handleComment(audio.id)}
                onUserClick={() => handleUserClick(audio.user.username)}
                isVisible={index === currentIndex}
                canAutoplay={hasInteracted}
              />
            </Box>
          ))}
        </Box>
      </Box>

      <Box 
        className="h-16 bg-black bg-opacity-95 border-t border-gray-800 flex justify-around items-center px-4"
        onClick={e => e.stopPropagation()} // Prevent swipe detection on bottom bar
      >
        <IconButton
          className="text-white hover:text-gray-300 transition-colors"
          sx={{ 
            color: 'white',
            '&:hover': { 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
          onClick={handleProfileClick}
        >
          <Person sx={{ fontSize: 28 }} />
        </IconButton>

        <IconButton
          className="text-white hover:text-gray-300 transition-colors"
          sx={{ 
            color: 'white',
            '&:hover': { 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
          onClick={handleUploadClick}
        >
          <CloudUpload sx={{ fontSize: 28 }} />
        </IconButton>

        <IconButton
          className="text-white hover:text-gray-300 transition-colors"
          sx={{ 
            color: 'white',
            '&:hover': { 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
          onClick={handleLogout}
        >
          <Logout sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Home; 