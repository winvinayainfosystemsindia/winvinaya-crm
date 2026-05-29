import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
	Dialog,
	Box,
	Typography,
	TextField,
	Grid,
	MenuItem,
	Button,
	IconButton,
	Rating,
	Paper,
	Stack,
	useTheme,
	Chip,
	Divider,
	Tooltip
} from '@mui/material';
import { 
	Close as CloseIcon,
	Add as AddIcon,
	DeleteOutline as DeleteIcon,
	Psychology as SkillIcon,
	RateReviewOutlined as ReviewIcon,
	FormatBold as BoldIcon,
	FormatListBulleted as ListIcon,
	FormatListNumbered as NumberedIcon,
	Edit as EditIcon,
	Visibility as PreviewIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { type RootState } from '../../../../store/store';
import { type CandidateAnalysis, type AnalysisSkill } from '../../../../models/CandidateAnalysis';
import SkillDropdown from '../../../common/SkillDropdown';
import useToast from '../../../../hooks/useToast';

interface CandidateAnalysisFormProps {
	open: boolean;
	onClose: () => void;
	batchId: number;
	analysis: CandidateAnalysis | null;
	viewMode?: boolean;
	onSave: (data: any) => Promise<void>;
}

const CandidateAnalysisForm: React.FC<CandidateAnalysisFormProps> = ({
	open,
	onClose,
	batchId,
	analysis,
	viewMode = false,
	onSave
}) => {
	const theme = useTheme();
	const toast = useToast();
	const { allocations } = useSelector((state: RootState) => state.training);
	const { user } = useSelector((state: RootState) => state.auth);
	
	// Candidates in this batch
	const candidates = useMemo(() => {
		return allocations
			.filter(a => a.status === 'in_training' || a.status === 'moved_to_placement')
			.map(a => ({
				id: a.candidate_id,
				name: a.candidate?.name || 'Unknown'
			}));
	}, [allocations]);

	const [candidateId, setCandidateId] = useState<number | ''>('');
	const [analystName, setAnalystName] = useState('');
	const [analysisDate, setAnalysisDate] = useState(new Date().toISOString().split('T')[0]);
	const [strengths, setStrengths] = useState('');
	const [weaknesses, setWeaknesses] = useState('');
	const [techRating, setTechRating] = useState(5);
	const [commRating, setCommRating] = useState(5);
	const [attitudeRating, setAttitudeRating] = useState(5);
	const [skills, setSkills] = useState<AnalysisSkill[]>([]);
	const [recommendation, setRecommendation] = useState<string>('ready_for_placement');
	const [status, setStatus] = useState<string>('completed');
	const [submitting, setSubmitting] = useState(false);

	const [strengthsView, setStrengthsView] = useState<'edit' | 'preview'>('edit');
	const [weaknessesView, setWeaknessesView] = useState<'edit' | 'preview'>('edit');

	const strengthsRef = useRef<HTMLTextAreaElement>(null);
	const weaknessesRef = useRef<HTMLTextAreaElement>(null);

	// Load data if editing or viewing
	useEffect(() => {
		if (analysis) {
			setCandidateId(analysis.candidate_id);
			setAnalystName(analysis.analyst_name || '');
			setAnalysisDate(analysis.analysis_date ? analysis.analysis_date.split('T')[0] : new Date().toISOString().split('T')[0]);
			setStrengths(analysis.strengths || '');
			setWeaknesses(analysis.weaknesses || '');
			setTechRating(analysis.technical_rating);
			setCommRating(analysis.communication_rating);
			setAttitudeRating(analysis.attitude_rating);
			setSkills(analysis.skills || []);
			setRecommendation(analysis.recommendation);
			setStatus(analysis.status);
		} else {
			setCandidateId('');
			setAnalystName(user?.full_name || user?.username || '');
			setAnalysisDate(new Date().toISOString().split('T')[0]);
			setStrengths('');
			setWeaknesses('');
			setTechRating(5);
			setCommRating(5);
			setAttitudeRating(5);
			setSkills([]);
			setRecommendation('ready_for_placement');
			setStatus('completed');
		}
	}, [analysis, open, user]);

	// Calculate overall score automatically
	const overallRating = useMemo(() => {
		return parseFloat(((techRating + commRating + attitudeRating) / 3).toFixed(1));
	}, [techRating, commRating, attitudeRating]);

	const handleAddSkill = () => {
		setSkills(prev => [...prev, { skill: '', level: 'Beginner', rating: 5 }]);
	};

	const handleRemoveSkill = (idx: number) => {
		setSkills(prev => prev.filter((_, i) => i !== idx));
	};

	const handleSkillChange = (idx: number, field: keyof AnalysisSkill, val: any) => {
		setSkills(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
	};

	const applyFormatting = (
		field: 'strengths' | 'weaknesses',
		ref: React.RefObject<HTMLTextAreaElement | null>,
		prefix: string,
		suffix: string = '',
		isBlock: boolean = false
	) => {
		const textField = ref.current;
		if (!textField) return;

		const start = textField.selectionStart;
		const end = textField.selectionEnd;
		const text = field === 'strengths' ? strengths : weaknesses;
		const selectedText = text.substring(start, end);

		let replacement = '';
		let needsNewline = false;
		
		if (isBlock) {
			const beforeText = text.substring(0, start);
			needsNewline = beforeText.length > 0 && !beforeText.endsWith('\n');
			
			if (selectedText.includes('\n')) {
				replacement = (needsNewline ? '\n' : '') + selectedText
					.split('\n')
					.map(line => (line.trim() && !line.startsWith(prefix.trim())) ? `${prefix}${line}` : line)
					.join('\n');
			} else {
				replacement = `${needsNewline ? '\n' : ''}${prefix}${selectedText}${suffix}`;
			}
		} else {
			replacement = `${prefix}${selectedText}${suffix}`;
		}

		const newText = text.substring(0, start) + replacement + text.substring(end);
		
		if (field === 'strengths') {
			setStrengths(newText);
		} else {
			setWeaknesses(newText);
		}

		setTimeout(() => {
			if (ref.current) {
				const tf = ref.current;
				tf.focus();
				const newPos = start + (needsNewline ? 1 : 0);
				tf.setSelectionRange(newPos, newPos + replacement.length - (needsNewline ? 1 : 0));
			}
		}, 0);
	};

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!candidateId) {
			toast.error('Please select a candidate.');
			return;
		}
		
		setSubmitting(true);
		try {
			const payload = {
				batch_id: batchId,
				candidate_id: Number(candidateId),
				analyst_name: analystName.trim(),
				analysis_date: analysisDate,
				strengths: strengths.trim(),
				weaknesses: weaknesses.trim(),
				technical_rating: techRating,
				communication_rating: commRating,
				attitude_rating: attitudeRating,
				overall_rating: overallRating,
				skills,
				recommendation,
				status
			};
			await onSave(payload);
			onClose();
		} catch (err: any) {
			toast.error(err?.message || 'Failed to save candidate analysis.');
		} finally {
			setSubmitting(false);
		}
	};

	const inputSx = {
		'& .MuiOutlinedInput-root': {
			borderRadius: 1.5,
			bgcolor: '#fcfcfc',
			'& fieldset': { borderColor: '#d5dbdb' },
			'&:hover fieldset': { borderColor: '#879596' },
			'&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: { borderRadius: 3, p: 1 }
			}}
		>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<ReviewIcon color="primary" />
					<Typography variant="h6" fontWeight={800}>
						{viewMode ? 'Review Candidate Analysis' : analysis ? 'Edit Candidate Analysis' : 'Perform Candidate Analysis'}
					</Typography>
				</Stack>
				<IconButton onClick={onClose} disabled={submitting}>
					<CloseIcon />
				</IconButton>
			</Box>

			<Box component="form" onSubmit={handleFormSubmit} sx={{ p: 3, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
				<Grid container spacing={3}>
					{/* Basic Metadata */}
					<Grid size={{ xs: 12, sm: 6 }}>
						<Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block', color: 'text.secondary' }}>
							Candidate Name *
						</Typography>
						<TextField
							select
							fullWidth
							size="small"
							required
							disabled={viewMode || !!analysis}
							value={candidateId}
							onChange={(e) => setCandidateId(Number(e.target.value))}
							sx={inputSx}
						>
							{candidates.map(c => (
								<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
							))}
						</TextField>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block', color: 'text.secondary' }}>
							Evaluator / Analyst *
						</Typography>
						<TextField
							fullWidth
							size="small"
							required
							disabled={true}
							value={analystName}
							onChange={(e) => setAnalystName(e.target.value)}
							placeholder="e.g. David R."
							sx={inputSx}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block', color: 'text.secondary' }}>
							Evaluation Date *
						</Typography>
						<TextField
							type="date"
							fullWidth
							size="small"
							required
							disabled={true}
							value={analysisDate}
							onChange={(e) => setAnalysisDate(e.target.value)}
							sx={inputSx}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block', color: 'text.secondary' }}>
							Placement Recommendation *
						</Typography>
						<TextField
							select
							fullWidth
							size="small"
							required
							disabled={viewMode}
							value={recommendation}
							onChange={(e) => setRecommendation(e.target.value)}
							sx={inputSx}
						>
							<MenuItem value="ready_for_placement">Ready for Placement</MenuItem>
							<MenuItem value="needs_additional_training">Needs Additional Training</MenuItem>
							<MenuItem value="assign_dsr_project">Assign DSR Project</MenuItem>
							<MenuItem value="counseling_required">Counseling Required</MenuItem>
						</TextField>
					</Grid>

					{/* Ratings Box */}
					<Grid size={{ xs: 12 }}>
						<Paper elevation={0} variant="outlined" sx={{ p: 3, bgcolor: '#fcfcfc', borderRadius: 2 }}>
							<Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
								Performance Ratings
							</Typography>
							<Grid container spacing={3}>
								<Grid size={{ xs: 12, sm: 4 }}>
									<Box sx={{ textAlign: 'center' }}>
										<Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
											Technical Competency
										</Typography>
										<Rating
											max={10}
											value={techRating}
											onChange={(_, v) => !viewMode && setTechRating(v || 0)}
											disabled={viewMode}
											size="medium"
											sx={{ color: 'primary.main' }}
										/>
										<Typography variant="h6" fontWeight={800} color="primary" sx={{ mt: 0.5 }}>
											{techRating} / 10
										</Typography>
									</Box>
								</Grid>
								<Grid size={{ xs: 12, sm: 4 }}>
									<Box sx={{ textAlign: 'center' }}>
										<Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
											Communication & Verbal
										</Typography>
										<Rating
											max={10}
											value={commRating}
											onChange={(_, v) => !viewMode && setCommRating(v || 0)}
											disabled={viewMode}
											size="medium"
											sx={{ color: 'warning.main' }}
										/>
										<Typography variant="h6" fontWeight={800} color="warning.main" sx={{ mt: 0.5 }}>
											{commRating} / 10
										</Typography>
									</Box>
								</Grid>
								<Grid size={{ xs: 12, sm: 4 }}>
									<Box sx={{ textAlign: 'center' }}>
										<Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
											Attitude & Punctuality
										</Typography>
										<Rating
											max={10}
											value={attitudeRating}
											onChange={(_, v) => !viewMode && setAttitudeRating(v || 0)}
											disabled={viewMode}
											size="medium"
											sx={{ color: 'secondary.main' }}
										/>
										<Typography variant="h6" fontWeight={800} color="secondary.main" sx={{ mt: 0.5 }}>
											{attitudeRating} / 10
										</Typography>
									</Box>
								</Grid>
								<Grid size={{ xs: 12 }}>
									<Divider sx={{ my: 1 }} />
									<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, pt: 1 }}>
										<Typography variant="subtitle1" fontWeight={800}>
											Overall Evaluated Rating:
										</Typography>
										<Chip
											label={`${overallRating} / 10`}
											color={overallRating >= 8 ? 'success' : overallRating >= 5 ? 'warning' : 'error'}
											sx={{ fontWeight: 800, fontSize: '1rem', px: 1 }}
										/>
									</Box>
								</Grid>
							</Grid>
						</Paper>
					</Grid>

					{/* Feedback Areas */}
					<Grid size={{ xs: 12, sm: 6 }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
							<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
								Key Strengths *
							</Typography>
							
							<Stack direction="row" spacing={0.5} alignItems="center">
								{strengthsView === 'edit' && !viewMode && (
									<>
										<Tooltip title="Bold">
											<IconButton size="small" onClick={() => applyFormatting('strengths', strengthsRef, '**', '**')}>
												<BoldIcon sx={{ fontSize: 16 }} />
											</IconButton>
										</Tooltip>
										<Tooltip title="Bullet List">
											<IconButton size="small" onClick={() => applyFormatting('strengths', strengthsRef, '- ', '', true)}>
												<ListIcon sx={{ fontSize: 16 }} />
											</IconButton>
										</Tooltip>
										<Tooltip title="Numbered List">
											<IconButton size="small" onClick={() => applyFormatting('strengths', strengthsRef, '1. ', '', true)}>
												<NumberedIcon sx={{ fontSize: 16 }} />
											</IconButton>
										</Tooltip>
										<Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
									</>
								)}
								
								<IconButton 
									size="small" 
									onClick={() => setStrengthsView(prev => prev === 'edit' ? 'preview' : 'edit')}
									title={strengthsView === 'edit' ? 'Preview Markdown' : 'Edit Text'}
								>
									{strengthsView === 'edit' ? <PreviewIcon sx={{ fontSize: 16 }} /> : <EditIcon sx={{ fontSize: 16 }} />}
								</IconButton>
							</Stack>
						</Box>

						{strengthsView === 'edit' ? (
							<TextField
								fullWidth
								multiline
								rows={6}
								disabled={viewMode}
								value={strengths}
								onChange={(e) => setStrengths(e.target.value)}
								placeholder="Describe core strengths (technical, soft skills, attitude). Supports Markdown."
								inputRef={strengthsRef}
								sx={inputSx}
							/>
						) : (
							<Paper 
								variant="outlined" 
								sx={{ 
									p: 2, 
									minHeight: 154, 
									maxHeight: 154, 
									overflowY: 'auto', 
									bgcolor: '#fbfbfb', 
									borderRadius: 1.5,
									borderColor: '#d5dbdb',
									fontSize: '0.875rem',
									color: 'text.primary',
									'& p': { mb: 1 },
									'& ul, & ol': { pl: 2.5, mb: 1 },
									'& li': { mb: 0.5 },
									'& strong': { fontWeight: 700 }
								}}
							>
								<ReactMarkdown remarkPlugins={[remarkGfm]}>
									{strengths || '*No strengths entered yet.*'}
								</ReactMarkdown>
							</Paper>
						)}
					</Grid>

					<Grid size={{ xs: 12, sm: 6 }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
							<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
								Areas of Improvement *
							</Typography>
							
							<Stack direction="row" spacing={0.5} alignItems="center">
								{weaknessesView === 'edit' && !viewMode && (
									<>
										<Tooltip title="Bold">
											<IconButton size="small" onClick={() => applyFormatting('weaknesses', weaknessesRef, '**', '**')}>
												<BoldIcon sx={{ fontSize: 16 }} />
											</IconButton>
										</Tooltip>
										<Tooltip title="Bullet List">
											<IconButton size="small" onClick={() => applyFormatting('weaknesses', weaknessesRef, '- ', '', true)}>
												<ListIcon sx={{ fontSize: 16 }} />
											</IconButton>
										</Tooltip>
										<Tooltip title="Numbered List">
											<IconButton size="small" onClick={() => applyFormatting('weaknesses', weaknessesRef, '1. ', '', true)}>
												<NumberedIcon sx={{ fontSize: 16 }} />
											</IconButton>
										</Tooltip>
										<Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
									</>
								)}
								
								<IconButton 
									size="small" 
									onClick={() => setWeaknessesView(prev => prev === 'edit' ? 'preview' : 'edit')}
									title={weaknessesView === 'edit' ? 'Preview Markdown' : 'Edit Text'}
								>
									{weaknessesView === 'edit' ? <PreviewIcon sx={{ fontSize: 16 }} /> : <EditIcon sx={{ fontSize: 16 }} />}
								</IconButton>
							</Stack>
						</Box>

						{weaknessesView === 'edit' ? (
							<TextField
								fullWidth
								multiline
								rows={6}
								disabled={viewMode}
								value={weaknesses}
								onChange={(e) => setWeaknesses(e.target.value)}
								placeholder="Describe key improvement areas or technical gaps. Supports Markdown."
								inputRef={weaknessesRef}
								sx={inputSx}
							/>
						) : (
							<Paper 
								variant="outlined" 
								sx={{ 
									p: 2, 
									minHeight: 154, 
									maxHeight: 154, 
									overflowY: 'auto', 
									bgcolor: '#fbfbfb', 
									borderRadius: 1.5,
									borderColor: '#d5dbdb',
									fontSize: '0.875rem',
									color: 'text.primary',
									'& p': { mb: 1 },
									'& ul, & ol': { pl: 2.5, mb: 1 },
									'& li': { mb: 0.5 },
									'& strong': { fontWeight: 700 }
								}}
							>
								<ReactMarkdown remarkPlugins={[remarkGfm]}>
									{weaknesses || '*No improvement areas entered yet.*'}
								</ReactMarkdown>
							</Paper>
						)}
					</Grid>

					{/* Competency Matrix (Skills assessment inside Candidate Analysis) */}
					<Grid size={{ xs: 12 }}>
						<Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
								<Stack direction="row" alignItems="center" spacing={1}>
									<SkillIcon color="action" />
									<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
										Competency Proficiency Mapping
									</Typography>
								</Stack>
								{!viewMode && (
									<Button
										variant="outlined"
										size="small"
										startIcon={<AddIcon />}
										onClick={handleAddSkill}
										sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}
									>
										Add Skill
									</Button>
								)}
							</Box>

							{skills.length > 0 ? (
								<Stack spacing={2}>
									{skills.map((s, idx) => (
										<Paper key={idx} elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 1.5, position: 'relative', bgcolor: '#fcfcfc' }}>
											{!viewMode && (
												<IconButton
													size="small"
													onClick={() => handleRemoveSkill(idx)}
													sx={{ position: 'absolute', top: 8, right: 8, color: 'error.main' }}
												>
													<DeleteIcon fontSize="small" />
												</IconButton>
											)}
											<Grid container spacing={2} alignItems="center">
												<Grid size={{ xs: 12, sm: 5 }}>
													<SkillDropdown
														value={s.skill}
														onChange={(v) => handleSkillChange(idx, 'skill', v)}
														disabled={viewMode}
														label="Competency / Skill Area"
														placeholder="Search or type..."
													/>
												</Grid>
												<Grid size={{ xs: 12, sm: 4 }}>
													<TextField
														select
														fullWidth
														size="small"
														label="Proficiency Level"
														value={s.level || 'Beginner'}
														onChange={(e) => handleSkillChange(idx, 'level', e.target.value)}
														disabled={viewMode}
														sx={inputSx}
													>
														<MenuItem value="Beginner">Beginner</MenuItem>
														<MenuItem value="Intermediate">Intermediate</MenuItem>
														<MenuItem value="Expert">Expert</MenuItem>
													</TextField>
												</Grid>
												<Grid size={{ xs: 12, sm: 3 }}>
													<Box sx={{ textAlign: 'center' }}>
														<Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: 'text.secondary', mb: 0.5 }}>
															Skill Score ({s.rating}/10)
														</Typography>
														<Rating
															max={10}
															value={s.rating}
															onChange={(_, v) => !viewMode && handleSkillChange(idx, 'rating', v || 0)}
															disabled={viewMode}
															size="small"
															sx={{ color: 'primary.main' }}
														/>
													</Box>
												</Grid>
											</Grid>
										</Paper>
									))}
								</Stack>
							) : (
								<Box sx={{ py: 3, textAlign: 'center', border: '1px dashed divider', borderRadius: 1.5, bgcolor: '#fcfcfc' }}>
									<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
										No skills evaluated yet for this analysis session.
									</Typography>
								</Box>
							)}
						</Paper>
					</Grid>

					{/* Form Status */}
					<Grid size={{ xs: 12, sm: 6 }}>
						<Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block', color: 'text.secondary' }}>
							Analysis Status
						</Typography>
						<TextField
							select
							fullWidth
							size="small"
							required
							disabled={viewMode}
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							sx={inputSx}
						>
							<MenuItem value="draft">Draft</MenuItem>
							<MenuItem value="completed">Completed & Finalized</MenuItem>
						</TextField>
					</Grid>
				</Grid>

				<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
					<Button onClick={onClose} disabled={submitting} sx={{ textTransform: 'none', fontWeight: 700 }}>
						{viewMode ? 'Close' : 'Cancel'}
					</Button>
					{!viewMode && (
						<Button
							type="submit"
							variant="contained"
							disabled={submitting}
							sx={{
								textTransform: 'none',
								fontWeight: 700,
								borderRadius: 1.5,
								boxShadow: 'none',
								'&:hover': { boxShadow: 'none' }
							}}
						>
							{submitting ? 'Saving...' : analysis ? 'Update Analysis' : 'Finalize Analysis'}
						</Button>
					)}
				</Box>
			</Box>
		</Dialog>
	);
};

export default CandidateAnalysisForm;
