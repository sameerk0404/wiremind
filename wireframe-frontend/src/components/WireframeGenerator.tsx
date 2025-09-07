import { Box, CircularProgress, Tab, Tabs, TextField, Typography, IconButton, Avatar, Chip } from '@mui/material'
import React, { useState, useRef, useEffect } from 'react'
import { generateWireframe, handleConversation } from '../api/wireframeApi'
import type { WireframeResponse } from '../types/types'
import SvgRenderer from './SvgRenderer'
import CodeDisplay from './CodeDisplay'
import PreviewIcon from '@mui/icons-material/Preview';
import CodeIcon from '@mui/icons-material/Code';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isQuestion?: boolean;
}

interface WireframeGeneratorProps {
    initialDescription?: string;
    onBackToLanding?: () => void;
}

const WireframeGenerator: React.FC<WireframeGeneratorProps> = ({ initialDescription = '', onBackToLanding }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [showChat, setShowChat] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [wireframeResponse, setWireframeResponse] = useState<WireframeResponse | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [questionCount, setQuestionCount] = useState(0);
    const maxQuestions = 3;
    const [hasStarted, setHasStarted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle initial description from landing page
    useEffect(() => {
        if (initialDescription && !hasStarted) {
            setHasStarted(true);
            const initialMessage: ChatMessage = {
                role: 'user',
                content: initialDescription,
                timestamp: new Date()
            };
            setMessages([initialMessage]);
            
            // Start morphing animation first
            setShowChat(true);
            
            // Wait a bit before sending the initial message to allow animation to complete
            const timeoutId = setTimeout(() => {
                handleSendMessage(initialDescription);
            }, 800);
            
            // Cleanup timeout if component unmounts
            return () => clearTimeout(timeoutId);
        }
    }, [initialDescription]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleSendMessage = async (customInput?: string) => {
        const messageText = customInput || inputValue;
        if (!messageText.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: messageText,
            timestamp: new Date()
        };

        // First update messages with the user's message
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        if (!customInput) setInputValue(''); // Only clear input if not using custom input
        setIsLoading(true);

        try {
            // Convert messages to the format expected by the API, including the new user message
            const apiMessages = updatedMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Get intelligent AI response
            const conversationResponse = await handleConversation(apiMessages, messageText);
            console.log('API Response:', conversationResponse); // Debug log
            
            const aiResponse: ChatMessage = {
                role: 'assistant',
                content: conversationResponse.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiResponse]);
            
            // Track question count for AI questions
            if (!conversationResponse.should_generate) {
                setQuestionCount(prev => prev + 1);
            }

            // If AI thinks we should generate or we hit max questions, generate the wireframe
            if (conversationResponse.should_generate || questionCount >= maxQuestions - 1) {
                setTimeout(() => {
                    generateWireframeFromChat();
                }, 1500);
            }

        } catch (error) {
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: "I'm having trouble processing your request right now. Could you try rephrasing that?",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };



    const generateWireframeFromChat = async () => {
        // Combine all conversation context
        const conversationHistory = messages
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n\n');

        const enhancedPrompt = `
Conversation Context:
${conversationHistory}

user: ${inputValue}

Based on this detailed conversation, create a professional wireframe that addresses all the discussed requirements.`;

        try {
            const result = await generateWireframe(enhancedPrompt);
            
            if (result.errors && result.errors.length > 0) {
                const errorMessage: ChatMessage = {
                    role: 'assistant',
                    content: `I encountered some issues: ${result.errors.join(', ')}. Could you provide more details or try rephrasing your request?`,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
            } else {
                setWireframeResponse(result);
                const successMessage: ChatMessage = {
                    role: 'assistant',
                    content: "Perfect! I've created your wireframe. You can see it on the right. Feel free to ask me to modify anything or create variations!",
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, successMessage]);
            }
        } catch (error) {
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: `I encountered an error: ${(error as Error).message}. Let's try again - could you rephrase your request?`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Always prevent default for Enter without shift
            if (!isLoading && inputValue.trim()) {
                handleSendMessage();
            }
        }
    };

    const resetConversation = () => {
        // Clear all state
        setWireframeResponse(null);
        setQuestionCount(0);
        setInputValue('');
        setIsLoading(false);
        setHasStarted(false);
        // Reset messages with initial message
        setMessages([]);
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const formatTime = (timestamp: Date) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Replit-style split-screen layout
    return (
        <Box sx={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>
            {/* Left Panel - Chat Interface with Slide animation */}
            <Box sx={{
                width: '420px',
                borderRight: '1px solid rgba(99, 102, 241, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f8fafc',
                position: 'relative',
                zIndex: 2,
                transform: `translateX(${showChat ? '0' : '-100%'})`,
                opacity: showChat ? 1 : 0,
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '1px 0 20px rgba(0, 0, 0, 0.05)'
            }}>
                {/* Chat Header */}
                <Box sx={{
                    p: 2,
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SmartToyIcon sx={{ mr: 1, color: '#6366f1' }} />
                        <Typography variant="h6" fontWeight="bold" sx={{ color: '#374151' }}>
                            WireMind
                        </Typography>
                    </Box>
                    <IconButton onClick={resetConversation} size="small" title="Reset conversation">
                        <RestartAltIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* Messages Area */}
                <Box sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    {messages.map((message, index) => (
                        <Box key={index} sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.5,
                            ...(message.role === 'user' && {
                                flexDirection: 'row-reverse',
                                textAlign: 'right'
                            })
                        }}>
                            <Avatar sx={{
                                width: 32,
                                height: 32,
                                bgcolor: message.role === 'user' ? '#6366f1' : '#10b981',
                                fontSize: '0.8rem'
                            }}>
                                {message.role === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                            </Avatar>
                            <Box sx={{
                                maxWidth: '75%',
                                backgroundColor: message.role === 'user' ? '#6366f1' : 'white',
                                color: message.role === 'user' ? 'white' : '#374151',
                                borderRadius: 2,
                                p: 1.5,
                                boxShadow: message.role === 'user' 
                                    ? '0 4px 12px rgba(99, 102, 241, 0.2)'
                                    : '0 4px 12px rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: message.role === 'user'
                                        ? '0 6px 16px rgba(99, 102, 241, 0.25)'
                                        : '0 6px 16px rgba(0, 0, 0, 0.08)'
                                },
                                ...(message.role === 'assistant' && {
                                    border: '1px solid rgba(229, 231, 235, 0.5)',
                                    backdropFilter: 'blur(8px)'
                                })
                            }}>
                                <Typography variant="body2" sx={{ 
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: 1.4
                                }}>
                                    {message.content}
                                </Typography>
                                <Typography variant="caption" sx={{
                                    opacity: 0.7,
                                    mt: 0.5,
                                    display: 'block',
                                    fontSize: '0.7rem'
                                }}>
                                    {formatTime(message.timestamp)}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                    
                    {isLoading && (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5
                        }}>
                            <Avatar sx={{
                                width: 32,
                                height: 32,
                                bgcolor: '#10b981'
                            }}>
                                <SmartToyIcon fontSize="small" />
                            </Avatar>
                            <Box sx={{
                                backgroundColor: 'white',
                                borderRadius: 2,
                                p: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                border: '1px solid #e5e7eb'
                            }}>
                                <CircularProgress size={16} />
                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                    {wireframeResponse ? 'Generating wireframe...' : 'Thinking...'}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Box>

                {/* Input Area */}
                <Box sx={{
                    p: 2,
                    borderTop: '1px solid #e0e0e0',
                    backgroundColor: 'white'
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        alignItems: 'flex-end',
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: -20,
                            left: 0,
                            right: 0,
                            height: 20,
                            background: 'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))',
                            pointerEvents: 'none'
                        }
                    }}>
                        <TextField
                            ref={inputRef}
                            fullWidth
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                            placeholder="Describe your wireframe or answer my questions..."
                            variant="outlined"
                            multiline
                            maxRows={4}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    fontSize: '0.9rem',
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(8px)',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        '& fieldset': {
                                            borderColor: 'rgba(99, 102, 241, 0.4) !important'
                                        }
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: '#ffffff',
                                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.1)',
                                        '& fieldset': {
                                            borderColor: '#6366f1 !important',
                                            borderWidth: '2px !important'
                                        }
                                    }
                                }
                            }}
                        />
                        <IconButton 
                            onClick={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            disabled={!inputValue.trim() || isLoading}
                            sx={{
                                bgcolor: '#6366f1',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: '#4f46e5'
                                },
                                '&:disabled': {
                                    bgcolor: '#e5e7eb',
                                    color: '#9ca3af'
                                }
                            }}
                        >
                            <SendIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            </Box>

            {/* Right Panel - Wireframe Display */}
            <Box sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'all 0.5s ease-out'
            }}>
                {wireframeResponse ? (
                    <>
                        {/* Header with tabs */}
                        <Box sx={{ borderBottom: '1px solid #e0e0e0', backgroundColor: 'white' }}>
                            <Tabs 
                                value={tabValue} 
                                onChange={handleTabChange}
                                sx={{
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: '#6366f1',
                                        height: 3,
                                        borderRadius: '3px 3px 0 0'
                                    },
                                    '& .MuiTab-root': {
                                        minHeight: '60px',
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        color: '#6b7280',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            color: '#6366f1',
                                            backgroundColor: 'rgba(99, 102, 241, 0.04)'
                                        },
                                        '&.Mui-selected': {
                                            color: '#6366f1',
                                            fontWeight: 600
                                        },
                                        '& .MuiSvgIcon-root': {
                                            transition: 'transform 0.2s ease-in-out'
                                        },
                                        '&:hover .MuiSvgIcon-root': {
                                            transform: 'scale(1.1)'
                                        }
                                    }
                                }}
                            >
                                <Tab icon={<PreviewIcon />} label="Wireframe Preview" iconPosition="start" />
                                <Tab icon={<CodeIcon />} label="SVG Code" iconPosition="start" />
                                <Tab icon={<AccountTreeIcon />} label="Workflow" iconPosition="start" />
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
                                    opacity: wireframeResponse ? 1 : 0.5,
                                    transition: 'opacity 0.3s ease-out',
                                    p: 3
                                }}>
                                    <SvgRenderer svgCode={wireframeResponse.svg_code} />
                                </Box>
                            )}
                            
                            {tabValue === 1 && (
                                <Box sx={{ 
                                    background: 'white',
                                    borderRadius: 2,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    overflow: 'hidden'
                                }}>
                                    <CodeDisplay code={wireframeResponse.svg_code} language="xml" />
                                </Box>
                            )}
                            {tabValue === 2 && (
                                <Box sx={{ 
                                    background: 'white',
                                    borderRadius: 2,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    p: 3,
                                    overflow: 'auto'
                                }}>
                                    <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>Wireframe Generation Workflow</Typography>
                                    <Box sx={{ 
                                        width: '100%',
                                        minHeight: 600,
                                        position: 'relative',
                                        '& svg': {
                                            maxWidth: '100%',
                                            height: 'auto'
                                        }
                                    }}>
                                        <svg width="100%" height="100%" viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">
                                            <defs>
                                                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                                    <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                                                </marker>
                                            </defs>

                                            {/* Project Analysis Node */}
                                            <rect x="50" y="50" width="200" height="100" rx="10" fill="#fff" stroke="#6366f1" strokeWidth="2"/>
                                            <text x="150" y="85" textAnchor="middle" fill="#374151" fontWeight="bold">1. Project Analysis</text>
                                            <text x="150" y="105" textAnchor="middle" fill="#6b7280" fontSize="12">Requirements Gathering</text>
                                            <text x="150" y="125" textAnchor="middle" fill="#6b7280" fontSize="12">User Needs Analysis</text>

                                            {/* UX Design Node */}
                                            <rect x="400" y="50" width="200" height="100" rx="10" fill="#fff" stroke="#6366f1" strokeWidth="2"/>
                                            <text x="500" y="85" textAnchor="middle" fill="#374151" fontWeight="bold">2. UX Design</text>
                                            <text x="500" y="105" textAnchor="middle" fill="#6b7280" fontSize="12">Information Architecture</text>
                                            <text x="500" y="125" textAnchor="middle" fill="#6b7280" fontSize="12">User Flow Mapping</text>

                                            {/* Content Structure Node */}
                                            <rect x="50" y="250" width="200" height="100" rx="10" fill="#fff" stroke="#6366f1" strokeWidth="2"/>
                                            <text x="150" y="285" textAnchor="middle" fill="#374151" fontWeight="bold">3. Content Structure</text>
                                            <text x="150" y="305" textAnchor="middle" fill="#6b7280" fontSize="12">Content Hierarchy</text>
                                            <text x="150" y="325" textAnchor="middle" fill="#6b7280" fontSize="12">Component Layout</text>

                                            {/* Visual Design Node */}
                                            <rect x="400" y="250" width="200" height="100" rx="10" fill="#fff" stroke="#6366f1" strokeWidth="2"/>
                                            <text x="500" y="285" textAnchor="middle" fill="#374151" fontWeight="bold">4. Visual Design</text>
                                            <text x="500" y="305" textAnchor="middle" fill="#6b7280" fontSize="12">Style Guidelines</text>
                                            <text x="500" y="325" textAnchor="middle" fill="#6b7280" fontSize="12">Component Design</text>

                                            {/* Final Wireframe Node */}
                                            <rect x="225" y="450" width="200" height="100" rx="10" fill="#10b981" stroke="#059669" strokeWidth="2"/>
                                            <text x="325" y="485" textAnchor="middle" fill="#fff" fontWeight="bold">5. Final Wireframe</text>
                                            <text x="325" y="505" textAnchor="middle" fill="#fff" fontSize="12">Interactive Preview</text>
                                            <text x="325" y="525" textAnchor="middle" fill="#fff" fontSize="12">Export Options</text>

                                            {/* Connecting Arrows */}
                                            <path d="M250 100 L400 100" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrowhead)" />
                                            <path d="M500 150 L500 250" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrowhead)" />
                                            <path d="M400 300 L250 300" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrowhead)" />
                                            <path d="M150 350 L325 450" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrowhead)" />
                                            <path d="M500 350 L325 450" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrowhead)" />
                                        </svg>
                                    </Box>
                                    {/* Key Steps Summary */}
                                    <Box sx={{ mt: 4, px: 2 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                                            Generation Process Overview
                                        </Typography>
                                        <Box component="ul" sx={{ pl: 2 }}>
                                            <Box component="li" sx={{ mb: 1 }}>
                                                <strong>Project Analysis:</strong> Understanding your requirements and target audience.
                                            </Box>
                                            <Box component="li" sx={{ mb: 1 }}>
                                                <strong>UX Design:</strong> Mapping user flows and information architecture.
                                            </Box>
                                            <Box component="li" sx={{ mb: 1 }}>
                                                <strong>Content Structure:</strong> Organizing content hierarchy and component layouts.
                                            </Box>
                                            <Box component="li" sx={{ mb: 1 }}>
                                                <strong>Visual Design:</strong> Applying style guidelines and component design patterns.
                                            </Box>
                                            <Box component="li" sx={{ mb: 1 }}>
                                                <strong>Final Wireframe:</strong> Interactive preview with editing capabilities.
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </>
                ) : (
                    // Welcome state when no wireframe is generated yet
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexGrow: 1,
                        textAlign: 'center',
                        p: 4,
                        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            width: '200%',
                            height: '200%',
                            top: '-50%',
                            left: '-50%',
                            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0) 70%)',
                            animation: 'pulse 15s ease-in-out infinite'
                        },
                        '@keyframes pulse': {
                            '0%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.2)' },
                            '100%': { transform: 'scale(1)' }
                        }
                    }}>
                        <AutoAwesomeIcon sx={{ fontSize: 80, color: '#6366f1', mb: 3, opacity: 0.7 }} />
                        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, color: '#374151' }}>
                            AI Wireframe Generator
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 4, color: '#6b7280', maxWidth: 400 }}>
                            Start chatting with the AI assistant to create your perfect wireframe
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mb: 4 }}>
                            {[
                                "E-commerce checkout page",
                                "Dashboard with charts", 
                                "Mobile app login screen",
                                "Blog homepage layout"
                            ].map((example, index) => (
                                <Chip
                                    key={index}
                                    label={example}
                                    onClick={() => setInputValue(example)}
                                    variant="outlined"
                                    sx={{ 
                                        cursor: 'pointer',
                                        borderColor: 'rgba(99, 102, 241, 0.3)',
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(8px)',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': { 
                                            backgroundColor: '#ffffff',
                                            borderColor: '#6366f1',
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)'
                                        },
                                        '&:active': {
                                            transform: 'translateY(0)',
                                            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)'
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                        
                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                            💡 The AI will ask clarifying questions to create the perfect wireframe for you
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default WireframeGenerator;