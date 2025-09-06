import { useState } from 'react'
import './App.css'
import WireframeGenerator from './components/WireframeGenerator'
import LandingPage from './components/LandingPage'
import { ThemeProvider, createTheme, CssBaseline, Fade } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366F1', // Indigo
      light: '#818CF8',
      dark: '#4F46E5',
    },
    secondary: {
      main: '#EC4899', // Pink
      light: '#F472B6',
      dark: '#DB2777',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    error: {
      main: '#EF4444',
    },
    success: {
      main: '#10B981',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(99, 102, 241, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});
function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'generator'>('landing');
  const [initialDescription, setInitialDescription] = useState<string>('');

  const handleGenerateWireframe = (description: string) => {
    setInitialDescription(description);
    setCurrentView('generator');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setInitialDescription('');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Fade in={currentView === 'landing'} timeout={600} unmountOnExit>
        <div style={{ position: currentView === 'landing' ? 'relative' : 'absolute', width: '100%', zIndex: currentView === 'landing' ? 1 : 0 }}>
          <LandingPage onGenerateWireframe={handleGenerateWireframe} />
        </div>
      </Fade>
      <Fade in={currentView === 'generator'} timeout={600} unmountOnExit>
        <div style={{ position: currentView === 'generator' ? 'relative' : 'absolute', width: '100%', zIndex: currentView === 'generator' ? 1 : 0 }}>
          <WireframeGenerator 
            initialDescription={initialDescription}
            onBackToLanding={handleBackToLanding}
          />
        </div>
      </Fade>
    </ThemeProvider>
  );
}

export default App
