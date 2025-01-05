import { Share } from '@mui/icons-material';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useState, useEffect } from 'react';

interface ShareButtonProps {
  audioId: string;
}

const ShareButton = ({ audioId }: ShareButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const open = Boolean(anchorEl);

  useEffect(() => {
    // Check if native share is available
    setHasNativeShare('share' in navigator);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getShareUrl = () => {
    return `${window.location.origin}/share/${audioId}`;
  };

  const handleShare = async () => {
    const shareUrl = getShareUrl();
    
    if (hasNativeShare) {
      try {
        await navigator.share({
          title: 'Check out this audio on AudioGram',
          text: 'Listen to this amazing audio on AudioGram!',
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        // You might want to show a toast notification here
        console.log('Link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
    handleClose();
  };

  const handleWhatsAppShare = () => {
    const shareUrl = encodeURIComponent(getShareUrl());
    const whatsappUrl = `https://wa.me/?text=Check%20out%20this%20audio%20on%20AudioGram!%20${shareUrl}`;
    window.open(whatsappUrl, '_blank');
    handleClose();
  };

  const handleFacebookShare = () => {
    const shareUrl = encodeURIComponent(getShareUrl());
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
    window.open(facebookUrl, '_blank');
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        className="text-white transform transition-transform duration-200 hover:scale-110"
      >
        <Share fontSize="large" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        {hasNativeShare && (
          <MenuItem onClick={handleShare}>
            Share...
          </MenuItem>
        )}
        <MenuItem onClick={handleWhatsAppShare}>
          Share on WhatsApp
        </MenuItem>
        <MenuItem onClick={handleFacebookShare}>
          Share on Facebook
        </MenuItem>
        {!hasNativeShare && (
          <MenuItem onClick={handleShare}>
            Copy Link
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default ShareButton; 