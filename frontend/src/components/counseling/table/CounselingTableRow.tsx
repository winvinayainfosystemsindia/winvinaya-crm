import React from 'react';
import {
	TableCell,
	TableRow,
	Typography,
	Box,
	Tooltip,
	Chip,
	Button,
} from '@mui/material';
import { format } from 'date-fns';
import {
	Accessible,
	VerifiedUser,
	AssignmentTurnedIn,
	CheckCircle,
	Cancel,
	WatchLater,
	HelpOutline,
	Edit,
} from '@mui/icons-material';
import type { CandidateListItem } from '../../../models/candidate';

interface CounselingTableRowProps {
	candidate: CandidateListItem;
	type: 'not_counseled' | 'pending' | 'selected' | 'rejected' | 'counseled';
	onAction: (action: 'counsel' | 'edit', candidate: CandidateListItem) => void;
}

const CounselingTableRow: React.FC<CounselingTableRowProps> = ({
	candidate,
	type,
	onAction,
}) => {
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
					<Tooltip title="Verified Profile">
						<VerifiedUser sx={{ color: '#4caf50', fontSize: 20 }} />
					</Tooltip>
				</Box>
			</TableCell>
			<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
				<Typography variant="body2" color="text.secondary">
					{candidate.phone}
				</Typography>
			</TableCell>
			<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
				<Typography variant="body2" color="text.secondary">
					{candidate.city}, {candidate.state}
				</Typography>
			</TableCell>
			<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
				<Typography variant="body2" color="text.secondary">
					{candidate.education_level || '-'}
				</Typography>
			</TableCell>
			<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
				<Typography variant="body2" color="text.secondary">
					{candidate.disability_type || '-'}
				</Typography>
			</TableCell>

			{/* Status Column (Only if not 'Not Counseled') */}
			{type !== 'not_counseled' && (
				<TableCell>
					<Chip
						label={candidate.counseling_status === 'pending' ? 'In Progress' : ((candidate.counseling_status || 'pending').charAt(0).toUpperCase() + (candidate.counseling_status || 'pending').slice(1))}
						size="small"
						icon={
							candidate.counseling_status === 'selected' ? <CheckCircle /> :
								candidate.counseling_status === 'rejected' ? <Cancel /> :
									candidate.counseling_status === 'pending' ? <WatchLater /> :
										<HelpOutline />
						}
						sx={{
							height: 24,
							fontSize: '0.75rem',
							fontWeight: 700,
							borderRadius: 1,
							bgcolor:
								candidate.counseling_status === 'selected' ? '#e8f5e9' :
									candidate.counseling_status === 'rejected' ? '#ffebee' :
										candidate.counseling_status === 'pending' ? '#fff3e0' :
											'#f5f5f5',
							color:
								candidate.counseling_status === 'selected' ? '#2e7d32' :
									candidate.counseling_status === 'rejected' ? '#d32f2f' :
										candidate.counseling_status === 'pending' ? '#ed6c02' :
											'#757575',
							'& .MuiChip-icon': {
								color: 'inherit',
								fontSize: 16
							}
						}}
					/>
				</TableCell>
			)}

			{/* Counselor Name & Date (Only if not 'Not Counseled') */}
			{type !== 'not_counseled' && (
				<>
					<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{candidate.counselor_name || '-'}</TableCell>
					<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{candidate.counseling_date ? format(new Date(candidate.counseling_date), 'dd MMM yyyy') : '-'}</TableCell>
				</>
			)}

			{/* Actions */}
			<TableCell align="right">
				{(type === 'not_counseled' && !candidate.counseling_status) ? (
					<Button
						variant="contained"
						size="small"
						startIcon={<AssignmentTurnedIn />}
						onClick={() => onAction('counsel', candidate)}
						sx={{
							textTransform: 'none',
							bgcolor: '#1976d2',
							'&:hover': { bgcolor: '#115293' }
						}}
					>
						Counsel
					</Button>
				) : (
					<Button
						variant="outlined"
						size="small"
						startIcon={<Edit fontSize="small" />}
						onClick={() => onAction('edit', candidate)}
						sx={{ textTransform: 'none' }}
					>
						Edit
					</Button>
				)}
			</TableCell>
		</TableRow>
	);
};

export default React.memo(CounselingTableRow);
