import React from 'react';
import {
	Box,
	Button,
	Typography,
	useTheme,
	alpha
} from '@mui/material';
import { NavigateBefore, NavigateNext, Save } from '@mui/icons-material';

interface EnterpriseFormFooterProps {
	activeStep: number;
	totalSteps: number;
	onBack: () => void;
	onNext: () => void;
	onSave: () => void;
	onCancel: () => void;
	isSubmitting?: boolean;
	saveButtonText?: string;
	mode: 'create' | 'edit' | 'view';
}

/**
 * Standard Footer for EnterpriseForm.
 * Provides sticky navigation buttons and primary action triggers.
 */
const EnterpriseFormFooter: React.FC<EnterpriseFormFooterProps> = ({
	activeStep,
	totalSteps,
	onBack,
	onNext,
	onSave,
	onCancel,
	isSubmitting = false,
	saveButtonText = 'Save Changes',
	mode
}) => {
	const theme = useTheme();
	const isLastStep = activeStep === totalSteps - 1;

	return (
		<Box sx={{
			p: { xs: 2, md: 3 },
			borderTop: `1px solid ${theme.palette.divider}`,
			bgcolor: theme.palette.background.default,
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			position: 'sticky',
			bottom: 0,
			zIndex: 10
		}}>
			<Button
				variant="outlined"
				onClick={onCancel}
				sx={{
					textTransform: 'none',
					fontWeight: 600,
					color: theme.palette.text.secondary,
					borderColor: theme.palette.divider,
					'&:hover': {
						borderColor: theme.palette.text.primary,
						bgcolor: alpha(theme.palette.text.primary, 0.05)
					}
				}}
			>
				{mode === 'view' ? 'Close' : 'Cancel'}
			</Button>

			<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
				{totalSteps > 1 && (
					<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
						Step {activeStep + 1} of {totalSteps}
					</Typography>
				)}

				<Box sx={{ display: 'flex', gap: 1.5 }}>
					{activeStep > 0 && (
						<Button
							variant="outlined"
							startIcon={<NavigateBefore />}
							onClick={onBack}
							sx={{
								textTransform: 'none',
								fontWeight: 600,
								borderRadius: '2px'
							}}
						>
							Back
						</Button>
					)}

					{mode !== 'view' && (
						isLastStep ? (
							<Button
								variant="contained"
								startIcon={<Save />}
								onClick={onSave}
								disabled={isSubmitting}
								sx={{
									textTransform: 'none',
									fontWeight: 700,
									borderRadius: '2px',
									bgcolor: theme.palette.accent.main,
									'&:hover': {
										bgcolor: theme.palette.accent.dark
									}
								}}
							>
								{isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create' : saveButtonText)}
							</Button>
						) : (
							<Button
								variant="contained"
								endIcon={<NavigateNext />}
								onClick={onNext}
								sx={{
									textTransform: 'none',
									fontWeight: 700,
									borderRadius: '2px',
									bgcolor: theme.palette.primary.main
								}}
							>
								Next Step
							</Button>
						)
					)}
				</Box>
			</Box>
		</Box>
	);
};

export default EnterpriseFormFooter;
