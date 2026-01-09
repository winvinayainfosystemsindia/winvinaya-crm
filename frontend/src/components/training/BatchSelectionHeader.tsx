import React from 'react';
import {
	Box,
	Paper,
	Typography,
	Autocomplete,
	TextField,
	Fade,
	Chip
} from '@mui/material';
import type { TrainingBatch } from '../../models/training';

interface BatchSelectionHeaderProps {
	batches: TrainingBatch[];
	selectedBatch: TrainingBatch | null;
	onBatchChange: (batch: TrainingBatch | null) => void;
	allocationCount: number;
	isMobile: boolean;
	getStatusColor: (status: string) => string;
}

const BatchSelectionHeader: React.FC<BatchSelectionHeaderProps> = ({
	batches,
	selectedBatch,
	onBatchChange,
	allocationCount,
	isMobile,
	getStatusColor
}) => {
	return (
		<Paper
			elevation={0}
			sx={{
				p: 3,
				mb: 4,
				borderRadius: '4px',
				border: '1px solid #d5dbdb',
				display: 'flex',
				flexDirection: isMobile ? 'column' : 'row',
				alignItems: isMobile ? 'stretch' : 'center',
				gap: 3,
				background: 'linear-gradient(to right, #ffffff, #fcfcfc)'
			}}
		>
			<Box sx={{ flexGrow: 1 }}>
				<Typography variant="caption" sx={{ fontWeight: 700, color: '#545b64', display: 'block', mb: 1, textTransform: 'uppercase' }}>
					Select Training Batch
				</Typography>
				<Autocomplete
					options={batches}
					getOptionLabel={(option) => option.batch_name}
					value={selectedBatch}
					onChange={(_e, newValue) => onBatchChange(newValue)}
					renderInput={(params) => (
						<TextField
							{...params}
							placeholder="Search by batch name..."
							size="medium"
							sx={{
								bgcolor: 'white',
								'& .MuiOutlinedInput-root': {
									borderRadius: '2px',
									'& fieldset': { borderColor: '#d5dbdb' }
								}
							}}
						/>
					)}
					sx={{ width: '100%', maxWidth: 600 }}
				/>
			</Box>

			{selectedBatch && (
				<Fade in={!!selectedBatch}>
					<Box sx={{ display: 'flex', gap: 4, px: isMobile ? 0 : 4, borderLeft: isMobile ? 'none' : '1px solid #eaeded' }}>
						<Box>
							<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>STATUS</Typography>
							<Chip
								label={selectedBatch.status.toUpperCase()}
								size="small"
								sx={{
									bgcolor: getStatusColor(selectedBatch.status),
									color: 'white',
									fontWeight: 700,
									borderRadius: '2px',
									height: 24
								}}
							/>
						</Box>
						<Box>
							<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>ENROLLMENT</Typography>
							<Typography variant="h5" sx={{ fontWeight: 700, color: '#232f3e' }}>{allocationCount}</Typography>
						</Box>
					</Box>
				</Fade>
			)}
		</Paper>
	);
};

export default BatchSelectionHeader;
