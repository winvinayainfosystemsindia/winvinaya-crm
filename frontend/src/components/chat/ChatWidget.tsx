import React, { useState, useEffect, useRef } from 'react';
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
	Divider
} from '@mui/material';
import {
	SmartToy as RobotIcon,
	Close as CloseIcon,
	Send as SendIcon
} from '@mui/icons-material';
import { chatService, type ChatMessage } from '../../services/chatService';
import { settingsService } from '../../services/settingsService';

const ChatWidget: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isEnabled, setIsEnabled] = useState(false);
	const [message, setMessage] = useState('');
	const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
	const [loading, setLoading] = useState(false);
	const chatEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		checkEnabled();
	}, []);

	useEffect(() => {
		if (chatEndRef.current) {
			chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [chatHistory, loading]);

	const checkEnabled = async () => {
		try {
			const settings = await settingsService.getSystemSettings();
			const aiEnabled = settings.find(s => s.key === 'ai_enabled')?.value === 'true';
			setIsEnabled(aiEnabled);
		} catch (error) {
			console.error('Failed to check AI status:', error);
		}
	};

	const handleSend = async () => {
		if (!message.trim()) return;

		const userMsg: ChatMessage = { role: 'user', content: message };
		const currentHistory = [...chatHistory, userMsg];

		setChatHistory(currentHistory);
		setMessage('');
		setLoading(true);

		try {
			const data = await chatService.sendMessage(userMsg.content, chatHistory);
			setChatHistory([...currentHistory, { role: 'assistant', content: data.response }]);
		} catch (error) {
			setChatHistory([...currentHistory, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the AI service. Please try again later." }]);
		} finally {
			setLoading(false);
		}
	};

	if (!isEnabled) return null;

	return (
		<Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
			<Fab
				color="primary"
				onClick={() => setIsOpen(!isOpen)}
				sx={{
					bgcolor: '#ec7211',
					'&:hover': { bgcolor: '#eb5f07' },
					boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
				}}
			>
				{isOpen ? <CloseIcon /> : <RobotIcon />}
			</Fab>

			<Fade in={isOpen}>
				<Paper
					elevation={6}
					sx={{
						position: 'absolute',
						bottom: 72,
						right: 0,
						width: { xs: 'calc(100vw - 48px)', sm: 360 },
						maxHeight: 500,
						display: 'flex',
						flexDirection: 'column',
						borderRadius: '8px',
						overflow: 'hidden'
					}}
				>
					{/* Header */}
					<Box sx={{ p: 2, bgcolor: '#232f3e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<Stack direction="row" spacing={1.5} alignItems="center">
							<Avatar sx={{ bgcolor: '#ec7211', width: 32, height: 32 }}>
								<RobotIcon sx={{ fontSize: 20 }} />
							</Avatar>
							<Box>
								<Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>WinVinaya AI</Typography>
								<Typography variant="caption" sx={{ opacity: 0.8 }}>Online</Typography>
							</Box>
						</Stack>
						<IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
							<CloseIcon fontSize="small" />
						</IconButton>
					</Box>

					{/* Chat Window */}
					<Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: '#f2f3f3', minHeight: 300 }}>
						{chatHistory.length === 0 && (
							<Box sx={{ textAlign: 'center', mt: 8, opacity: 0.6 }}>
								<RobotIcon sx={{ fontSize: 48, mb: 1 }} />
								<Typography variant="body2">How can I help you today?</Typography>
							</Box>
						)}
						<Stack spacing={2}>
							{chatHistory.map((msg, i) => (
								<Box
									key={i}
									sx={{
										alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
										maxWidth: '85%'
									}}
								>
									<Paper
										sx={{
											p: 1.5,
											bgcolor: msg.role === 'user' ? '#0073bb' : 'white',
											color: msg.role === 'user' ? 'white' : 'text.primary',
											borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px'
										}}
									>
										<Typography variant="body2">{msg.content}</Typography>
									</Paper>
								</Box>
							))}
							{loading && (
								<Box sx={{ alignSelf: 'flex-start' }}>
									<CircularProgress size={20} sx={{ color: '#ec7211' }} />
								</Box>
							)}
							<div ref={chatEndRef} />
						</Stack>
					</Box>

					<Divider />

					{/* Input Area */}
					<Box sx={{ p: 2, bgcolor: 'white' }}>
						<TextField
							fullWidth
							size="small"
							placeholder="Type a message..."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyPress={(e) => e.key === 'Enter' && handleSend()}
							InputProps={{
								endAdornment: (
									<IconButton size="small" onClick={handleSend} disabled={loading || !message.trim()} sx={{ color: '#ec7211' }}>
										<SendIcon />
									</IconButton>
								)
							}}
						/>
					</Box>
				</Paper>
			</Fade>
		</Box>
	);
};

export default ChatWidget;
