import React, { useState } from 'react';
import { Box, Paper, useTheme } from '@mui/material';
import EnterpriseFormHeader, { type FormStep } from './EnterpriseFormHeader';
import EnterpriseFormFooter from './EnterpriseFormFooter';
import { awsStyles } from '../../../theme/theme';

interface EnterpriseFormProps {
	title: string;
	subtitle?: string;
	mode: 'create' | 'edit' | 'view';
	steps: FormStep[];
	onSave: () => void;
	onCancel: () => void;
	isSubmitting?: boolean;
	saveButtonText?: string;
}

/**
 * EnterpriseForm Component.
 * A premium, multi-step layout for creating, editing, and viewing entities.
 * Features a guided Stepper, sticky Header/Footer, and strict theme alignment.
 */
const EnterpriseForm: React.FC<EnterpriseFormProps> = ({
	title,
	subtitle,
	mode,
	steps,
	onSave,
	onCancel,
	isSubmitting = false,
	saveButtonText
}) => {
	const theme = useTheme();
	const [activeStep, setActiveStep] = useState(0);

	const handleNext = () => {
		if (activeStep < steps.length - 1) {
			setActiveStep(prev => prev + 1);
		}
	};

	const handleBack = () => {
		if (activeStep > 0) {
			setActiveStep(prev => prev - 1);
		}
	};

	const handleStepClick = (step: number) => {
		// Allow free navigation in View mode; restricted to backward or completed steps in others
		if (mode === 'view' || step < activeStep) {
			setActiveStep(step);
		}
	};

	if (steps.length === 0) return null;

	return (
		<Paper elevation={0} sx={{
			...awsStyles.awsPanel,
			display: 'flex',
			flexDirection: 'column',
			minHeight: { xs: 'calc(100vh - 100px)', md: '600px' },
			maxHeight: 'calc(100vh - 32px)',
			overflow: 'hidden',
			borderRadius: `${theme.shape.borderRadius}px`,
			border: `1px solid ${theme.palette.divider}`,
			bgcolor: theme.palette.background.paper
		}}>
			<EnterpriseFormHeader
				title={title}
				subtitle={subtitle}
				mode={mode}
				activeStep={activeStep}
				steps={steps}
				onStepClick={handleStepClick}
			/>

			<Box sx={{
				flex: 1,
				p: { xs: 2.5, md: 4, lg: 6 },
				overflowY: 'auto',
				bgcolor: theme.palette.background.paper
			}}>
				{/* Step Content Container */}
				<Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
					{steps[activeStep].content}
				</Box>
			</Box>

			<EnterpriseFormFooter
				activeStep={activeStep}
				totalSteps={steps.length}
				onBack={handleBack}
				onNext={handleNext}
				onSave={onSave}
				onCancel={onCancel}
				isSubmitting={isSubmitting}
				saveButtonText={saveButtonText}
				mode={mode}
			/>
		</Paper>
	);
};

export default EnterpriseForm;
export { type FormStep };
