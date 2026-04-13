import React from 'react';
import {
	Box,
	Typography,
	Stepper,
	Step,
	StepLabel,
	Chip,
	useTheme
} from '@mui/material';
import { awsStyles } from '../../../theme/theme';

export interface FormStep {
	label: string;
	description?: string;
	content: React.ReactNode;
}

interface EnterpriseFormHeaderProps {
	title: string;
	subtitle?: string;
	mode: 'create' | 'edit' | 'view';
	activeStep: number;
	steps: FormStep[];
	onStepClick?: (step: number) => void;
}

/**
 * Premium Header for EnterpriseForm.
 * Displays navigation progress via Stepper and context via Title/Mode Badge.
 */
const EnterpriseFormHeader: React.FC<EnterpriseFormHeaderProps> = ({
	title,
	subtitle,
	mode,
	activeStep,
	steps,
	onStepClick
}) => {
	const theme = useTheme();
	const { sectionTitle } = awsStyles;

	const getModeConfig = () => {
		switch (mode) {
			case 'view':
				return { 
					label: 'READ ONLY', 
					bgcolor: theme.palette.grey[100], 
					color: theme.palette.text.secondary 
				};
			case 'edit':
				return { 
					label: 'EDIT MODE', 
					bgcolor: theme.palette.warning.main, 
					color: '#fff' 
				};
			default:
				return { 
					label: 'CREATE NEW', 
					bgcolor: theme.palette.primary.main, 
					color: '#fff' 
				};
		}
	};

	const modeConfig = getModeConfig();

	return (
		<Box sx={{
			p: { xs: 2, md: 3 },
			borderBottom: `1px solid ${theme.palette.divider}`,
			bgcolor: theme.palette.background.default
		}}>
			<Box sx={{
				display: 'flex',
				flexDirection: { xs: 'column', sm: 'row' },
				justifyContent: 'space-between',
				alignItems: { xs: 'flex-start', sm: 'center' },
				gap: 2,
				mb: 4
			}}>
				<Box>
					<Typography sx={{ ...sectionTitle, mb: 0.5 }}>{title}</Typography>
					{subtitle && (
						<Typography variant="body2" color="text.secondary">
							{subtitle}
						</Typography>
					)}
				</Box>
				<Chip
					label={modeConfig.label}
					sx={{
						bgcolor: modeConfig.bgcolor,
						color: modeConfig.color,
						fontWeight: 700,
						borderRadius: '2px',
						fontSize: '0.65rem',
						height: 20,
						letterSpacing: '0.05em'
					}}
				/>
			</Box>

			<Stepper
				activeStep={activeStep}
				alternativeLabel
				sx={{
					'& .MuiStepLabel-label': {
						fontSize: '0.75rem',
						fontWeight: 500,
						mt: 1,
						color: theme.palette.text.secondary,
						'&.Mui-active': {
							color: theme.palette.primary.main,
							fontWeight: 700
						},
						'&.Mui-completed': {
							color: theme.palette.success.main
						}
					},
					'& .MuiStepConnector-line': {
						borderColor: theme.palette.divider
					}
				}}
			>
				{steps.map((step, index) => (
					<Step
						key={step.label}
						onClick={() => onStepClick?.(index)}
						sx={{ cursor: onStepClick ? 'pointer' : 'default' }}
					>
						<StepLabel
							optional={
								step.description && (
									<Typography 
										variant="caption" 
										sx={{ 
											display: 'block', 
											textAlign: 'center', 
											opacity: 0.7,
											fontSize: '0.65rem'
										}}
									>
										{step.description}
									</Typography>
								)
							}
						>
							{step.label}
						</StepLabel>
					</Step>
				))}
			</Stepper>
		</Box>
	);
};

export default EnterpriseFormHeader;
