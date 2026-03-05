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
	CircularProgress,
	Typography
} from '@mui/material';
import {
	Add as AddIcon,
	Save as SaveIcon,
	Send as SendIcon
} from '@mui/icons-material';
import DSRItemRow from './DSRItemRow';
import type { DSRItem, DSRProject, DSRActivity } from '../../../../models/dsr';

interface SubmissionFormProps {
	items: Partial<DSRItem>[];
	projects: DSRProject[];
	activitiesByProject: Record<string, DSRActivity[]>;
	loading: boolean;
	submitting: boolean;
	onRowChange: (index: number, field: keyof DSRItem, value: any) => void;
	onAddRow: () => void;
	onRemoveRow: (index: number) => void;
	onSaveDraft: () => void;
	onSubmit: () => void;
	showTitle?: boolean;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({
	items,
	projects,
	activitiesByProject,
	loading,
	submitting,
	onRowChange,
	onAddRow,
	onRemoveRow,
	onSaveDraft,
	onSubmit,
	showTitle = true
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
							/>
						))}
						<TableRow>
							<TableCell colSpan={7}>
								<Button startIcon={<AddIcon />} onClick={onAddRow} sx={{ color: '#1a73e8', textTransform: 'none' }}>
									Add more activities
								</Button>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
				<Button
					variant="outlined"
					startIcon={<SaveIcon />}
					onClick={onSaveDraft}
					disabled={submitting}
					sx={{ color: '#232f3e', borderColor: '#d5dbdb', px: 4, borderRadius: '2px', textTransform: 'none', fontWeight: 700 }}
				>
					Save Draft
				</Button>
				<Button
					variant="contained"
					startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
					onClick={onSubmit}
					disabled={submitting}
					sx={{ bgcolor: '#232f3e', '&:hover': { bgcolor: '#1a242f' }, px: 4, borderRadius: '2px', textTransform: 'none', fontWeight: 700 }}
				>
					Submit DSR
				</Button>
			</Box>
		</Box>
	);
};

export default SubmissionForm;
