import { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Avatar,
  CircularProgress,
  TextField,
  Button,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment,
  MusicNote,
  Close,
  Send,
} from '@mui/icons-material';
import WaveSurfer from 'wavesurfer.js';
import AnimatedGradient from './AnimatedGradient';
import axios from 'axios';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

interface FullScreenAudioCardProps {
  audio: {
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
  };
  onLike: () => void;
  onComment: () => void;
  onUserClick: () => void;
  isVisible: boolean;
  canAutoplay: boolean;
}

// Add color generation function at the top level
const generateRandomColors = () => {
  const colors = [
    ['#FF416C', '#FF4B2B'], // Red-Orange
    ['#833ab4', '#fd1d1d', '#fcb045'], // Instagram
    ['#4158D0', '#C850C0', '#FFCC70'], // Purple-Pink-Yellow
    ['#0093E9', '#80D0C7'], // Blue-Cyan
    ['#8EC5FC', '#E0C3FC'], // Light Blue-Purple
    ['#D9AFD9', '#97D9E1'], // Pink-Cyan
    ['#00DBDE', '#FC00FF'], // Cyan-Magenta
    ['#FEE140', '#FA709A'], // Yellow-Pink
    ['#3EECAC', '#EE74E1'], // Green-Pink
    ['#FA8BFF', '#2BD2FF', '#2BFF88'], // Pink-Blue-Green
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const FullScreenAudioCard = ({
  audio,
  onLike,
  onComment,
  onUserClick,
  isVisible,
  canAutoplay,
}: FullScreenAudioCardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [gradientColors] = useState(() => generateRandomColors());
  const [progress, setProgress] = useState(0);

  // Initialize WaveSurfer
  useEffect(() => {
    if (waveformRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgba(255, 255, 255, 0.5)',
        progressColor: '#fff',
        cursorColor: 'transparent',
        barWidth: 2,
        barGap: 3,
        height: 100,
        barRadius: 3,
        normalize: true,
        interact: false,
      });

      const audioUrl = `http://localhost:5000/${audio.filePath.startsWith('/') ? audio.filePath.slice(1) : audio.filePath}`;
      wavesurferRef.current.load(audioUrl);

      wavesurferRef.current.on('ready', () => {
        setIsLoading(false);
        if (isVisible && canAutoplay) {
          wavesurferRef.current?.play();
        }
      });

      wavesurferRef.current.on('audioprocess', () => {
        if (wavesurferRef.current) {
          setProgress(wavesurferRef.current.getCurrentTime() / wavesurferRef.current.getDuration() * 100);
        }
      });

      wavesurferRef.current.on('finish', () => {
        if (wavesurferRef.current && isVisible) {
          wavesurferRef.current.play();
        }
      });

      wavesurferRef.current.on('error', (err) => {
        console.error('WaveSurfer error:', err);
        setIsLoading(false);
      });
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [audio.filePath, isVisible, canAutoplay]);

  // Handle visibility changes
  useEffect(() => {
    if (!wavesurferRef.current || isLoading) return;

    if (isVisible && canAutoplay) {
      wavesurferRef.current.play();
    } else {
      wavesurferRef.current.pause();
    }
  }, [isVisible, canAutoplay, isLoading]);

  const handleCommentClick = async () => {
    setShowComments(true);
    await fetchComments();
  };

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/audio/${audio.id}/comments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || isPostingComment) return;

    setIsPostingComment(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/audio/${audio.id}/comment`,
        { content: commentText },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setComments(prev => [response.data, ...prev]);
      setCommentText('');
      onComment(); // Update comment count in parent component
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePostComment();
    }
  };

  const handleLikeClick = () => {
    // Just call the parent's onLike handler
    onLike();
  };

  return (
    <Box className="absolute inset-0">
      {/* Animated Gradient Background */}
      {isVisible && <AnimatedGradient colors={gradientColors} />}

      {/* Semi-transparent overlay for better readability */}
      <Box className="absolute inset-0 bg-black bg-opacity-30" />

      {/* Audio visualization */}
      <Box 
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
        style={{ opacity: isLoading ? 0 : 1 }}
      >
        <Box className="w-full px-6">
          <div 
            ref={waveformRef} 
            className="w-full transition-transform duration-300"
            style={{ 
              transform: !isLoading ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        </Box>
      </Box>

      {/* Loading spinner */}
      {isLoading && (
        <Box className="absolute inset-0 flex items-center justify-center">
          <CircularProgress size={60} className="text-white" />
        </Box>
      )}

      {/* Bottom container for user info and actions */}
      <Box className="absolute bottom-16 left-0 right-0 flex items-end justify-between px-4 pb-2">
        {/* User info */}
        <Box className="flex-1 text-white p-4">
          <Box className="flex items-center gap-2 mb-2">
            <MusicNote className="text-sm" />
            <Typography variant="body1" className="font-semibold drop-shadow-lg">
              {audio.title}
            </Typography>
          </Box>
          <Typography 
            variant="body2" 
            className="opacity-80 font-medium drop-shadow-lg hover:underline cursor-pointer"
            onClick={() => onUserClick()}
          >
            @{audio.user.username}
          </Typography>
          <Typography variant="body2" className="opacity-60 mt-1 drop-shadow-lg">
            {audio.description}
          </Typography>
        </Box>

        {/* Action buttons */}
        <Box className="flex flex-col gap-4 items-center p-4">
          <Box className="flex flex-col items-center">
            <IconButton 
              onClick={handleLikeClick} 
              className="text-white transform transition-transform duration-200 hover:scale-110"
            >
              {audio.isLiked ? (
                <Favorite className="text-red-500" fontSize="large" />
              ) : (
                <FavoriteBorder fontSize="large" />
              )}
            </IconButton>
            <Typography className="text-white text-sm drop-shadow-lg">
              {audio.likes}
            </Typography>
          </Box>

          <Box className="flex flex-col items-center">
            <IconButton 
              onClick={handleCommentClick}
              className="text-white transform transition-transform duration-200 hover:scale-110"
            >
              <Comment fontSize="large" />
            </IconButton>
            <Typography className="text-white text-sm drop-shadow-lg">
              {audio.comments}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Comments section */}
      {showComments && (
        <Box 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 transition-opacity duration-300"
          onClick={() => setShowComments(false)}
        >
          <Box 
            className="absolute right-0 top-0 bottom-16 w-full sm:w-96 bg-gray-900 shadow-lg transition-transform duration-300 transform"
            onClick={e => e.stopPropagation()}
          >
            {/* Comments header with close button */}
            <Box className="sticky top-0 z-10 bg-gray-900">
              <Box className="flex items-center p-4 border-b border-gray-800">
                <IconButton
                  onClick={() => setShowComments(false)}
                  className="text-white hover:text-gray-300"
                  edge="start"
                  sx={{ 
                    color: 'white',
                    '&:hover': { 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  <Close sx={{ color: 'white', fontSize: 28 }} />
                </IconButton>
                <Typography variant="h6" className="text-white flex-1 text-center pr-10">
                  Comments ({audio.comments})
                </Typography>
              </Box>
            </Box>

            {/* Comment input */}
            <Box className="p-4 border-b border-gray-800">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isPostingComment}
                multiline
                maxRows={3}
                InputProps={{
                  style: { color: 'white' },
                  className: 'bg-gray-800 rounded-lg',
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: 'white' },
                  },
                }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handlePostComment}
                disabled={!commentText.trim() || isPostingComment}
                className="mt-2"
                startIcon={isPostingComment ? <CircularProgress size={20} /> : <Send />}
              >
                Post Comment
              </Button>
            </Box>

            {/* Comments list */}
            <Box className="overflow-y-auto" style={{ height: 'calc(100% - 180px)' }}>
              {isLoadingComments ? (
                <Box className="flex justify-center py-4">
                  <CircularProgress />
                </Box>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <Box key={comment.id} className="p-4 border-b border-gray-800">
                    <Box className="flex items-center gap-2 mb-2">
                      <Avatar src={comment.user.avatar || undefined} alt={comment.user.username} />
                      <Box>
                        <Typography className="text-white font-medium">
                          @{comment.user.username}
                        </Typography>
                        <Typography variant="caption" className="text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography className="text-white pl-10">
                      {comment.content}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography className="text-gray-400 text-center py-4">
                  No comments yet. Be the first to comment!
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Progress indicator */}
      <Box 
        className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-50"
        style={{ width: `${progress}%` }}
      />
    </Box>
  );
};

export default FullScreenAudioCard; 