import React, { memo } from 'react';
import {
	TableRow,
	TableCell,
	Typography,
	Chip,
	Box,
	Tooltip
} from '@mui/material';
import { format, isValid } from 'date-fns';
import type { TrainingBatch } from '../../../../models/training';
import TrainingTableActions from './TrainingTableActions';

interface TrainingTableRowProps {
	batch: TrainingBatch;
	isAdmin: boolean;
	onEdit: (batch: TrainingBatch) => void;
	onExtend: (batch: TrainingBatch) => void;
	onDelete: (batch: TrainingBatch) => void;
}

const TrainingTableRow: React.FC<TrainingTableRowProps> = memo(({
	batch,
	isAdmin,
	onEdit,
	onExtend,
	onDelete
}) => {
	return (
		<TableRow sx={{ '&:hover': { bgcolor: '#f5f8fa' } }}>
			<TableCell>
				<Typography
					variant="body2"
					sx={{ fontWeight: 500, color: 'primary.main' }}
				>
					{batch.batch_name}
				</Typography>
			</TableCell>
			<TableCell>
				{batch.disability_types?.map((type, idx) => (
					<Chip key={idx} label={type} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5, bgcolor: '#f1f8e9' }} />
				)) || '-'}
			</TableCell>
			<TableCell>
				<Typography variant="body2">{batch.domain || '-'}</Typography>
			</TableCell>
			<TableCell>
				{batch.training_mode ? (
					<Chip
						label={batch.training_mode}
						size="small"
						variant="outlined"
						sx={{
							bgcolor: batch.training_mode === 'Online' ? '#e3f2fd' :
								batch.training_mode === 'Offline' ? '#fff3e0' : '#f3e5f5',
							borderColor: 'rgba(0,0,0,0.1)'
						}}
					/>
				) : '-'}
			</TableCell>
			<TableCell>
				{batch.courses?.map((course, idx) => {
					const isObject = typeof course === 'object' && course !== null;
					const name = isObject ? (course as any).name : course;
					const trainer = isObject ? (course as any).trainer : null;

					return (
						<Tooltip key={idx} title={trainer ? `Trainer: ${trainer}` : "No trainer assigned"}>
							<Chip
								label={trainer ? `${name} (${trainer})` : name}
								size="small"
								sx={{
									mr: 0.5,
									mb: 0.5,
									bgcolor: trainer ? '#e3f2fd' : '#f5f5f5'
								}}
							/>
						</Tooltip>
					);
				}) || '-'}
			</TableCell>
			<TableCell>
				{(() => {
					const start = batch.start_date || batch.duration?.start_date;
					const end = batch.approx_close_date || batch.duration?.end_date;
					if (start && end) {
						const dStart = new Date(start);
						const dEnd = new Date(end);
						if (isValid(dStart) && isValid(dEnd)) {
							return (
								<Typography variant="body2" color="text.secondary">
									{format(dStart, 'dd MMM yyyy')} - {format(dEnd, 'dd MMM yyyy')}
								</Typography>
							);
						}
					}
					return '-';
				})()}
			</TableCell>
			<TableCell>
				{batch.total_extension_days ? (
					<Tooltip title={
						<Box sx={{ p: 1 }}>
							<Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Extension History:</Typography>
							{batch.extensions?.map((ext, i) => {
								const extDate = new Date(ext.new_close_date);
								return (
									<Box key={i} sx={{ mb: i === (batch.extensions?.length || 0) - 1 ? 0 : 1, borderLeft: '2px solid #ec7211', pl: 1 }}>
										<Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
											{isValid(extDate) ? format(extDate, 'dd MMM yyyy') : ext.new_close_date} ({ext.extension_days >= 0 ? '+' : ''}{ext.extension_days}d)
										</Typography>
										<Typography variant="caption" sx={{ fontStyle: 'italic' }}>
											{ext.reason || 'No reason provided'}
										</Typography>
									</Box>
								);
							})}
						</Box>
					} arrow>
						<Chip
							label={batch.total_extension_days && batch.total_extension_days > 0
								? `${batch.total_extension_days} days extended`
								: batch.total_extension_days && batch.total_extension_days < 0
									? `${Math.abs(batch.total_extension_days)} days reduced`
									: 'Original date'}
							size="small"
							color={batch.total_extension_days && batch.total_extension_days > 0 ? "warning" : "info"}
							variant="outlined"
							sx={{ cursor: 'help' }}
						/>
					</Tooltip>
				) : '-'}
			</TableCell>
			<TableCell>
				<Chip
					label={batch.status.toUpperCase()}
					size="small"
					variant="outlined"
					color={
						batch.status === 'running' ? 'success' :
							batch.status === 'planned' ? 'warning' : 'default'
					}
				/>
			</TableCell>
			<TableCell align="right">
				<TrainingTableActions
					batch={batch}
					isAdmin={isAdmin}
					onEdit={onEdit}
					onExtend={onExtend}
					onDelete={onDelete}
				/>
			</TableCell>
		</TableRow>
	);
});

TrainingTableRow.displayName = 'TrainingTableRow';

export default TrainingTableRow;
