import { Alert, Backdrop, Box, Button, Card, CircularProgress, Divider, Fade, Grid, Paper, Tab, Tabs, TextField, Typography, Container, Chip, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import React, { useState } from 'react'
import { generateWireframe } from '../api/wireframeApi'
import type { WireframeResponse } from '../types/types'
import SvgRenderer from './SvgRenderer'
import CodeDisplay from './CodeDisplay'
import PreviewIcon from '@mui/icons-material/Preview';
import CodeIcon from '@mui/icons-material/Code';
import SendIcon from '@mui/icons-material/Send';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SchemaIcon from '@mui/icons-material/Schema';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DrawIcon from '@mui/icons-material/Draw';
import SparklesIcon from '@mui/icons-material/AutoFixHigh';



interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const WireframeGenerator = () => {

    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string |null>(null)
    const [response, setResponse] = useState<WireframeResponse | null>(null)
    const [tabValue, setTabValue] = useState(0)
    const [progress, setProgress] = useState(0);
    const [showConversation, setShowConversation] = useState(false);
    const [conversationMessages, setConversationMessages] = useState<ChatMessage[]>([]);
    const [conversationInput, setConversationInput] = useState('');
    const [conversationLoading, setConversationLoading] = useState(false);




    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
    }

    // Simulated progress for the loading indicator
    const simulateProgress = () => {
        setProgress(0);
        const interval = setInterval(() => {
        setProgress((prevProgress) => {
            // Don't reach 100% as that would indicate completion
            // We'll set it to 100 when the actual response arrives
            const newProgress = prevProgress + (Math.random() * 10);
            return newProgress >= 95 ? 95 : newProgress;
        });
        }, 500);
        
        return interval;
    };


    const handleSubmit = async () => {
        if (!query.trim()){
            setError('Please enter a valid query');
            return;
        }

        // Start conversational flow
        setShowConversation(true);
        setConversationMessages([
            {
                role: 'user',
                content: query,
                timestamp: new Date()
            },
            {
                role: 'assistant',
                content: getInitialQuestions(query),
                timestamp: new Date()
            }
        ]);
    }

    const getInitialQuestions = (userQuery: string): string => {
        return `Great! I'd love to help you create the perfect wireframe for "${userQuery}". 

To make sure I design something that truly fits your needs, let me ask you a few quick questions:

1. **What type of project is this?** (e.g., website, mobile app, dashboard, landing page)

2. **Who's your target audience?** (e.g., young professionals, small business owners, general consumers)

3. **What platform will this primarily be used on?** (desktop, mobile, tablet, or responsive)

4. **What are the most important features or sections you need?** (e.g., user login, product catalog, contact form, etc.)

5. **Any style preferences?** (modern/minimalist, corporate, creative, or no preference)

Feel free to answer these in any order, or if you'd prefer to skip the questions and generate directly, just type "skip" and I'll create a wireframe based on your original request! 😊`;
    }

    const handleConversationSubmit = async () => {
        if (!conversationInput.trim()) return;

        const newUserMessage: ChatMessage = {
            role: 'user',
            content: conversationInput,
            timestamp: new Date()
        };

        setConversationMessages(prev => [...prev, newUserMessage]);
        setConversationInput('');
        setConversationLoading(true);

        // Check if user wants to skip or has answered enough questions
        if (conversationInput.toLowerCase().includes('skip') || 
            conversationInput.toLowerCase().includes('generate') || 
            conversationMessages.length >= 6) { // 3 rounds of back-and-forth
            
            // Generate wireframe with conversation context
            await generateWithContext();
        } else {
            // Continue conversation with follow-up questions
            setTimeout(() => {
                const followUpMessage: ChatMessage = {
                    role: 'assistant',
                    content: getFollowUpResponse(conversationInput, conversationMessages.length),
                    timestamp: new Date()
                };
                setConversationMessages(prev => [...prev, followUpMessage]);
                setConversationLoading(false);
            }, 1000);
        }
    }

    const getFollowUpResponse = (userInput: string, messageCount: number): string => {
        if (messageCount >= 6) {
            return "Perfect! I have enough information now. Let me create your wireframe! 🎨";
        }

        const responses = [
            "Thanks for that info! Can you tell me more about your target audience and what they'll primarily use this for?",
            "Great details! What platform will this be used on most? And are there any specific features that are absolutely essential?",
            "Excellent! Any style preferences or specific goals you want to achieve with this interface?",
            "Perfect! I think I have enough context now. Let me create a wireframe that matches your vision! ✨"
        ];

        return responses[Math.min(messageCount / 2, responses.length - 1)];
    }

    const generateWithContext = async () => {
        setShowConversation(false);
        setLoading(true);
        setError(null);

        // Combine original query with conversation context
        const conversationContext = conversationMessages
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n\n');

        const enhancedQuery = `
Original Request: ${query}

Conversation Context:
${conversationContext}

Please create a professional wireframe based on this detailed conversation and context.
        `.trim();

        try {
            const result = await generateWireframe(enhancedQuery)
            console.log(result)

            if (result.errors && result.errors.length > 0) {
                setError(result.errors.join(', '));
            } else {
                setResponse(result);
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            clearInterval(simulateProgress());
            setLoading(false);
            setProgress(100);
            setTimeout(() => {
                setLoading(false);
            }, 500);
        }
    }

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Split-screen layout when wireframe is generated
    if (response) {
      return (
        <Box sx={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>
          {/* Left Panel - Input & Controls */}
          <Box 
            sx={{ 
              width: '400px', 
              borderRight: '1px solid #e0e0e0',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'
            }}
          >
            {/* Header */}
            <Box sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AutoAwesomeIcon sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Wireframe AI
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                AI-powered wireframe generation
              </Typography>
            </Box>

            {/* Input Section */}
            <Box sx={{ p: 3, flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: '#374151' }}>
                Describe Your Wireframe
              </Typography>
              
              <TextField
                fullWidth
                variant="outlined"
                value={query}
                onChange={handleQueryChange}
                disabled={loading}
                multiline
                rows={4}
                placeholder="E.g. Create a responsive landing page for a fitness app with a hero section, features, and contact form"
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white'
                  }
                }}
              />
              
              <Button 
                fullWidth
                variant="contained" 
                onClick={handleSubmit}
                disabled={loading}
                startIcon={<SendIcon />}
                size="large"
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                  }
                }}
              >
                Generate New Wireframe
              </Button>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mt: 2, borderRadius: 2 }}
                  variant="filled"
                >
                  {error}
                </Alert>
              )}

              {/* Quick Examples */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#6b7280' }}>
                  Quick Examples:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    "E-commerce checkout page",
                    "Dashboard with charts",
                    "Mobile app login screen",
                    "Blog homepage layout"
                  ].map((example, index) => (
                    <Chip
                      key={index}
                      label={example}
                      onClick={() => setQuery(example)}
                      variant="outlined"
                      size="small"
                      sx={{ 
                        justifyContent: 'flex-start',
                        '&:hover': { backgroundColor: '#f3f4f6' }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Right Panel - Wireframe Display */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header with tabs */}
            <Box sx={{ borderBottom: '1px solid #e0e0e0', backgroundColor: 'white' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    minHeight: '60px',
                    textTransform: 'none',
                    fontWeight: 500
                  }
                }}
              >
                <Tab icon={<PreviewIcon />} label="Wireframe Preview" iconPosition="start" />
                <Tab icon={<CodeIcon />} label="SVG Code" iconPosition="start" />
                <Tab icon={<SchemaIcon />} label="Wireframe Flow" iconPosition="start" />
              </Tabs>
            </Box>

            {/* Content Area */}
            <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#fafafa', overflow: 'auto' }}>
              {tabValue === 0 && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  minHeight: '100%',
                  background: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  p: 3
                }}>
                  <SvgRenderer svgCode={response.svg_code} />
                </Box>
              )}
              
              {tabValue === 1 && (
                <Box sx={{ 
                  background: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  overflow: 'hidden'
                }}>
                  <CodeDisplay code={response.svg_code} language="xml" />
                </Box>
              )}
              
              {tabValue === 2 && (
                <Box sx={{ 
                  background: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  p: 3
                }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#374151' }}>
                    Wireframe Planning Details
                  </Typography>
                  {response.wireframe_plan && typeof response.wireframe_plan === 'object' ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {response.wireframe_plan.strategic_overview && (
                        <Box>
                          <Typography variant="h6" sx={{ color: '#6366f1', mb: 1 }}>📋 Strategic Overview</Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                            {response.wireframe_plan.strategic_overview}
                          </Typography>
                        </Box>
                      )}
                      
                      {response.wireframe_plan.information_architecture && (
                        <Box>
                          <Typography variant="h6" sx={{ color: '#6366f1', mb: 1 }}>🏗️ Information Architecture</Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                            {typeof response.wireframe_plan.information_architecture === 'string' 
                              ? response.wireframe_plan.information_architecture 
                              : JSON.stringify(response.wireframe_plan.information_architecture, null, 2)}
                          </Typography>
                        </Box>
                      )}
                      
                      {response.wireframe_plan.user_journeys && (
                        <Box>
                          <Typography variant="h6" sx={{ color: '#6366f1', mb: 1 }}>👤 User Journeys</Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                            {typeof response.wireframe_plan.user_journeys === 'string' 
                              ? response.wireframe_plan.user_journeys 
                              : JSON.stringify(response.wireframe_plan.user_journeys, null, 2)}
                          </Typography>
                        </Box>
                      )}
                      
                      {response.wireframe_plan.screens && (
                        <Box>
                          <Typography variant="h6" sx={{ color: '#6366f1', mb: 1 }}>📱 Screen Structure</Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                            {typeof response.wireframe_plan.screens === 'string' 
                              ? response.wireframe_plan.screens 
                              : JSON.stringify(response.wireframe_plan.screens, null, 2)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body1" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
                      Wireframe planning details will appear here when available.
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          {/* Loading overlay */}
          <Backdrop
            sx={{ 
              color: '#fff', 
              zIndex: (theme) => theme.zIndex.drawer + 1,
              flexDirection: 'column'
            }}
            open={loading}
          >
            <CircularProgress 
              color="inherit" 
              variant="determinate" 
              value={progress} 
              size={80}
              thickness={4}
              sx={{ mb: 3 }}
            />
            <Paper sx={{ 
              p: 4, 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              borderRadius: 3,
              maxWidth: 400,
              textAlign: 'center'
            }}>
              <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
                Generating Wireframe
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {progress < 30 && "🔍 Analyzing your requirements..."}
                {progress >= 30 && progress < 60 && "📐 Planning wireframe structure..."}
                {progress >= 60 && progress < 90 && "🎨 Creating SVG wireframe..."}
                {progress >= 90 && "✨ Finalizing..."}
              </Typography>
            </Paper>
          </Backdrop>
        </Box>
      );
    }

    // Initial state - full screen welcome
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Hero Section */}
        <Box 
          sx={{ 
            textAlign: 'center',
            mb: 6,
            p: 6,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <AutoAwesomeIcon sx={{ fontSize: 60, opacity: 0.9 }} />
            </Box>
            <Typography variant="h2" fontWeight="bold" sx={{ mb: 3 }}>
              AI Wireframe Generator
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
              Transform your ideas into professional wireframes using the power of AI
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                icon={<SparklesIcon />} 
                label="AI-Powered" 
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} 
              />
              <Chip 
                icon={<DrawIcon />} 
                label="Instant SVG" 
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} 
              />
              <Chip 
                icon={<PreviewIcon />} 
                label="Live Preview" 
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} 
              />
            </Box>
          </Box>
          
          {/* Decorative elements */}
          <Box sx={{ 
            position: 'absolute', 
            top: -50, 
            right: -50, 
            width: 200, 
            height: 200, 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '50%',
            zIndex: 1
          }} />
          <Box sx={{ 
            position: 'absolute', 
            bottom: -100, 
            left: -100, 
            width: 300, 
            height: 300, 
            background: 'rgba(255,255,255,0.05)', 
            borderRadius: '50%',
            zIndex: 1
          }} />
        </Box>

        {/* Input Section */}
        <Paper 
          elevation={3}
          sx={{ 
            p: 4, 
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, textAlign: 'center', color: '#374151' }}>
            Describe Your Vision
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: '#6b7280' }}>
            Tell us what kind of wireframe you need, and our AI will create it for you
          </Typography>
          
          <TextField
            fullWidth
            label="Describe your wireframe"
            variant="outlined"
            value={query}
            onChange={handleQueryChange}
            disabled={loading}
            multiline
            rows={4}
            placeholder="E.g. Create a responsive landing page for a fitness app with a hero section, features, and contact form"
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '1.1rem'
              }
            }}
          />
          
          <Box sx={{ textAlign: 'center' }}>
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              disabled={loading || !query.trim()}
              startIcon={<SendIcon />}
              size="large"
              sx={{ 
                px: 6,
                py: 2,
                borderRadius: 3,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Generate Wireframe
            </Button>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mt: 3, borderRadius: 2 }}
              variant="filled"
            >
              {error}
            </Alert>
          )}
        </Paper>

        {/* Example Prompts */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#374151' }}>
            Try These Examples
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {[
              "E-commerce product page with reviews and cart",
              "Mobile app dashboard with charts and notifications", 
              "Blog homepage with featured articles",
              "Landing page for a SaaS product with pricing"
            ].map((example, index) => (
              <Card 
                key={index}
                sx={{ 
                  p: 2, 
                  cursor: 'pointer',
                  borderRadius: 2,
                  minWidth: 200,
                  maxWidth: 250,
                  '&:hover': { 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setQuery(example)}
              >
                <Typography variant="body2" textAlign="center">
                  {example}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Conversational Dialog */}
        <Dialog 
          open={showConversation} 
          onClose={() => setShowConversation(false)}
          maxWidth="md"
          fullWidth
          sx={{ '& .MuiDialog-paper': { height: '70vh' } }}
        >
          <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #e5e7eb' }}>
            <Typography variant="h5" fontWeight="bold" color="primary">
              Let's design your wireframe together! 💬
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              I'll ask a few questions to understand your needs better
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 0 }}>
            {/* Chat Messages */}
            <Box sx={{ 
              flex: 1, 
              overflowY: 'auto', 
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              {conversationMessages.map((message, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}>
                  <Paper sx={{ 
                    p: 2, 
                    maxWidth: '80%',
                    backgroundColor: message.role === 'user' 
                      ? '#6366f1' 
                      : '#f3f4f6',
                    color: message.role === 'user' ? 'white' : 'black',
                    borderRadius: message.role === 'user' 
                      ? '18px 18px 4px 18px' 
                      : '18px 18px 18px 4px'
                  }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      opacity: 0.7, 
                      mt: 1, 
                      display: 'block' 
                    }}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              
              {conversationLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                  <Paper sx={{ 
                    p: 2, 
                    backgroundColor: '#f3f4f6',
                    borderRadius: '18px 18px 18px 4px'
                  }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <CircularProgress size={16} />
                      <Typography variant="body1" sx={{ color: '#6b7280' }}>
                        Thinking...
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )}
            </Box>
            
            {/* Chat Input */}
            <Box sx={{ 
              borderTop: '1px solid #e5e7eb', 
              p: 3, 
              display: 'flex', 
              gap: 2, 
              alignItems: 'center' 
            }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your response here..."
                value={conversationInput}
                onChange={(e) => setConversationInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleConversationSubmit();
                  }
                }}
                disabled={conversationLoading}
                multiline
                maxRows={3}
              />
              <Button 
                onClick={handleConversationSubmit}
                variant="contained"
                disabled={conversationLoading || !conversationInput.trim()}
                sx={{ 
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  },
                  minWidth: '100px'
                }}
              >
                Send
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Loading backdrop */}
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            flexDirection: 'column'
          }}
          open={loading}
        >
          <CircularProgress 
            color="inherit" 
            variant="determinate" 
            value={progress} 
            size={80}
            thickness={4}
            sx={{ mb: 3 }}
          />
          <Paper sx={{ 
            p: 4, 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            borderRadius: 3,
            maxWidth: 400,
            textAlign: 'center'
          }}>
            <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
              Generating Wireframe
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {progress < 30 && "🔍 Analyzing your requirements..."}
              {progress >= 30 && progress < 60 && "📐 Planning wireframe structure..."}
              {progress >= 60 && progress < 90 && "🎨 Creating SVG wireframe..."}
              {progress >= 90 && "✨ Finalizing..."}
            </Typography>
          </Paper>
        </Backdrop>
      </Container>
    );
    };
    
    export default WireframeGenerator;