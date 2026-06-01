import React, { useState } from 'react';
import { Box, Typography, Button, Stack, Paper, useTheme, alpha } from '@mui/material';
import { History as HistoryIcon, AddComment as AddIcon } from '@mui/icons-material';
import useDateTime from '../../hooks/useDateTime';
import RichTextEditor from './RichTextEditor';

export interface RemarksProps {
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
	disabled?: boolean;
	analystName?: string;
}

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
		const header = `<span style="color: ${theme.palette.primary.main}; font-weight: 700;">[${formattedTime}${authorStr}]</span> &nbsp;`;
		
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

	return (
		<Stack spacing={3} sx={{ width: '100%' }}>
			{/* Remarks History Header */}
			<Box>
				<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
					<HistoryIcon fontSize="small" color="action" />
					<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '0.02em' }}>
						Remarks Audit Timeline
					</Typography>
				</Stack>
				
				{/* History container */}
				{value ? (
					<Paper 
						elevation={0} 
						variant="outlined" 
						sx={{ 
							maxHeight: '260px', 
							overflowY: 'auto', 
							p: 2.5, 
							borderRadius: 2.5, 
							bgcolor: '#fafafa',
							border: '1px solid #e2e8f0',
							'& p': { 
								margin: '0 0 12px 0',
								fontSize: '0.85rem',
								lineHeight: 1.6,
								color: 'text.primary'
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
							py: 4,
							px: 3,
							textAlign: 'center',
							border: '1px dashed #cbd5e1',
							borderRadius: 2.5,
							bgcolor: '#fafafa'
						}}
					>
						<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
							No historical remarks logged for this evaluation.
						</Typography>
					</Paper>
				)}
			</Box>

			{/* Add New Remark Section */}
			{!disabled && (
				<Box>
					<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
						<AddIcon fontSize="small" color="primary" />
						<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '0.02em' }}>
							Log New Observation
						</Typography>
					</Stack>
					
					<Stack spacing={2}>
						<RichTextEditor
							value={newRemark}
							onChange={setNewRemark}
							placeholder={placeholder}
							themeColor={theme.palette.primary.main}
						/>
						<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
							<Button
								variant="contained"
								size="small"
								onClick={handleAddRemark}
								disabled={!newRemark.replace(/<[^>]*>/g, '').trim() || newRemark === '<p><br></p>'}
								sx={{ 
									borderRadius: 1.5, 
									textTransform: 'none', 
									px: 3.5, 
									py: 0.8,
									fontWeight: 700,
									boxShadow: 'none',
									backgroundColor: theme.palette.primary.main,
									'&:hover': {
										backgroundColor: theme.palette.primary.dark,
										boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
									}
								}}
							>
								Log Remark
							</Button>
						</Box>
					</Stack>
				</Box>
			)}
		</Stack>
	);
};

export default Remarks;
