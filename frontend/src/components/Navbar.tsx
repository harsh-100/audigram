import { CloudUpload } from '@mui/icons-material';
import { AppBar, Avatar, Button, IconButton, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <AppBar position="static" className="mb-8">
      <Toolbar className="justify-between">
        <RouterLink to="/" className="text-white no-underline">
          <Typography variant="h6" component="div">
            AudioGram
          </Typography>
        </RouterLink>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <RouterLink to="/upload" className="text-white">
                <IconButton color="inherit" title="Upload Audio">
                  <CloudUpload />
                </IconButton>
              </RouterLink>
              <RouterLink to={`/profile/${user.username}`} className="text-white">
                <IconButton color="inherit">
                  <Avatar
                    alt={user.username}
                    src={user.avatar || undefined}
                    sx={{ width: 32, height: 32 }}
                  />
                </IconButton>
              </RouterLink>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Register
              </Button>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 