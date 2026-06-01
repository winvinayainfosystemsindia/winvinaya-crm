import React, { memo } from 'react';
import {
	Stack,
	Box,
	Typography,
	Grid,
	Paper,
	CircularProgress,
	Tooltip,
	Button,
	alpha,
	useTheme
} from '@mui/material';
import {
	AutoAwesome as AIIcon,
	AutoFixHigh as PolishIcon,
	CheckCircleOutline as StrengthIcon,
	ReportProblemOutlined as WeaknessIcon,
	LightbulbOutlined as OpportunityIcon,
	ErrorOutline as ThreatIcon
} from '@mui/icons-material';
import { getWordCount, getCharacterCount } from '../../../../../hooks/useTextStats';
import RichTextEditor from '../../../../common/RichTextEditor';

interface FeedbackTabProps {
	strengths: string;
	setStrengths: (val: string) => void;
	weaknesses: string;
	setWeaknesses: (val: string) => void;
	opportunities: string;
	setOpportunities: (val: string) => void;
	threats: string;
	setThreats: (val: string) => void;
	loadingStrengthsAI: boolean;
	loadingWeaknessesAI: boolean;
	loadingOpportunitiesAI: boolean;
	loadingThreatsAI: boolean;
	handleAIAssist: (type: 'strengths' | 'weaknesses' | 'opportunities' | 'threats', action: 'enhance' | 'generate') => Promise<void>;
	viewMode: boolean;
}

// Utility to strip any rich-text HTML tags when displaying inside plain-text textfields
const stripHtml = (html: string) => {
	if (!html) return '';
	if (typeof window === 'undefined') return html;
	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = html;
	return tempDiv.textContent || tempDiv.innerText || '';
};

const FeedbackTab: React.FC<FeedbackTabProps> = memo(({
	strengths,
	setStrengths,
	weaknesses,
	setWeaknesses,
	opportunities,
	setOpportunities,
	threats,
	setThreats,
	loadingStrengthsAI,
	loadingWeaknessesAI,
	loadingOpportunitiesAI,
	loadingThreatsAI,
	handleAIAssist,
	viewMode
}) => {
	const theme = useTheme();

	const renderSWOTCard = (
		title: string,
		type: 'strengths' | 'weaknesses' | 'opportunities' | 'threats',
		value: string,
		onChange: (val: string) => void,
		loadingAI: boolean,
		placeholder: string,
		themeColor: string,
		icon: React.ReactNode
	) => {
		const cleanValue = stripHtml(value);

		return (
			<Grid size={{ xs: 12, md: 6 }} key={type}>
				<Paper
					elevation={0}
					variant="outlined"
					sx={{
						p: 3,
						borderRadius: 3,
						bgcolor: '#ffffff',
						border: '1px solid',
						borderColor: '#e2e8f0',
						transition: 'all 0.25s ease-in-out',
						'&:hover': {
							borderColor: themeColor,
							boxShadow: `0 4px 20px 0 ${alpha(themeColor, 0.08)}`
						}
					}}
				>
					{/* Card Header */}
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
						<Stack direction="row" alignItems="center" spacing={1.5}>
							{icon}
							<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '0.02em' }}>
								{title}
							</Typography>
						</Stack>
						{!viewMode && (
							<Stack direction="row" spacing={1} alignItems="center">
								{loadingAI ? (
									<Stack direction="row" spacing={0.5} alignItems="center">
										<CircularProgress size={12} sx={{ color: themeColor }} />
										<Typography variant="caption" sx={{ fontSize: '0.7rem', color: themeColor, fontWeight: 700 }}>
											AI Working...
										</Typography>
									</Stack>
								) : (
									<>
										<Tooltip title={`Generate suggested ${title.toLowerCase()} using AI`} arrow>
											<Button
												size="small"
												variant="text"
												onClick={() => handleAIAssist(type, 'generate')}
												startIcon={<AIIcon sx={{ fontSize: '13px !important' }} />}
												sx={{
													fontSize: '0.7rem',
													textTransform: 'none',
													py: 0.2,
													px: 1,
													borderRadius: 1.5,
													fontWeight: 700,
													color: themeColor,
													'&:hover': { bgcolor: alpha(themeColor, 0.05) }
												}}
											>
												AI Suggest
											</Button>
										</Tooltip>
										<Tooltip title="Enhance and polish spelling/grammar using AI" arrow>
											<Button
												size="small"
												variant="text"
												onClick={() => handleAIAssist(type, 'enhance')}
												startIcon={<PolishIcon sx={{ fontSize: '13px !important' }} />}
												sx={{
													fontSize: '0.7rem',
													textTransform: 'none',
													py: 0.2,
													px: 1,
													borderRadius: 1.5,
													fontWeight: 700,
													color: theme.palette.secondary.main,
													'&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.05) }
												}}
											>
												AI Polish
											</Button>
										</Tooltip>
									</>
								)}
							</Stack>
						)}
					</Box>

					{/* Rich Text Editor with Formatting Icons */}
					<RichTextEditor
						placeholder={placeholder}
						value={value}
						onChange={onChange}
						disabled={viewMode}
						themeColor={themeColor}
					/>

					{/* Card Footer Statistics */}
					<Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, px: 0.5 }}>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
							{getWordCount(cleanValue)} words
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
							{getCharacterCount(cleanValue)} characters
						</Typography>
					</Box>
				</Paper>
			</Grid>
		);
	};

	return (
		<Stack spacing={4} sx={{ maxWidth: 1200, mx: 'auto', p: 1 }}>
			<Box>
				<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 3 }}>
					SWOT Feedback Analysis
				</Typography>
				<Grid container spacing={3.5}>
					{renderSWOTCard(
						'S - Strengths',
						'strengths',
						strengths,
						setStrengths,
						loadingStrengthsAI,
						'List candidate\'s core professional strengths, key traits, and positive observations...',
						theme.palette.success.main,
						<StrengthIcon sx={{ color: theme.palette.success.main }} />
					)}
					{renderSWOTCard(
						'W - Weaknesses',
						'weaknesses',
						weaknesses,
						setWeaknesses,
						loadingWeaknessesAI,
						'List candidate\'s technical weaknesses, skills gaps, or core areas needing attention...',
						theme.palette.error.main,
						<WeaknessIcon sx={{ color: theme.palette.error.main }} />
					)}
					{renderSWOTCard(
						'O - Observations',
						'opportunities',
						opportunities,
						setOpportunities,
						loadingOpportunitiesAI,
						'List positive observations, placement matches, or future growth potentials...',
						theme.palette.info.main,
						<OpportunityIcon sx={{ color: theme.palette.info.main }} />
					)}
					{renderSWOTCard(
						'T - Threats',
						'threats',
						threats,
						setThreats,
						loadingThreatsAI,
						'List critical training actions, drop-out risks, or interview blockers...',
						theme.palette.warning.main,
						<ThreatIcon sx={{ color: theme.palette.warning.main }} />
					)}
				</Grid>
			</Box>
		</Stack>
	);
});

FeedbackTab.displayName = 'FeedbackTab';

export default FeedbackTab;
