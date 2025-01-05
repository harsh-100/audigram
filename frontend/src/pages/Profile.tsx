import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AudioCard from '../components/AudioCard';
import { api } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

interface Profile {
  id: string;
  username: string;
  bio: string | null;
  avatar: string | null;
  _count: {
    audios: number;
    followers: number;
    following: number;
  };
}

interface Audio {
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
}

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [audios, setAudios] = useState<Audio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState(false);

  const isOwnProfile = user?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, audiosRes] = await Promise.all([
          api.get(`/api/users/${username}`),
          api.get(`/api/users/${username}/audios`),
        ]);

        setProfile(profileRes.data);
        setAudios(audiosRes.data);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleUploadClick = () => {
    navigate('/upload');
  };

  const handleFollow = async () => {
    if (!user || !profile) return;

    try {
      const response = await api.post(
        `/api/users/${profile.id}/follow`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setFollowing(response.data.following);
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          _count: {
            ...prev._count,
            followers: response.data.following
              ? prev._count.followers + 1
              : prev._count.followers - 1,
          },
        };
      });
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box className="text-center">
        <Alert severity="error">{error || 'Profile not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box className="text-center mb-8">
        <Avatar
          src={profile.avatar || undefined}
          alt={profile.username}
          sx={{ width: 128, height: 128, margin: '0 auto 16px' }}
        />
        <Typography variant="h4" className="mb-2">
          {profile.username}
        </Typography>
        {profile.bio && (
          <Typography variant="body1" color="textSecondary" className="mb-4">
            {profile.bio}
          </Typography>
        )}

        <Grid container spacing={4} className="max-w-md mx-auto mb-4">
          <Grid item xs={4}>
            <Typography variant="h6">{profile._count.audios}</Typography>
            <Typography color="textSecondary">Audios</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h6">{profile._count.followers}</Typography>
            <Typography color="textSecondary">Followers</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h6">{profile._count.following}</Typography>
            <Typography color="textSecondary">Following</Typography>
          </Grid>
        </Grid>

        <Box className="flex justify-center gap-4">
          {isOwnProfile ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudUpload />}
              onClick={handleUploadClick}
            >
              Upload New Audio
            </Button>
          ) : user && (
            <Button
              variant={following ? 'outlined' : 'contained'}
              color="primary"
              onClick={handleFollow}
            >
              {following ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </Box>
      </Box>

      <Typography variant="h5" className="mb-4">
        Audios
      </Typography>
      <div className="space-y-6">
        {audios.map((audio) => (
          <AudioCard key={audio.id} audio={audio} />
        ))}
        {audios.length === 0 && (
          <Typography color="textSecondary" className="text-center">
            No audios uploaded yet
          </Typography>
        )}
      </div>
    </Box>
  );
};

export default Profile; 