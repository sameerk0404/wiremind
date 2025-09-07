import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  IconButton,
  useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface LandingPageProps {
  onGenerateWireframe: (description: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGenerateWireframe }) => {
  const theme = useTheme();
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isLoading) return;

    setIsLoading(true);
    onGenerateWireframe(description);
  };

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: theme.palette.background.default
    }}>
      <Container maxWidth="sm">
        <Box 
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 4,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease-out',
            '&:focus-within': {
              transform: 'scale(1.02)',
            }
          }}
        >
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            textAlign="center" 
            sx={{ mb: 3, color: theme.palette.primary.main }}
          >
            Describe Your Interface
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="E.g. Create a modern e-commerce homepage..."
              value={description}
              onChange={handleInputChange}
              variant="outlined"
              disabled={isLoading}
              multiline
              maxRows={2}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1.1rem',
                }
              }}
            />
            <IconButton
              type="submit"
              disabled={!description.trim() || isLoading}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: 'white',
                width: 56,
                height: 56,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
                '&:disabled': {
                  bgcolor: '#e5e7eb',
                  color: '#9ca3af',
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>

          <Box sx={{ mt: 2, opacity: 0.7, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              ✨ Try: "restaurant booking app", "fitness tracking dashboard", or "online learning platform"
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;