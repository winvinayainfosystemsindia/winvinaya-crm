import React from 'react';
import {
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
			
			<Box sx={{ 
				borderRadius: '8px', 
				border: '1px solid #e5e7eb', 
				bgcolor: 'white',
				overflow: 'hidden'
			}}>
				{/* Desktop Header - Hidden on mobile/tablet */}
				<Box sx={{ 
					display: { xs: 'none', md: 'flex' }, 
					bgcolor: '#f9fafb', 
					borderBottom: '2px solid #e5e7eb',
					px: 2,
					py: 1.5,
					gap: 2,
					alignItems: 'center'
				}}>
					<Typography sx={{ fontWeight: 700, width: '20%', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Project</Typography>
					<Typography sx={{ fontWeight: 700, width: '20%', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Activity</Typography>
					<Typography sx={{ fontWeight: 700, flexGrow: 1, fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Description</Typography>
					<Box sx={{ display: 'flex', width: '200px', gap: 1, justifyContent: 'space-between' }}>
						<Typography sx={{ fontWeight: 700, width: '70px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', textAlign: 'center' }}>Start</Typography>
						<Typography sx={{ fontWeight: 700, width: '70px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', textAlign: 'center' }}>End</Typography>
						<Typography sx={{ fontWeight: 700, width: '40px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', textAlign: 'center' }}>Hrs</Typography>
					</Box>
					<Box sx={{ width: '40px' }} />
				</Box>

				{/* Rows Container */}
				<Box sx={{ 
					display: 'flex', 
					flexDirection: 'column',
					'& > :not(:last-child)': {
						borderBottom: '1px solid #f3f4f6'
					}
				}}>
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
				</Box>

				{/* Footer/Add Row Action */}
				<Box sx={{ p: 2, borderTop: '1px solid #f3f4f6' }}>
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
						);
					})()}
				</Box>
			</Box>
			<Box sx={{ mt: 1 }} />
		</Box>
	);
};

export default SubmissionForm;
