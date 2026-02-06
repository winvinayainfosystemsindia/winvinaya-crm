import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLocation } from 'react-router-dom';
import {
	Box,
	Fab,
	Paper,
	Typography,
	IconButton,
	TextField,
	Avatar,
	CircularProgress,
	Fade,
	Stack,
	Chip,
	Tooltip
} from '@mui/material';
import {
	SmartToy as RobotIcon,
	Close as CloseIcon,
	Send as SendIcon,
	Lightbulb as IdeaIcon
} from '@mui/icons-material';
import { chatService, type ChatMessage } from '../../services/chatService';
import { settingsService } from '../../services/settingsService';

const SUGGESTED_QUESTIONS = [
	"Show me today's report.",
	"Candidate stats?",
	"Recent deal stats?",
	"Dharanidaran screening count?",
	"Candidates in Bangalore?"
];

const PUBLIC_PATHS = ['/login', '/candidate-registration', '/success', '/maintenance'];

const ChatWidget: React.FC = () => {
	const location = useLocation();
	const [isOpen, setIsOpen] = useState(false);
	const [isEnabled, setIsEnabled] = useState(false);
	const [message, setMessage] = useState('');
	const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
	const [loading, setLoading] = useState(false);
	const chatEndRef = useRef<HTMLDivElement>(null);

	// Check eligibility based on current route
	const isCurrentlyPublic = (pathname: string) => PUBLIC_PATHS.some(path => pathname.startsWith(path));

	const checkEnabled = async () => {
		if (isCurrentlyPublic(location.pathname)) {
			setIsEnabled(false);
			return;
		}

		try {
			const settings = await settingsService.getSystemSettings();
			const aiEnabled = settings.find(s => s.key === 'ai_enabled')?.value === 'true';
			setIsEnabled(aiEnabled);
		} catch (error) {
			console.error('Failed to check AI status:', error);
			setIsEnabled(false);
		}
	};

	useEffect(() => {
		if (isCurrentlyPublic(location.pathname)) {
			setIsEnabled(false);
		} else {
			checkEnabled();
		}
	}, [location.pathname]);

	useEffect(() => {
		if (isOpen && chatHistory.length === 0) {
			setChatHistory([{
				role: 'assistant',
				content: "Welcome to WinVinaya CRM! I am **Sarathi**, your AI assistant. How can I assist you today?"
			}]);
		}
	}, [isOpen, chatHistory.length]);

	useEffect(() => {
		if (chatEndRef.current) {
			chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [chatHistory, loading]);

	const handleSend = async (customMessage?: string) => {
		const messageToSend = customMessage || message;
		if (!messageToSend.trim()) return;

		const userMsg: ChatMessage = { role: 'user', content: messageToSend };
		const currentHistory = [...chatHistory, userMsg];

		setChatHistory(currentHistory);
		setMessage('');
		setLoading(true);

		try {
			const data = await chatService.sendMessage(userMsg.content, chatHistory);
			setChatHistory([...currentHistory, { role: 'assistant', content: data.response }]);
		} catch (error) {
			setChatHistory([...currentHistory, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting to the service. Please try again later." }]);
		} finally {
			setLoading(false);
		}
	};

	if (!isEnabled) return null;

	return (
		<Box sx={{ position: 'fixed', bottom: 14, right: 24, zIndex: 1000 }}>
			<Fab
				variant="extended"
				color="primary"
				onClick={() => setIsOpen(!isOpen)}
				sx={{
					bgcolor: '#ec7211',
					'&:hover': { bgcolor: '#eb5f07' },
					boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
					textTransform: 'none',
					fontWeight: 700,
					px: 2,
					gap: 1
				}}
			>
				{isOpen ? (
					<CloseIcon />
				) : (
					<>
						<RobotIcon />
						Ask Sarathi
					</>
				)}
			</Fab>

			<Fade in={isOpen}>
				<Paper
					elevation={6}
					sx={{
						position: 'absolute',
						bottom: 72,
						right: 0,
						width: { xs: 'calc(100vw - 48px)', sm: 400 },
						height: 550,
						maxHeight: 'calc(100vh - 120px)',
						display: 'flex',
						flexDirection: 'column',
						borderRadius: '16px',
						overflow: 'hidden',
						border: '1px solid #e2e8f0',
						boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
					}}
				>
					{/* Header */}
					<Box sx={{ p: 2.5, bgcolor: '#232f3e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<Stack direction="row" spacing={1.5} alignItems="center">
							<Avatar sx={{ bgcolor: '#ec7211', width: 40, height: 40, border: '2px solid rgba(255,255,255,0.2)' }}>
								<RobotIcon />
							</Avatar>
							<Box>
								<Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Sarathi</Typography>
								<Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem', fontWeight: 600 }}>WinVinaya AI Assistant</Typography>
							</Box>
						</Stack>
						<IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white', opacity: 0.7, '&:hover': { opacity: 1 } }}>
							<CloseIcon />
						</IconButton>
					</Box>

					{/* Chat Window */}
					<Box sx={{ flexGrow: 1, p: 2.5, overflowY: 'auto', bgcolor: '#f8fafc' }}>
						<Stack spacing={2.5}>
							{chatHistory.map((msg, i) => (
								<Box
									key={i}
									sx={{
										alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
										maxWidth: msg.role === 'user' ? '80%' : '90%'
									}}
								>
									<Paper
										elevation={0}
										sx={{
											p: 2,
											bgcolor: msg.role === 'user' ? '#0073bb' : 'white',
											color: msg.role === 'user' ? 'white' : '#1e293b',
											borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
											border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
											boxShadow: msg.role === 'user' ? '0 4px 6px -1px rgba(0,115,187,0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
											'& p': { m: 0, fontSize: '0.925rem', lineHeight: 1.6 },
											'& ul, & ol': { m: '8px 0', pl: 3 },
											'& li': { mb: 0.5 },
											'& table': { borderCollapse: 'collapse', width: '100%', my: 1 },
											'& th, & td': { border: '1px solid #e2e8f0', p: 1, fontSize: '0.85rem' },
											'& th': { bgcolor: '#f1f5f9' },
											'& strong': { fontWeight: 700 }
										}}
									>
										{msg.role === 'user' ? (
											<Typography variant="body2">{msg.content}</Typography>
										) : (
											<ReactMarkdown remarkPlugins={[remarkGfm]}>
												{msg.content}
											</ReactMarkdown>
										)}
									</Paper>
								</Box>
							))}
							{loading && (
								<Box sx={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
									<Paper
										elevation={0}
										sx={{
											p: 2,
											bgcolor: 'white',
											color: '#1e293b',
											borderRadius: '18px 18px 18px 2px',
											border: '1px solid #e2e8f0',
											display: 'flex',
											alignItems: 'center',
											gap: 2
										}}
									>
										<CircularProgress size={18} sx={{ color: '#ec7211' }} />
										<Typography variant="body2" sx={{ fontStyle: 'italic', fontWeight: 500, color: '#64748b' }}>
											Sarathi is gathering details...
										</Typography>
									</Paper>
								</Box>
							)}
							<div ref={chatEndRef} />
						</Stack>
					</Box>

					{/* Bottom Suggestions & Input */}
					<Box sx={{ borderTop: '1px solid #e2e8f0', bgcolor: 'white' }}>
						{/* Persistent Suggestions */}
						<Box sx={{ px: 2, pt: 1.5, pb: 0.5, bgcolor: '#f8fafc' }}>
							<Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center" sx={{ pb: 1 }}>
								<IdeaIcon sx={{ fontSize: 16, color: '#ec7211', ml: 0.5 }} />
								{SUGGESTED_QUESTIONS.map((q, idx) => (
									<Chip
										key={idx}
										label={q}
										onClick={() => handleSend(q)}
										size="small"
										sx={{
											bgcolor: 'white',
											border: '1px solid #e2e8f0',
											fontSize: '0.75rem',
											fontWeight: 600,
											color: '#475569',
											cursor: 'pointer',
											'&:hover': {
												bgcolor: 'white',
												borderColor: '#ec7211',
												color: '#ec7211',
												boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
											},
											transition: 'all 0.2s',
											height: 28,
											whiteSpace: 'nowrap'
										}}
									/>
								))}
							</Stack>
						</Box>

						{/* Input Area */}
						<Box sx={{ p: 2 }}>
							<TextField
								fullWidth
								size="small"
								placeholder="Ask me about candidates, deals, or reports..."
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
								multiline
								maxRows={3}
								sx={{
									'& .MuiOutlinedInput-root': {
										borderRadius: '12px',
										bgcolor: '#f1f5f9',
										'& fieldset': { border: 'none' },
										'&:hover fieldset': { border: 'none' },
										'&.Mui-focused fieldset': { border: '1px solid #ec7211' }
									}
								}}
								InputProps={{
									endAdornment: (
										<Tooltip title="Send Message">
											<IconButton
												size="small"
												onClick={() => handleSend()}
												disabled={loading || !message.trim()}
												sx={{
													color: '#ec7211',
													bgcolor: message.trim() ? 'rgba(236,114,17,0.1)' : 'transparent',
													'&:hover': { bgcolor: 'rgba(236,114,17,0.2)' }
												}}
											>
												<SendIcon sx={{ fontSize: 20 }} />
											</IconButton>
										</Tooltip>
									)
								}}
							/>
						</Box>
					</Box>
				</Paper>
			</Fade>
		</Box>
	);
};

export default ChatWidget;
