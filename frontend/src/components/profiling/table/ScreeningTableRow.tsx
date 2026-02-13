import React, { memo } from 'react';
import {
	TableRow,
	TableCell,
	Typography,
	Box,
	Tooltip,
	Chip,
	Button
} from '@mui/material';
import { Edit, Accessible, VerifiedUser, CheckCircle, Cancel, WatchLater, HelpOutline } from '@mui/icons-material';
import { format, isToday, parseISO } from 'date-fns';
import type { CandidateListItem } from '../../../models/candidate';

interface ScreeningTableRowProps {
	candidate: CandidateListItem;
	type: 'unscreened' | 'screened';
	onAction: (action: 'edit' | 'screen', candidate: CandidateListItem) => void;
}

const ScreeningTableRow: React.FC<ScreeningTableRowProps> = memo(({
	candidate,
	type,
	onAction
}) => {
	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), 'd MMM yyyy');
		} catch {
			return '-';
		}
	};

	return (
		<TableRow
			sx={{
				'&:hover': {
					bgcolor: '#f5f8fa',
				},
				'&:last-child td': {
					borderBottom: 0
				}
			}}
		>
			<TableCell>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Typography variant="body2" sx={{ fontWeight: 500 }}>
						{candidate.name}
					</Typography>
					{candidate.is_disabled && (
						<Tooltip title="Person with Disability">
							<Accessible color="primary" fontSize="small" />
						</Tooltip>
					)}
					{type === 'screened' && (
						<Tooltip title="Verified Screening">
							<VerifiedUser sx={{ color: '#4caf50', fontSize: 20 }} />
						</Tooltip>
					)}
					{isToday(parseISO(candidate.created_at)) && (
						<Chip
							label="New"
							size="small"
							color="primary"
							sx={{
								height: 20,
								fontSize: '0.65rem',
								fontWeight: 'bold',
								bgcolor: '#e3f2fd',
								color: '#1976d2'
							}}
						/>
					)}
				</Box>
			</TableCell>
			<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
				<Typography variant="body2" color="text.secondary">
					{candidate.phone}
				</Typography>
			</TableCell>
			<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
				<Typography variant="body2" color="text.secondary">
					{candidate.disability_type || 'Non-PwD'}
				</Typography>
			</TableCell>
			<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
				<Typography variant="body2" color="text.secondary">
					{candidate.education_level || '-'}
				</Typography>
			</TableCell>
			<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
				<Typography variant="body2" color="text.secondary">
					{candidate.city}, {candidate.state}
				</Typography>
			</TableCell>

			<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
				<Typography variant="body2" color="text.secondary">
					{formatDate(type === 'screened' && candidate.screening_updated_at ? candidate.screening_updated_at : candidate.created_at)}
				</Typography>
			</TableCell>
			{type !== 'unscreened' && (
				<TableCell>
					<Chip
						label={candidate.screening_status}
						size="small"
						icon={
							candidate.screening_status === 'Completed' ? <CheckCircle /> :
								candidate.screening_status === 'Rejected' || candidate.screening_status === 'Not Connected' || candidate.screening_status === 'Not Answered' ? <Cancel /> :
									candidate.screening_status === 'In Progress' ? <WatchLater /> :
										candidate.screening_status === 'Follow-up Required' ? <WatchLater /> :
											<HelpOutline />
						}
						sx={{
							height: 24,
							fontSize: '0.75rem',
							fontWeight: 700,
							borderRadius: 1,
							bgcolor:
								candidate.screening_status === 'Completed' ? '#e8f5e9' :
									candidate.screening_status === 'Rejected' || candidate.screening_status === 'Not Connected' || candidate.screening_status === 'Not Answered' ? '#ffebee' :
										candidate.screening_status === 'In Progress' ? '#e3f2fd' :
											'#f5f5f5',
							color:
								candidate.screening_status === 'Completed' ? '#2e7d32' :
									candidate.screening_status === 'Rejected' || candidate.screening_status === 'Not Connected' || candidate.screening_status === 'Not Answered' ? '#d32f2f' :
										candidate.screening_status === 'In Progress' ? '#1976d2' :
											'#757575',
							'& .MuiChip-icon': {
								color: 'inherit',
								fontSize: 16
							}
						}}
					/>
				</TableCell>
			)}
			<TableCell align="right">
				{type === 'unscreened' ? (
					<Button
						variant="contained"
						size="small"
						onClick={() => onAction('screen', candidate)}
						sx={{
							textTransform: 'none',
							bgcolor: '#1976d2',
							'&:hover': { bgcolor: '#115293' }
						}}
					>
						Screen
					</Button>
				) : (
					<Button
						variant="outlined"
						size="small"
						startIcon={<Edit fontSize="small" />}
						onClick={() => onAction('edit', candidate)}
						sx={{ textTransform: 'none' }}
					>
						Edit Screening
					</Button>
				)}
			</TableCell>
		</TableRow>
	);
});

ScreeningTableRow.displayName = 'ScreeningTableRow';

export default ScreeningTableRow;
