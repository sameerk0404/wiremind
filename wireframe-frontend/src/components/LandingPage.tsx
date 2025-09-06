import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SparkleIcon from '@mui/icons-material/Star';

interface LandingPageProps {
  onGenerateWireframe: (description: string) => void;
}

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
                 radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)`,
  },
}));

const MainCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6, 4),
  maxWidth: 800,
  width: '100%',
  borderRadius: 24,
  background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.85)})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.1)}, 0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
  position: 'relative',
  zIndex: 1,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4, 3),
    margin: theme.spacing(0, 2),
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    fontSize: '1.1rem',
    minHeight: '120px',
    alignItems: 'flex-start',
    borderRadius: 16,
    background: alpha(theme.palette.background.paper, 0.8),
    '& fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.2),
      borderWidth: 2,
    },
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.4),
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(2.5),
  },
}));

const GenerateButton = styled(Button)(({ theme }) => ({
  fontSize: '1.1rem',
  padding: theme.spacing(1.5, 4),
  borderRadius: 12,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
}));

const FeatureChip = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.8, 1.5),
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  borderRadius: 20,
  fontSize: '0.875rem',
  fontWeight: 500,
  color: theme.palette.primary.main,
  margin: theme.spacing(0.5),
}));

const LandingPage: React.FC<LandingPageProps> = ({ onGenerateWireframe }) => {
  const theme = useTheme();
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsLoading(true);
    // Small delay for smooth transition
    setTimeout(() => {
      onGenerateWireframe(description);
    }, 500);
  };

  return (
    <GradientBackground>
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <MainCard elevation={0}>
            <Stack spacing={4} alignItems="center" textAlign="center">
              {/* Header Section */}
              <Box>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                  <AutoFixHighIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: theme.palette.primary.main,
                      filter: 'drop-shadow(0 4px 8px rgba(99, 102, 241, 0.3))'
                    }} 
                  />
                  <Typography 
                    variant="h3" 
                    fontWeight="bold" 
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      display: 'inline-block',
                    }}
                  >
                    AI Wireframe Generator
                  </Typography>
                </Box>
                
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  sx={{ mb: 1, fontWeight: 400, lineHeight: 1.6 }}
                >
                  Transform your ideas into professional wireframes instantly
                </Typography>
                
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ maxWidth: 600, mx: 'auto', opacity: 0.8 }}
                >
                  Describe your website, app, or interface in natural language and watch our AI create detailed wireframes tailored to your vision.
                </Typography>
              </Box>

              {/* Feature Tags */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                <FeatureChip>
                  <SparkleIcon sx={{ fontSize: 16 }} />
                  AI-Powered
                </FeatureChip>
                <FeatureChip>
                  <SparkleIcon sx={{ fontSize: 16 }} />
                  Instant Results
                </FeatureChip>
                <FeatureChip>
                  <SparkleIcon sx={{ fontSize: 16 }} />
                  Professional Quality
                </FeatureChip>
              </Box>

              {/* Input Form */}
              <Box 
                component="form" 
                onSubmit={handleSubmit}
                sx={{ width: '100%', maxWidth: 600 }}
              >
                <Stack spacing={3}>
                  <StyledTextField
                    fullWidth
                    multiline
                    minRows={4}
                    maxRows={8}
                    placeholder="Describe your wireframe idea... 

For example:
• Create a modern e-commerce homepage with hero section, featured products, and newsletter signup
• Design a dashboard for project management with sidebar navigation and task overview
• Build a landing page for a SaaS product with pricing tiers and testimonials"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiInputBase-input::placeholder': {
                        color: alpha(theme.palette.text.secondary, 0.6),
                        opacity: 1,
                      },
                    }}
                  />
                  
                  <GenerateButton
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={!description.trim() || isLoading}
                    startIcon={<AutoFixHighIcon />}
                    sx={{
                      alignSelf: 'center',
                      minWidth: 200,
                    }}
                  >
                    {isLoading ? 'Starting...' : 'Generate Wireframe'}
                  </GenerateButton>
                </Stack>
              </Box>

              {/* Example Prompts */}
              <Box sx={{ mt: 2, opacity: 0.7 }}>
                <Typography variant="caption" color="text.secondary">
                  ✨ Try: "restaurant booking app", "fitness tracking dashboard", or "online learning platform"
                </Typography>
              </Box>
            </Stack>
          </MainCard>
        </Fade>
      </Container>
    </GradientBackground>
  );
};

export default LandingPage;