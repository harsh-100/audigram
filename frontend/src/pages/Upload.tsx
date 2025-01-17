import { CloudUpload } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AudioRecorder from '../components/AudioRecorder';
import { api } from '../config/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`upload-tabpanel-${index}`}
      aria-labelledby={`upload-tab-${index}`}
      {...other}
    >
      {value === index && <Box className="py-4">{children}</Box>}
    </div>
  );
}

const Upload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setFile(null);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'audio/mpeg' && selectedFile.type !== 'audio/wav') {
        setError('Please select an MP3 or WAV file');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);

    setLoading(true);
    setError('');

    try {
      await api.post('/api/audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      navigate('/');
    } catch (err) {
      setError('Failed to upload audio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="max-w-md mx-auto">
      <Typography variant="h4" component="h1" className="mb-6 text-center">
        Upload Audio
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        className="mb-4"
      >
        <Tab label="Upload File" />
        <Tab label="Record Audio" />
      </Tabs>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TabPanel value={tabValue} index={0}>
          <input
            type="file"
            accept="audio/mpeg,audio/wav"
            hidden
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <Button
            variant="outlined"
            fullWidth
            onClick={() => fileInputRef.current?.click()}
            startIcon={<CloudUpload />}
          >
            {file ? file.name : 'Select Audio File'}
          </Button>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          {file && (
            <Typography className="mt-2 text-center text-green-600">
              Recording saved! Ready to upload.
            </Typography>
          )}
        </TabPanel>

        <TextField
          label="Title"
          fullWidth
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          required
        />

        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
          required
        />

        <TextField
          label="Tags (comma-separated)"
          fullWidth
          value={tags}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
          placeholder="music, rock, guitar"
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
          {loading ? <CircularProgress size={24} /> : 'Upload'}
        </Button>
      </form>
    </Box>
  );
};

export default Upload; 