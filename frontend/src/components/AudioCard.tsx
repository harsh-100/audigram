import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, IconButton, Avatar } from '@mui/material';
import { PlayArrow, Pause, Favorite, FavoriteBorder, Comment } from '@mui/icons-material';
import WaveSurfer from 'wavesurfer.js';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';

interface AudioProps {
  audio: {
    id: string;
    title: string;
    description: string;
    filePath: string;
    tags: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
      avatar: string | null;
    };
    _count: {
      likes: number;
      comments: number;
    };
  };
}

const AudioCard = ({ audio }: AudioProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(audio._count.likes);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (waveformRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4a90e2',
        progressColor: '#2196f3',
        cursorColor: '#fff',
        barWidth: 2,
        barRadius: 3,
        height: 60,
      });

      wavesurferRef.current.load(`${API_URL}/${audio.filePath}`);

      return () => {
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
        }
      };
    }
  }, [audio.filePath]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
      } else {
        wavesurferRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      const response = await axios.post(
        `${API_URL}/api/audio/${audio.id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setLiked(response.data.liked);
      setLikesCount((prev) => (response.data.liked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error('Error liking audio:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Link to={`/profile/${audio.user.username}`} className="flex items-center gap-2">
            <Avatar src={audio.user.avatar || undefined} alt={audio.user.username} />
            <Typography variant="subtitle1">{audio.user.username}</Typography>
          </Link>
        </div>

        <Typography variant="h6" className="mb-2">
          {audio.title}
        </Typography>
        <Typography variant="body2" color="textSecondary" className="mb-4">
          {audio.description}
        </Typography>

        <div className="gradient-bg rounded-lg p-4 mb-4">
          <div ref={waveformRef} />
          <div className="flex justify-center mt-2">
            <IconButton onClick={togglePlay} size="large">
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <IconButton onClick={handleLike} color={liked ? 'secondary' : 'default'}>
            {liked ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
          <Typography>{likesCount}</Typography>

          <IconButton>
            <Comment />
          </IconButton>
          <Typography>{audio._count.comments}</Typography>
        </div>

        <Typography variant="caption" color="textSecondary" className="mt-2 block">
          {new Date(audio.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default AudioCard; 