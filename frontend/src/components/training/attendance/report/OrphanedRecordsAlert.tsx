import React from 'react';
import { Box, Paper, Typography, Button, Tooltip } from '@mui/material';
import { WarningAmber as WarningIcon, DeleteForever as DeleteForeverIcon } from '@mui/icons-material';

export interface OrphanedCandidate {
	candidateId: number;
	name: string;
	count: number;
}

interface OrphanedRecordsAlertProps {
	orphanedCandidates: OrphanedCandidate[];
	onClear: (candidate: OrphanedCandidate) => void;
}

const OrphanedRecordsAlert: React.FC<OrphanedRecordsAlertProps> = ({ orphanedCandidates, onClear }) => {
	if (orphanedCandidates.length === 0) return null;

	return (
		<Paper
			variant="outlined"
			sx={{ mb: 3, borderColor: '#ff9900', borderRadius: '8px', overflow: 'hidden' }}
		>
			{/* Header */}
			<Box sx={{ bgcolor: '#fff8ee', px: 2.5, py: 1.5, borderBottom: '1px solid #ffe0a0', display: 'flex', alignItems: 'center', gap: 1 }}>
				<WarningIcon sx={{ color: '#e65100', fontSize: 20 }} />
				<Box>
					<Typography variant="body2" sx={{ fontWeight: 700, color: '#b34900' }}>
						Orphaned Attendance Records Found
					</Typography>
					<Typography variant="caption" color="text.secondary">
						These candidates were removed from this batch but still have attendance records here. Clear them to keep data clean.
					</Typography>
				</Box>
			</Box>

			{/* Candidate rows */}
			{orphanedCandidates.map(oc => (
				<Box
					key={oc.candidateId}
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						px: 2.5,
						py: 1.25,
						borderBottom: '1px solid #fdebd0',
						'&:last-child': { borderBottom: 'none' },
						bgcolor: 'white',
					}}
				>
					<Box>
						<Typography variant="body2" sx={{ fontWeight: 600, color: '#232f3e' }}>
							{oc.name}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							{oc.count} record{oc.count !== 1 ? 's' : ''} — no longer allocated to this batch
						</Typography>
					</Box>
					<Tooltip title={`Clear all ${oc.count} records for ${oc.name}`}>
						<Button
							variant="outlined"
							color="error"
							size="small"
							startIcon={<DeleteForeverIcon />}
							onClick={() => onClear(oc)}
							sx={{ textTransform: 'none', borderRadius: '6px', fontWeight: 600 }}
						>
							Clear {oc.count} Record{oc.count !== 1 ? 's' : ''}
						</Button>
					</Tooltip>
				</Box>
			))}
		</Paper>
	);
};

export default OrphanedRecordsAlert;
