import React, { useState } from 'react';
import {
	Box,
	Typography,
	Button,
	Stack,
	Paper,
	useTheme,
	alpha,
	Chip
} from '@mui/material';
import {
	History as HistoryIcon,
	AddComment as AddIcon,
	Comment as CommentIcon,
	LightbulbOutlined as LightbulbIcon,
} from '@mui/icons-material';
import useDateTime from '../../hooks/useDateTime';
import RichTextEditor from './RichTextEditor';

export interface RemarksProps {
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
	disabled?: boolean;
	analystName?: string;
}

const quickTemplates = [
	{ label: '🌟 Tech Excellence', text: 'Demonstrated outstanding technical proficiency, structured logic, and clean coding standards.' },
	{ label: '🗣️ Communication Focus', text: 'Exhibits strong verbal clarity and articulates technical thoughts effectively.' },
	{ label: '🚀 Interview Ready', text: 'Highly recommended for immediate placement interviews and company mock evaluations.' },
	{ label: '📚 Core Training Needs', text: 'Requires additional structured training focus in foundational concepts and advanced topics.' }
];

export const Remarks: React.FC<RemarksProps> = ({
	value,
	onChange,
	placeholder = 'Enter new remarks here...',
	disabled = false,
	analystName
}) => {
	const [newRemark, setNewRemark] = useState('');
	const { formatDateTime } = useDateTime();
	const theme = useTheme();

	const handleAddRemark = () => {
		const cleanText = newRemark.replace(/<[^>]*>/g, '').trim();
		if (!cleanText || newRemark === '<p><br></p>') return;

		const formattedTime = formatDateTime(new Date());
		const authorStr = analystName ? ` by ${analystName}` : '';

		// Styled timestamp header inside a bullet marker format
		const header = `<span style="color: ${theme.palette.primary.main}; font-weight: 800; font-size: 0.72rem; letter-spacing: 0.05em; display: block; border-bottom: 1px dashed rgba(0,0,0,0.06); padding-bottom: 6px; margin-bottom: 6px;">[${formattedTime}${authorStr}]</span>`;

		let finalEntry = '';
		if (newRemark.startsWith('<p>')) {
			finalEntry = newRemark.replace('<p>', `<p>${header}`);
		} else {
			finalEntry = `<p>${header}${newRemark}</p>`;
		}

		// Append to history
		const updatedValue = value ? `${value}\n${finalEntry}` : finalEntry;

		onChange(updatedValue);
		setNewRemark('');
	};

	const handleApplyTemplate = (text: string) => {
		setNewRemark(prev => {
			const cleanPrev = prev.replace(/<p><br><\/p>$/, '').trim();
			if (!cleanPrev || cleanPrev === '<p><br></p>') {
				return `<p>${text}</p>`;
			}
			if (cleanPrev.endsWith('</p>')) {
				return cleanPrev.slice(0, -4) + ` ${text}</p>`;
			}
			return `${cleanPrev} <p>${text}</p>`;
		});
	};

	// Clean character stats
	const cleanRemarkText = newRemark.replace(/<[^>]*>/g, '').trim();
	const charCount = cleanRemarkText.length;
	const wordCount = cleanRemarkText ? cleanRemarkText.split(/\s+/).length : 0;

	return (
		<Stack spacing={4} sx={{ width: '100%' }}>
			{/* Remarks History Container */}
			<Box>
				<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
					<Stack direction="row" alignItems="center" spacing={1.5}>
						<Box
							sx={{
								display: 'flex',
								p: 0.75,
								borderRadius: 1.5,
								bgcolor: alpha(theme.palette.primary.main, 0.08),
								color: 'primary.main'
							}}
						>
							<HistoryIcon sx={{ fontSize: 18 }} />
						</Box>
						<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '0.01em' }}>
							Remarks History
						</Typography>
					</Stack>
					{value && (
						<Chip
							label="Historical Log"
							size="small"
							variant="outlined"
							sx={{
								fontSize: '0.68rem',
								fontWeight: 700,
								color: 'text.secondary',
								borderColor: '#e2e8f0',
								bgcolor: '#f8fafc'
							}}
						/>
					)}
				</Stack>

				{/* History List */}
				{value ? (
					<Paper
						elevation={0}
						variant="outlined"
						sx={{
							maxHeight: '360px',
							overflowY: 'auto',
							p: 3,
							borderRadius: 3,
							bgcolor: 'rgba(248, 250, 252, 0.35)',
							borderColor: '#e2e8f0',
							background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.5) 100%)',
							boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.01)',
							'&::-webkit-scrollbar': { width: 5 },
							'&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.08)', borderRadius: 10 },
							'& p': {
								margin: '0 0 16px 0',
								padding: '16px 20px',
								borderRadius: 2.5,
								background: '#ffffff',
								border: '1px solid #f1f5f9',
								borderLeft: `4px solid ${theme.palette.primary.main}`,
								boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
								position: 'relative',
								fontSize: '0.85rem',
								lineHeight: 1.6,
								color: 'text.primary',
								transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
								'&:hover': {
									borderColor: '#e2e8f0',
									boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
									transform: 'translateY(-2px)',
									borderLeftColor: theme.palette.primary.dark
								}
							},
							'& p:last-child': { margin: 0 }
						}}
					>
						<div dangerouslySetInnerHTML={{ __html: value }} />
					</Paper>
				) : (
					<Paper
						elevation={0}
						variant="outlined"
						sx={{
							py: 6,
							px: 3,
							textAlign: 'center',
							border: '2px dashed #cbd5e1',
							borderRadius: 3,
							bgcolor: '#f8fafc',
							transition: 'all 0.2s ease',
							'&:hover': {
								borderColor: 'primary.main',
								bgcolor: 'rgba(0, 77, 230, 0.01)'
							}
						}}
					>
						<CommentIcon sx={{ fontSize: 36, color: 'text.secondary', opacity: 0.35, mb: 1.5 }} />
						<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							No Remarks Recorded
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
							Use the input panel below to add a remark.
						</Typography>
					</Paper>
				)}
			</Box>

			{/* Add New Remark Section */}
			{!disabled && (
				<Paper
					variant="outlined"
					sx={{
						p: 3,
						borderRadius: 3,
						borderColor: '#e2e8f0',
						bgcolor: '#ffffff',
						boxShadow: '0 2px 12px rgba(15, 23, 42, 0.02)',
						transition: 'all 0.2s ease',
						'&:hover': {
							borderColor: alpha(theme.palette.primary.main, 0.25),
							boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
						}
					}}
				>
					<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
						<Box
							sx={{
								display: 'flex',
								p: 0.75,
								borderRadius: 1.5,
								bgcolor: alpha(theme.palette.success.main, 0.08),
								color: 'success.main'
							}}
						>
							<AddIcon sx={{ fontSize: 18 }} />
						</Box>
						<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '0.01em' }}>
							Add a Remark
						</Typography>
					</Stack>

					{/* Quick Templates Drawer */}
					<Box sx={{ mb: 2.5 }}>
						<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
							<LightbulbIcon sx={{ fontSize: 16, color: 'primary.main' }} />
							<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
								Quick-Insert Templates
							</Typography>
						</Stack>
						<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
							{quickTemplates.map((t, idx) => (
								<Chip
									key={idx}
									label={t.label}
									onClick={() => handleApplyTemplate(t.text)}
									size="small"
									sx={{
										borderRadius: 1.5,
										fontSize: '0.72rem',
										fontWeight: 600,
										bgcolor: '#f8fafc',
										border: '1px solid #f1f5f9',
										'&:hover': {
											bgcolor: alpha(theme.palette.primary.main, 0.05),
											borderColor: alpha(theme.palette.primary.main, 0.2),
											color: 'primary.main'
										}
									}}
								/>
							))}
						</Stack>
					</Box>

					<Stack spacing={2}>
						<RichTextEditor
							value={newRemark}
							onChange={setNewRemark}
							placeholder={placeholder}
							themeColor={theme.palette.primary.main}
						/>

						{/* Character Stats & Button Row */}
						<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
							<Stack direction="row" spacing={2} sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}>
								<Box>Characters: <strong>{charCount}</strong></Box>
								<Box>Words: <strong>{wordCount}</strong></Box>
							</Stack>

							<Button
								variant="contained"
								size="small"
								onClick={handleAddRemark}
								disabled={!newRemark.replace(/<[^>]*>/g, '').trim() || newRemark === '<p><br></p>'}
								sx={{
									borderRadius: 2,
									textTransform: 'none',
									px: 4,
									py: 1,
									fontWeight: 700,
									boxShadow: 'none',
									backgroundColor: theme.palette.primary.main,
									'&:hover': {
										backgroundColor: theme.palette.primary.dark,
										boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`
									}
								}}
							>
								Save Remark
							</Button>
						</Stack>
					</Stack>
				</Paper>
			)}
		</Stack>
	);
};

export default Remarks;
