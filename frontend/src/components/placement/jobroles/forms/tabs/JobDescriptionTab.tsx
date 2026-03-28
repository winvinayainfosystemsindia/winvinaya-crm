import React, { useRef } from 'react';
import {
	Grid,
	TextField,
	Box,
	Stack,
	IconButton,
	Tooltip,
	Divider,
	Typography,
	Paper
} from '@mui/material';
import {
	FormatBold as BoldIcon,
	FormatItalic as ItalicIcon,
	FormatListBulleted as ListIcon,
	FormatListNumbered as NumberedIcon,
	FormatQuote as QuoteIcon,
	Code as CodeIcon,
	DescriptionOutlined as DescriptionIcon,
	InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { awsStyles } from '../../../../../theme/theme';
import type { JobRole } from '../../../../../models/jobRole';

interface JobDescriptionTabProps {
	formData: Partial<JobRole>;
	handleChange: (field: string, value: any) => void;
}

const JobDescriptionTab: React.FC<JobDescriptionTabProps> = ({
	formData,
	handleChange
}) => {
	const { awsPanel, helperBox } = awsStyles;
	const textFieldRef = useRef<HTMLTextAreaElement>(null);

	const applyFormatting = (prefix: string, suffix: string = '', isBlock: boolean = false) => {
		const textField = textFieldRef.current;
		if (!textField) return;

		const start = textField.selectionStart;
		const end = textField.selectionEnd;
		const text = formData.description || '';
		const selectedText = text.substring(start, end);

		let replacement = '';
		let needsNewline = false;
		if (isBlock) {
			const beforeText = text.substring(0, start);
			needsNewline = beforeText.length > 0 && !beforeText.endsWith('\n');
			replacement = `${needsNewline ? '\n' : ''}${prefix}${selectedText}${suffix}`;
		} else {
			replacement = `${prefix}${selectedText}${suffix}`;
		}

		const newText = text.substring(0, start) + replacement + text.substring(end);
		handleChange('description', newText);

		// Re-focus and set selection
		setTimeout(() => {
			if (textFieldRef.current) {
				const textField = textFieldRef.current;
				textField.focus();
				const newPos = start + prefix.length + (needsNewline ? 1 : 0);
				textField.setSelectionRange(newPos, newPos + selectedText.length);
			}
		}, 0);
	};

	return (
		<Stack spacing={4}>
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: 'secondary.main', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<DescriptionIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography variant="awsSectionTitle">Comprehensive Job Narrative</Typography>
				</Stack>

				<Box sx={helperBox}>
					<InfoIcon sx={{ color: '#007eb9', mt: 0.25, fontSize: 20 }} />
					<Typography variant="body2" sx={{ color: '#007eb9', fontWeight: 500 }}>
						Provide a detailed overview of the role using the formatting toolbar for bullet points and emphasis. This content is Markdown-compatible.
					</Typography>
				</Box>

				<Divider sx={{ mb: 4, borderColor: '#eaeded' }} />

				<Grid container spacing={2} sx={{ width: '100%' }}>
					<Grid size={{ xs: 12 }}>
						<Box sx={{ width: '100%' }}>
							<Typography variant="awsFieldLabel">Job Description Content</Typography>
							<Box sx={{ 
								border: '1px solid #d5dbdb', 
								borderRadius: '2px', 
								bgcolor: '#fafafa',
								overflow: 'hidden'
							}}>
								{/* Formatting Toolbar */}
								<Stack 
									direction="row" 
									spacing={0.5} 
									sx={{ 
										p: 0.5, 
										bgcolor: '#fff', 
										borderBottom: '1px solid #d5dbdb' 
									}}
								>
									<Tooltip title="Bold (Markdown)">
										<IconButton size="small" onClick={() => applyFormatting('**', '**')}>
											<BoldIcon fontSize="small" />
										</IconButton>
									</Tooltip>
									<Tooltip title="Italic (Markdown)">
										<IconButton size="small" onClick={() => applyFormatting('_', '_')}>
											<ItalicIcon fontSize="small" />
										</IconButton>
									</Tooltip>
									<Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
									<Tooltip title="Bullet List">
										<IconButton size="small" onClick={() => applyFormatting('- ', '', true)}>
											<ListIcon fontSize="small" />
										</IconButton>
									</Tooltip>
									<Tooltip title="Numbered List">
										<IconButton size="small" onClick={() => applyFormatting('1. ', '', true)}>
											<NumberedIcon fontSize="small" />
										</IconButton>
									</Tooltip>
									<Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
									<Tooltip title="Quote">
										<IconButton size="small" onClick={() => applyFormatting('> ', '', true)}>
											<QuoteIcon fontSize="small" />
										</IconButton>
									</Tooltip>
									<Tooltip title="Code">
										<IconButton size="small" onClick={() => applyFormatting('`', '`')}>
											<CodeIcon fontSize="small" />
										</IconButton>
									</Tooltip>
								</Stack>

								{/* Editor Area */}
								<TextField
									fullWidth
									multiline
									rows={20}
									placeholder="Enter detailed job description here..."
									value={formData.description || ''}
									onChange={(e) => handleChange('description', e.target.value)}
									inputRef={textFieldRef}
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: 0,
											'& fieldset': { border: 'none' },
											bgcolor: 'white',
											fontFamily: '"Roboto Mono", monospace',
											fontSize: '0.875rem',
											lineHeight: 1.6,
											p: 2
										}
									}}
								/>
								
								{/* Footer info */}
								<Box sx={{ p: 1, borderTop: '1px solid #f2f3f3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
										Supported: Markdown syntax
									</Typography>
									<Typography variant="caption" sx={{ 
										color: (formData.description || '').length > 2000 ? 'error.main' : 'text.secondary', 
										mr: 1,
										fontWeight: 600
									}}>
										{(formData.description || '').length}/2000 characters
									</Typography>
								</Box>
							</Box>
						</Box>
					</Grid>
				</Grid>
			</Paper>
		</Stack>
	);
};

export default JobDescriptionTab;
