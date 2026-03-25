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
import type { DSRItem, DSRProject, DSRActivity, DSRActivityType } from '../../../../models/dsr';
import { GENERAL_PROJECT_ID } from '../hooks/useDSRSubmission';

interface SubmissionFormProps {
	items: Partial<DSRItem>[];
	projects: DSRProject[];
	activitiesByProject: Record<string, DSRActivity[]>;
	activityTypes: DSRActivityType[];
	loading: boolean;
	onRowChange: (index: number, field: keyof DSRItem, value: any) => void;
	onAddRow: () => void;
	onRemoveRow: (index: number) => void;
	showTitle?: boolean;
	readOnly?: boolean;
	reportDate: string;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({
	items,
	projects,
	activitiesByProject,
	activityTypes,
	loading,
	onRowChange,
	onAddRow,
	onRemoveRow,
	showTitle = true,
	readOnly = false,
	reportDate
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
					<TableHead sx={{ bgcolor: '#f9fafb' }}>
						<TableRow>
							<TableCell sx={{ fontWeight: 700, width: '18%', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', borderBottom: '2px solid #e5e7eb' }}>Project</TableCell>
							<TableCell sx={{ fontWeight: 700, width: '15%', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', borderBottom: '2px solid #e5e7eb' }}>Type</TableCell>
							<TableCell sx={{ fontWeight: 700, width: '18%', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', borderBottom: '2px solid #e5e7eb' }}>Activity / Task</TableCell>
							<TableCell sx={{ fontWeight: 700, width: '25%', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', borderBottom: '2px solid #e5e7eb' }}>Description</TableCell>
							<TableCell sx={{ fontWeight: 700, width: '10%', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', borderBottom: '2px solid #e5e7eb' }}>Start</TableCell>
							<TableCell sx={{ fontWeight: 700, width: '10%', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', borderBottom: '2px solid #e5e7eb' }}>End</TableCell>
							<TableCell sx={{ fontWeight: 700, width: '5%', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', borderBottom: '2px solid #e5e7eb' }}>Hrs</TableCell>
							<TableCell sx={{ width: '3%', borderBottom: '2px solid #e5e7eb' }} />
						</TableRow>
					</TableHead>
					<TableBody>
						{items.map((item, index) => (
							<DSRItemRow
								key={index}
								index={index}
								item={item}
								projects={projects}
								activityTypes={activityTypes}
								activities={item.project_public_id && item.project_public_id !== GENERAL_PROJECT_ID ? (activitiesByProject[item.project_public_id] || []) : []}
								loading={loading}
								onRowChange={onRowChange}
								onRemoveRow={onRemoveRow}
								isDeleteDisabled={items.length === 1}
								readOnly={readOnly}
								reportDate={reportDate}
							/>
						))}
						{!readOnly && (() => {
							const lastItem = items[items.length - 1];
							const isGeneral = lastItem?.project_public_id === GENERAL_PROJECT_ID;
							const isCategory = lastItem?.project_public_id?.startsWith('category:');
							
							const hasProject = !!lastItem?.project_public_id;
							const hasDescription = !!lastItem?.description && lastItem.description.trim().length > 0;
							const hasTime = !!lastItem?.start_time && !!lastItem?.end_time && (lastItem.hours || 0) > 0;
							
							let isCategorized = false;
							if (isGeneral || isCategory) {
								isCategorized = !!lastItem?.activity_type_name;
							} else {
								isCategorized = !!lastItem?.activity_public_id || (!!lastItem?.activity_name_other && lastItem.activity_name_other.trim() !== '');
							}

							const isLastRowComplete = hasProject && isCategorized && hasDescription && hasTime;

							return (
								<TableRow>
									<TableCell colSpan={8}>
										<Button
											startIcon={<AddIcon />}
											onClick={onAddRow}
											disabled={!isLastRowComplete}
											variant="text"
											sx={{
												color: isLastRowComplete ? '#ec7211' : '#aab7bd',
												fontWeight: 700,
												fontSize: '0.85rem',
												textTransform: 'none',
												py: 1,
												px: 2,
												'&:hover': {
													bgcolor: 'rgba(236,114,17,0.05)',
													color: '#d4660f'
												},
												'&.Mui-disabled': { color: '#e5e7eb' }
											}}
										>
											Add Activity Row
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
