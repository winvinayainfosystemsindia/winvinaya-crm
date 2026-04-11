import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Fab,
  Paper,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  Stack,
  CircularProgress,
  Tooltip,
  Badge,
  Zoom,
  Fade,
  List,
  ListItem,
  Divider,
  Button,
  Chip,
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Close as CloseIcon,
  Send as SendIcon,
  History as HistoryIcon,
  Add as NewChatIcon,
  Minimize as MinimizeIcon,
  Psychology as ThinkingIcon,
  Code as ToolIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  toggleChat,
  fetchSessions,
  createSession,
  sendMessage,
  setActiveSession,
  fetchSessionDetails,
} from '../../store/slices/aiChatSlice';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AIChatWidget: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isOpen, activeSession, messages, sessions, sending, loading } = useAppSelector((state) => state.aiChat);
  const [inputValue, setInputValue] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && sessions.length === 0) {
      dispatch(fetchSessions());
    }
  }, [isOpen, sessions.length, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || !activeSession) return;
    dispatch(sendMessage({ sessionId: activeSession.id, content: inputValue }));
    setInputValue('');
  };

  const handleNewChat = () => {
    dispatch(createSession('New Conversation'));
    setShowHistory(false);
  };

  const handleSessionSelect = (sessionId: number) => {
    dispatch(fetchSessionDetails(sessionId));
    setShowHistory(false);
  };

  if (!isOpen) {
    return (
      <Zoom in={!isOpen}>
        <Fab
          color="primary"
          aria-label="chat with ai"
          onClick={() => dispatch(toggleChat())}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 60,
            height: 60,
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            boxShadow: '0 8px 32px -4px rgba(79, 70, 229, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            '&:hover': {
              transform: 'scale(1.1) translateY(-4px)',
              boxShadow: '0 12px 40px -4px rgba(79, 70, 229, 0.5)',
            }
          }}
        >
          <Badge color="error" overlap="circular" variant="dot" invisible={!sessions.length}>
            <AIIcon sx={{ fontSize: 32 }} />
          </Badge>
        </Fab>
      </Zoom>
    );
  }

  return (
    <Fade in={isOpen}>
      <Paper
        elevation={24}
        sx={{
          position: 'fixed',
          bottom: { xs: 0, sm: 24 },
          right: { xs: 0, sm: 24 },
          width: { xs: '100%', sm: 400 },
          height: { xs: '100%', sm: 600 },
          display: 'flex',
          flexDirection: 'column',
          borderRadius: { xs: 0, sm: '20px' },
          overflow: 'hidden',
          zIndex: 9999,
          backdropFilter: 'blur(20px)',
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          background: 'linear-gradient(90deg, #1e293b 0%, #334155 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <Avatar sx={{ bgcolor: '#6366f1', width: 36, height: 36 }}>
            <AIIcon fontSize="small" />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              ARIA
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              WinVinaya AI Coworker
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="New Chat">
              <IconButton size="small" color="inherit" onClick={handleNewChat}>
                <NewChatIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="History">
              <IconButton size="small" color="inherit" onClick={() => setShowHistory(!showHistory)}>
                <HistoryIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton size="small" color="inherit" onClick={() => dispatch(toggleChat())}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        {/* Action Bar (Current Logic Focus) */}
        {!showHistory && activeSession && (
          <Box sx={{ 
            px: 2, py: 1, 
            bgcolor: '#f8fafc', 
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
             <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase', fontSize: '0.65rem' }}>
               Focus: {activeSession.title}
             </Typography>
          </Box>
        )}

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
          {/* History Overly */}
          <Fade in={showHistory}>
            <Box sx={{ 
              position: 'absolute', 
              inset: 0, 
              bgcolor: 'white', 
              zIndex: 10,
              display: showHistory ? 'flex' : 'none',
              flexDirection: 'column'
            }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Conversation History</Typography>
                <IconButton size="small" onClick={() => setShowHistory(false)}><CloseIcon fontSize="small" /></IconButton>
              </Box>
              <List sx={{ overflowY: 'auto' }}>
                {sessions.map((s) => (
                  <ListItem 
                    key={s.id} 
                    component="div"
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' } }}
                    onClick={() => handleSessionSelect(s.id)}
                  >
                    <Box sx={{ py: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(s.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Fade>

          {/* Messages List */}
          <Box sx={{ 
            height: '100%', 
            overflowY: 'auto', 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column',
            gap: 2,
            bgcolor: '#fdfdfd'
          }}>
            {!activeSession && !loading && (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 4 }}>
                <Stack spacing={2} alignItems="center">
                   <Avatar sx={{ width: 64, height: 64, bgcolor: '#f1f5f9', color: '#6366f1' }}>
                     <AIIcon sx={{ fontSize: 32 }} />
                   </Avatar>
                   <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Welcome to AI Console</Typography>
                   <Typography variant="body2" color="text.secondary">
                     I'm your agentic co-worker. I can search contacts, create leads, and answer CRM questions.
                   </Typography>
                   <Button 
                    variant="contained" 
                    onClick={handleNewChat}
                    sx={{ borderRadius: '20px', textTransform: 'none', px: 4, bgcolor: '#6366f1' }}
                   >
                     Start a conversation
                   </Button>
                </Stack>
              </Box>
            )}

            {messages.map((msg, idx) => (
              <Box 
                key={idx} 
                sx={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    px: 2,
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    bgcolor: msg.role === 'user' ? '#6366f1' : '#f1f5f9',
                    color: msg.role === 'user' ? 'white' : '#1e293b',
                    border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                  }}
                >
                  <Typography variant="body2" component="div" sx={{ 
                    '& p': { m: 0 },
                    '& ul, & ol': { pl: 2, my: 1 },
                    '& code': { bgcolor: 'rgba(0,0,0,0.05)', px: 0.5, borderRadius: '4px' }
                  }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </Typography>
                </Paper>
                
                {/* Meta info / Tool badges */}
                {msg.role === 'assistant' && msg.task_log_id && (
                  <Stack direction="row" spacing={1} sx={{ ml: 1 }}>
                    <Chip 
                      size="small" 
                      icon={<ToolIcon sx={{ fontSize: '10px !important' }} />} 
                      label="Agentic Task Performed" 
                      sx={{ fontSize: '9px', height: 18, bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe' }}
                    />
                  </Stack>
                )}
              </Box>
            ))}
            
            {sending && (
              <Box sx={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: '#6366f1' }}>
                  <ThinkingIcon sx={{ fontSize: 14 }} />
                </Avatar>
                <Stack direction="row" spacing={0.5}>
                  <Box sx={{ width: 6, height: 6, bgcolor: '#cbd5e1', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                  <Box sx={{ width: 6, height: 6, bgcolor: '#cbd5e1', borderRadius: '50%', animation: 'pulse 1s infinite 0.2s' }} />
                  <Box sx={{ width: 6, height: 6, bgcolor: '#cbd5e1', borderRadius: '50%', animation: 'pulse 1s infinite 0.4s' }} />
                </Stack>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                  Thinking...
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
        </Box>

        {/* Footer / Input */}
        <Box sx={{ p: 2, bgcolor: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
          <TextField
            fullWidth
            placeholder={activeSession ? "Talk to ARIA..." : "Select a session to chat"}
            size="small"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={!activeSession || sending}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            autoComplete="off"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '24px',
                bgcolor: '#f8fafc',
                pr: 0.5
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={handleSend} 
                    disabled={!inputValue.trim() || sending}
                    sx={{ 
                      bgcolor: '#6366f1', 
                      color: 'white',
                      width: 32,
                      height: 32,
                      '&:hover': { bgcolor: '#4f46e5' },
                      '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' }
                    }}
                  >
                    <SendIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 0.3; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1.1); }
              100% { opacity: 0.3; transform: scale(0.8); }
            }
          `}
        </style>
      </Paper>
    </Fade>
  );
};

export default AIChatWidget;
