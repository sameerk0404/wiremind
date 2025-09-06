import { Alert, Box, Button, CircularProgress, Paper, Tab, Tabs, TextField, Typography, IconButton, Avatar, Chip } from '@mui/material'
import React, { useState, useRef, useEffect } from 'react'
import { generateWireframe } from '../api/wireframeApi'
import type { WireframeResponse } from '../types/types'
import SvgRenderer from './SvgRenderer'
import CodeDisplay from './CodeDisplay'
import PreviewIcon from '@mui/icons-material/Preview';
import CodeIcon from '@mui/icons-material/Code';
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

const WireframeGenerator = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: "Hi! I'm your AI wireframe assistant. Tell me about the interface you'd like to create, and I'll ask a few questions to make sure I build exactly what you need.",
            timestamp: new Date(),
            isQuestion: false
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [wireframeResponse, setWireframeResponse] = useState<WireframeResponse | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [questionCount, setQuestionCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        // Decide whether to ask more questions or generate wireframe
        if (shouldGenerateWireframe(inputValue, messages.length)) {
            await generateWireframeFromChat();
        } else {
            // Ask clarifying questions
            setTimeout(() => {
                const aiResponse = getAIResponse(inputValue, messages, questionCount);
                setMessages(prev => [...prev, aiResponse]);
                setQuestionCount(prev => prev + 1);
                setIsLoading(false);
            }, 1000);
        }
    };

    const getAIResponse = (userInput: string, currentMessages: ChatMessage[], count: number): ChatMessage => {
        const responses = [
            "Great! Let me ask a few questions to create the perfect wireframe for you. What type of project is this - a website, mobile app, dashboard, or something else?",
            "Perfect! Who will be using this interface? Understanding your target audience helps me design better user flows.",
            "Excellent! What platform will this be used on primarily - desktop, mobile, tablet, or should it be responsive across all devices?",
            "Thanks! What are the most important features or sections you need? For example: user login, product catalog, contact forms, etc.",
            "Great context! Any style preferences? Modern/minimalist, corporate, creative, or should I decide based on the project type?",
            "Perfect! I have enough information now. Let me create your wireframe! 🎨"
        ];

        const isQuestion = count < responses.length - 1;
        
        return {
            role: 'assistant',
            content: responses[Math.min(count, responses.length - 1)],
            timestamp: new Date(),
            isQuestion
        };
    };

    const shouldGenerateWireframe = (userInput: string, messageCount: number): boolean => {
        return (
            userInput.toLowerCase().includes('generate') ||
            userInput.toLowerCase().includes('create') ||
            userInput.toLowerCase().includes('build') ||
            userInput.toLowerCase().includes('skip') ||
            questionCount >= 4 ||
            messageCount >= 10
        );
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

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const resetConversation = () => {
        setMessages([
            {
                role: 'assistant',
                content: "Hi! I'm your AI wireframe assistant. Tell me about the interface you'd like to create, and I'll ask a few questions to make sure I build exactly what you need.",
                timestamp: new Date(),
                isQuestion: false
            }
        ]);
        setWireframeResponse(null);
        setQuestionCount(0);
        setInputValue('');
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const formatTime = (timestamp: Date) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Replit-style split-screen layout
    return (
        <Box sx={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>
            {/* Left Panel - Chat Interface */}
            <Box sx={{
                width: '420px',
                borderRight: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f8fafc'
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
                            Wireframe Assistant
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
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                ...(message.role === 'assistant' && {
                                    border: '1px solid #e5e7eb'
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
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
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
                                    fontSize: '0.9rem'
                                }
                            }}
                        />
                        <IconButton 
                            onClick={handleSendMessage}
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
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {wireframeResponse ? (
                    <>
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
                        backgroundColor: '#fafafa'
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
                                        '&:hover': { 
                                            backgroundColor: '#f3f4f6',
                                            borderColor: '#6366f1'
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