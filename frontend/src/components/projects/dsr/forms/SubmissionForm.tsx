import React from 'react';
import {
	Paper,
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	Button,
	Box,
	Typography
} from '@mui/material';
import {
	Add as AddIcon
} from '@mui/icons-material';
import DSRItemRow from './DSRItemRow';
import type { DSRItem, DSRProject, DSRActivity } from '../../../../models/dsr';

interface SubmissionFormProps {
	items: Partial<DSRItem>[];
	projects: DSRProject[];
	activitiesByProject: Record<string, DSRActivity[]>;
	loading: boolean;
	onRowChange: (index: number, field: keyof DSRItem, value: any) => void;
	onAddRow: () => void;
	onRemoveRow: (index: number) => void;
	showTitle?: boolean;
	readOnly?: boolean;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({
	items,
	projects,
	activitiesByProject,
	loading,
	onRowChange,
	onAddRow,
	onRemoveRow,
	showTitle = true,
	readOnly = false
}) => {
	return (
		<Box>
			{showTitle && (
				<Box sx={{ mb: 2 }}>
					<Typography variant="h6" sx={{ fontWeight: 700, color: '#232f3e' }}>
						Activity Details
					</Typography>
				</Box>
			)}
			<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
				<Table sx={{ minWidth: 900 }}>
					<TableHead sx={{ bgcolor: '#f2f3f3' }}>
						<TableRow>
							<TableCell sx={{ fontWeight: 700, width: '20%' }}>Project</TableCell>
							<TableCell sx={{ fontWeight: 700, width: '20%' }}>Activity</TableCell>
							<TableCell sx={{ fontWeight: 700, width: '30%' }}>Description</TableCell>
							<TableCell sx={{ fontWeight: 700, width: '10%' }}>Start</TableCell>
							<TableCell sx={{ fontWeight: 700, width: '10%' }}>End</TableCell>
							<TableCell sx={{ fontWeight: 700, width: '5%' }}>Hrs</TableCell>
							<TableCell sx={{ width: '5%' }} />
						</TableRow>
					</TableHead>
					<TableBody>
						{items.map((item, index) => (
							<DSRItemRow
								key={index}
								index={index}
								item={item}
								projects={projects}
								activities={item.project_public_id ? (activitiesByProject[item.project_public_id] || []) : []}
								loading={loading}
								onRowChange={onRowChange}
								onRemoveRow={onRemoveRow}
								isDeleteDisabled={items.length === 1}
								readOnly={readOnly}
							/>
						))}
						{!readOnly && (() => {
							const lastItem = items[items.length - 1];
							const isLastRowComplete = lastItem &&
								lastItem.project_public_id &&
								lastItem.activity_public_id &&
								lastItem.description &&
								lastItem.start_time &&
								lastItem.end_time &&
								(lastItem.hours || 0) > 0;

							return (
								<TableRow>
									<TableCell colSpan={7}>
										<Button
											startIcon={<AddIcon />}
											onClick={onAddRow}
											disabled={!isLastRowComplete}
											sx={{
												color: isLastRowComplete ? '#1a73e8' : '#aab7bd',
												textTransform: 'none',
												'&.Mui-disabled': { color: '#aab7bd' }
											}}
										>
											Add more activities
										</Button>
									</TableCell>
								</TableRow>
							);
						})()}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ mt: 1 }} />
		</Box>
	);
};

export default SubmissionForm;
