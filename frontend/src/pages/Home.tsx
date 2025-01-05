import { CloudUpload, Logout, Person } from '@mui/icons-material';
import { Box, CircularProgress, IconButton, Button } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FullScreenAudioCard from '../components/FullScreenAudioCard';
import { api } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

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
  const { user, logout } = useAuth();
  const [audios, setAudios] = useState<Audio[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAudios();
        
        // Handle shared audio
        const sharedAudioId = (location.state as { sharedAudioId?: string })?.sharedAudioId;
        if (sharedAudioId) {
          const audioIndex = audios.findIndex(audio => audio.id === sharedAudioId);
          if (audioIndex !== -1) {
            setCurrentIndex(audioIndex);
          }
          // Clear the state after using it
          navigate('/', { replace: true, state: {} });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Add interaction detection
    const handleFirstInteraction = () => {
      setHasInteracted(true);
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [location.state, navigate]);

  const fetchAudios = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await api.get('/api/audio/feed', { headers });

      const transformedAudios = response.data.map(audio => ({
        id: audio.id,
        title: audio.title,
        description: audio.description,
        filePath: audio.filePath,
        user: {
          username: audio.user.username,
          avatar: audio.user.avatar,
        },
        likes: audio._count.likes,
        comments: audio._count.comments,
        isLiked: audio.likes?.length > 0 || false,
      }));

      setAudios(transformedAudios);
    } catch (error) {
      console.error('Error fetching audios:', error);
    } finally {
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

  const handleAuthRequired = () => {
    // Save current audio index to localStorage before redirecting
    localStorage.setItem('lastViewedAudio', currentIndex.toString());
    navigate('/login');
  };

  const handleLike = async (audioId: string) => {
    if (!user) {
      handleAuthRequired();
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        `/api/audio/${audioId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the audio's like status and count
      setAudios((prevAudios) =>
        prevAudios.map((audio) =>
          audio.id === audioId
            ? {
                ...audio,
                isLiked: response.data.liked,
                likes: response.data.liked
                  ? audio.likes + 1
                  : Math.max(0, audio.likes - 1), // Ensure likes don't go negative
              }
            : audio
        )
      );
    } catch (error) {
      console.error('Error liking audio:', error);
    }
  };

  const handleComment = (audioId: string) => {
    if (!user) {
      handleAuthRequired();
      return;
    }
    setAudios((prevAudios) =>
      prevAudios.map((audio) =>
        audio.id === audioId
          ? {
              ...audio,
              comments: audio.comments + 1,
            }
          : audio
      )
    );
  };

  const handleUserClick = (username: string) => {
    navigate(`/profile/${username}`);
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleProfileClick = () => {
    if (user) {
      navigate(`/profile/${user.username}`);
    }
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

  return (
    <Box className="fixed inset-0 bg-black overflow-hidden touch-none flex flex-col">
      <Box 
        className="flex-1 relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {audios.length === 0 ? (
          <Box className="fixed inset-0 flex items-center justify-center text-white text-lg">
            No audios found. Follow some users to see their content!
          </Box>
        ) : (
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
        )}
      </Box>

      <Box 
        className="h-16 bg-black bg-opacity-95 border-t border-gray-800 flex justify-around items-center px-4"
        onClick={e => e.stopPropagation()}
      >
        {user ? (
          <>
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
              onClick={handleLogoutClick}
            >
              <Logout sx={{ fontSize: 28 }} />
            </IconButton>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
            className="w-32"
          >
            Login
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Home; 