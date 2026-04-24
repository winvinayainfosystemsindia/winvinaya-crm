import { useState, useEffect, useCallback } from 'react';
import {
	Box,
	Drawer,
	Typography,
	IconButton,
	Divider,
	Stack,
	Chip,
	Tab,
	Tabs,
	CircularProgress,
	Paper,
	Button,
	Grid,
	Avatar,
	useTheme,
	TextField,
	alpha
} from '@mui/material';
import {
	Timeline,
	TimelineItem,
	TimelineConnector,
	TimelineDot,
} from '@mui/lab';
import {
	Close as CloseIcon,
	History as HistoryIcon,
	Schedule as ScheduleIcon,
	LocalOffer as OfferIcon,
	Notes as NotesIcon,
	Event as EventIcon,
	LocationOn as LocationIcon,
	Work as WorkIcon,
	Send as SendIcon,
	TaskAlt as SuccessIcon,
	HourglassTop as InProgressIcon,
	Handshake as HandshakeIcon,
	ThumbUp as JoinedIcon,
	ThumbDown as RejectedIcon,
	PersonSearch as SearchIcon,
	Description as DescriptionIcon
} from '@mui/icons-material';
import placementMappingService from '../../../../services/placementMappingService';
import authService from '../../../../services/authService';
import { documentService } from '../../../../services/candidateService';
import type { CandidateDocument } from '../../../../models/candidate';
import useToast from '../../../../hooks/useToast';

interface Props {
	open: boolean;
	onClose: () => void;
	mappingId: number;
	candidatePublicId?: string; // New Optional prop
	candidateName: string;
	jobTitle: string;
	onStatusChange?: () => void;
}

const PlacementDetailDrawer = ({ open, onClose, mappingId, candidatePublicId, candidateName, jobTitle, onStatusChange }: Props) => {
	const toast = useToast();
	const theme = useTheme();
	const [tabValue, setTabValue] = useState(0);
	const [loading, setLoading] = useState(false);
	const [history, setHistory] = useState<any[]>([]);
	const [offer, setOffer] = useState<any>(null);
	const [notes, setNotes] = useState<any[]>([]);
	const [newNote, setNewNote] = useState('');
	const [documents, setDocuments] = useState<CandidateDocument[]>([]);

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			if (candidatePublicId) {
				const docs = await documentService.getAll(candidatePublicId);
				setDocuments(docs);
			}

			if (tabValue === 0) {
				const data = await placementMappingService.getPipelineHistory(mappingId);
				setHistory(data);
				// Also fetch offer to show in timeline if needed
				try {
					const offerData = await placementMappingService.getOffer(mappingId);
					setOffer(offerData);
				} catch (e) {
					console.error("Failed to fetch offer for timeline", e);
				}
			} else if (tabValue === 1) {
				const data = await placementMappingService.getOffer(mappingId);
				setOffer(data);
			} else if (tabValue === 2) {
				const data = await placementMappingService.getNotes(mappingId);
				setNotes(data);
			}
		} catch (error: any) {
			toast.error('Failed to load details');
		} finally {
			setLoading(false);
		}
	}, [mappingId, tabValue, toast]);

	useEffect(() => {
		if (open && mappingId) {
			fetchData();
		}
	}, [open, mappingId, tabValue, fetchData]);

	const getStatusConfig = (status: string) => {
		const statusKey = status.toLowerCase();

		const colors: any = {
			applied: theme.palette.info.main,
			shortlisted: theme.palette.success.main,
			interview_l1: theme.palette.accent.main,
			interview_l2: theme.palette.accent.main,
			technical_round: theme.palette.accent.main,
			hr_round: theme.palette.accent.main,
			offer_made: theme.palette.warning.main,
			offer_accepted: theme.palette.success.main,
			offer_rejected: theme.palette.error.main,
			joined: theme.palette.success.main,
			not_joined: theme.palette.error.main,
			dropped: theme.palette.text.secondary,
			rejected: theme.palette.error.main,
			on_hold: theme.palette.warning.main,
		};

		const icons: any = {
			applied: <SearchIcon sx={{ fontSize: 14 }} />,
			shortlisted: <SuccessIcon sx={{ fontSize: 14 }} />,
			interview_l1: <ScheduleIcon sx={{ fontSize: 14 }} />,
			interview_l2: <ScheduleIcon sx={{ fontSize: 14 }} />,
			technical_round: <EventIcon sx={{ fontSize: 14 }} />,
			hr_round: <HandshakeIcon sx={{ fontSize: 14 }} />,
			offer_made: <OfferIcon sx={{ fontSize: 14 }} />,
			offer_accepted: <SuccessIcon sx={{ fontSize: 14 }} />,
			offer_rejected: <RejectedIcon sx={{ fontSize: 14 }} />,
			joined: <JoinedIcon sx={{ fontSize: 14 }} />,
			not_joined: <RejectedIcon sx={{ fontSize: 14 }} />,
			dropped: <InProgressIcon sx={{ fontSize: 14 }} />,
			rejected: <RejectedIcon sx={{ fontSize: 14 }} />,
			on_hold: <InProgressIcon sx={{ fontSize: 14 }} />,
		};

		return {
			color: colors[statusKey] || theme.palette.text.secondary,
			icon: icons[statusKey] || <InProgressIcon sx={{ fontSize: 14 }} />
		};
	};

	// Timezone-aware date helpers (Always IST)
	const formatDateIST = (dateStr: string) => {
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('en-IN', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			timeZone: 'Asia/Kolkata'
		}).format(date).replace(/ /g, '-');
	};

	const handleViewDocument = (documentId?: number, fallbackUrl?: string) => {
		let finalId = documentId;
		
		// If ID is missing but URL is present, try to find the ID in the loaded documents
		if (!finalId && fallbackUrl && documents.length > 0) {
			const matchedDoc = documents.find(d => d.file_path === fallbackUrl || fallbackUrl.endsWith(d.file_path));
			if (matchedDoc) {
				finalId = matchedDoc.id;
			}
		}

		if (finalId) {
			const token = authService.getAccessToken();
			const url = documentService.getPreviewUrl(finalId, token);
			if (url) {
				window.open(url, '_blank');
			} else {
				toast.error('Authentication session expired. Please re-login.');
			}
		} else if (fallbackUrl) {
			// As a last resort, if we still have no ID, try direct URL if it's absolute or has protocol
			// but most resumes use the download endpoint.
			if (fallbackUrl.startsWith('http')) {
				window.open(fallbackUrl, '_blank');
			} else {
				// If it's a relative path and we still don't have an ID, 
				// we might be in trouble since we removed static serving.
				// But resumes work, so they must have IDs.
				toast.error('Could not find secure viewing route for this document.');
			}
		}
	};

	const handleRecordOfferResponse = async (response: 'accepted' | 'rejected') => {
		if (!offer?.id) return;
		try {
			let remarks = undefined;
			if (response === 'rejected') {
				remarks = window.prompt('Please enter the reason for rejection:');
				if (remarks === null) return; // Cancelled
			}
			await placementMappingService.recordOfferResponse(offer.id, response, remarks || undefined);
			toast.success(`Offer ${response} successfully`);
			fetchData();
			if (onStatusChange) onStatusChange();
		} catch (error: any) {
			toast.error(error.message || 'Failed to record response');
		}
	};

	const handleRecordJoining = async (status: 'joined' | 'not_joined') => {
		if (!offer?.id) return;
		try {
			let joiningDate = undefined;
			if (status === 'joined') {
				joiningDate = offer.joining_date; // Use expected as default or ask?
			}
			await placementMappingService.recordJoiningStatus(offer.id, status, joiningDate);
			toast.success(`Candidate marked as ${status.replace('_', ' ')}`);
			
			// If joined, move pipeline to 'joined'
			if (status === 'joined') {
				await placementMappingService.updateStatus(mappingId, 'joined', 'Candidate joined as per offer.');
			} else {
				await placementMappingService.updateStatus(mappingId, 'not_joined', 'Candidate did not join.');
			}
			
			fetchData();
			if (onStatusChange) onStatusChange();
		} catch (error: any) {
			toast.error(error.message || 'Failed to record joining status');
		}
	};

	const formatTimeIST = (dateStr: string) => {
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('en-IN', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
			timeZone: 'Asia/Kolkata'
		}).format(date).toUpperCase();
	};

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			sx={{
				zIndex: 1400,
				'& .MuiDrawer-paper': {
					width: { xs: '100%', sm: 500, md: 600 },
					bgcolor: 'background.default',
					boxShadow: `-4px 0 20px ${alpha(theme.palette.common.black, 0.1)}`,
					border: 'none'
				}
			}}
		>
			<Box sx={{
				p: 2.5,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				bgcolor: theme.palette.secondary.light,
				color: 'white',
				borderBottom: `1px solid ${theme.palette.divider}`
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<Box sx={{ bgcolor: theme.palette.accent.main, p: 1.25, borderRadius: '4px', display: 'flex', boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.2)}` }}>
						<WorkIcon sx={{ color: 'white', fontSize: 20 }} />
					</Box>
					<Box>
						<Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, letterSpacing: '0.2px' }}>
							Placement Lifecycle
						</Typography>
						<Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.7), fontSize: '0.75rem', fontWeight: 500 }}>
							{candidateName} • {jobTitle}
						</Typography>
					</Box>
				</Box>
				<Stack direction="row" spacing={1} alignItems="center">
					{documents && documents.length > 0 && (
						<Button
							size="small"
							startIcon={<DescriptionIcon sx={{ fontSize: 16 }} />}
							onClick={() => {
								// Prioritize active trainer resume, then any active resume, then first available resume
								const activeTrainerResume = documents.find((d: CandidateDocument) => d.document_type?.toLowerCase().includes('trainer_resume') && d.is_active);
								const activeResume = documents.find((d: CandidateDocument) => d.document_type?.toLowerCase().includes('resume') && d.is_active);
								const fallbackResume = documents.find((d: CandidateDocument) => d.document_type?.toLowerCase().includes('resume'));
								
								const targetDoc = activeTrainerResume || activeResume || fallbackResume;
								
								if (targetDoc) {
									handleViewDocument(targetDoc.id);
								} else {
									toast.info('No resume document found for this candidate.');
								}
							}}
							sx={{
								textTransform: 'none',
								color: 'white',
								fontWeight: 700,
								bgcolor: alpha(theme.palette.common.white, 0.1),
								px: 2,
								'&:hover': { bgcolor: alpha(theme.palette.common.white, 0.2) }
							}}
						>
							Resume
						</Button>
					)}
					<IconButton onClick={onClose} sx={{ color: 'white', '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) } }}>
						<CloseIcon fontSize="small" />
					</IconButton>
				</Stack>
			</Box>

			<Box sx={{ bgcolor: 'background.paper', borderBottom: `1px solid ${theme.palette.divider}`, position: 'sticky', top: 0, zIndex: 1 }}>
				<Tabs
					value={tabValue}
					onChange={(_, v) => setTabValue(v)}
					variant="fullWidth"
					sx={{
						'& .MuiTab-root': {
							minHeight: 52,
							textTransform: 'none',
							fontWeight: 700,
							fontSize: '0.8125rem',
							color: theme.palette.text.secondary,
							transition: 'all 0.2s'
						},
						'& .MuiTabs-indicator': {
							height: 3,
							bgcolor: theme.palette.accent.main
						},
						'& .Mui-selected': {
							color: `${theme.palette.accent.main} !important`
						}
					}}
				>
					<Tab icon={<HistoryIcon sx={{ fontSize: 18 }} />} label="Timeline" iconPosition="start" />
					<Tab icon={<OfferIcon sx={{ fontSize: 18 }} />} label="Offer" iconPosition="start" />
					<Tab icon={<NotesIcon sx={{ fontSize: 18 }} />} label="Notes" iconPosition="start" />
				</Tabs>
			</Box>

			<Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
				{loading ? (
					<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, gap: 2 }}>
						<CircularProgress size={32} thickness={5} sx={{ color: theme.palette.accent.main }} />
						<Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
							Syncing Details...
						</Typography>
					</Box>
				) : (
					<>
						{tabValue === 0 && (
							<Timeline sx={{ p: 0, m: 0 }}>
								{history.map((item, index) => {
									const config = getStatusConfig(item.to_status);
									return (
										<TimelineItem key={index} sx={{ '&:before': { display: 'none' } }}>
											<Box sx={{ display: 'flex', gap: 2.5, width: '100%', mb: 1 }}>
												{/* Date & Time Column */}
												<Box sx={{ minWidth: 95, textAlign: 'right', pt: 0.75 }}>
													<Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.text.primary, display: 'block', fontSize: '0.75rem', letterSpacing: '0.2px' }}>
														{formatDateIST(item.changed_at)}
													</Typography>
													<Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.7rem' }}>
														{formatTimeIST(item.changed_at)}
													</Typography>
												</Box>

												{/* Icon Axis */}
												<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
													<TimelineDot
														variant="outlined"
														sx={{
															borderColor: alpha(config.color as string, 0.3),
															color: config.color,
															bgcolor: alpha(config.color as string, 0.05),
															boxShadow: `0 0 0 4px ${theme.palette.background.paper}`,
															width: 34,
															height: 34,
															m: 0,
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															padding: 0
														}}
													>
														{config.icon}
													</TimelineDot>
													{index < history.length - 1 && (
														<TimelineConnector sx={{ bgcolor: theme.palette.divider, width: 2, my: 0.5 }} />
													)}
												</Box>

												{/* Content Area */}
												<Box sx={{ pb: 4, flex: 1 }}>
													<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
														<Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary, textTransform: 'capitalize' }}>
															{item.to_status.replace(/_/g, ' ')}
														</Typography>
														{item.changed_by_name && (
															<Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
																• {item.changed_by_name}
															</Typography>
														)}
													</Stack>

													{item.remarks && (
														<Box sx={{
															p: 2,
															bgcolor: theme.palette.background.paper,
															borderRadius: '4px',
															border: `1px solid ${theme.palette.divider}`,
															position: 'relative',
															boxShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.05)}`,
															'&:before': {
																content: '""',
																position: 'absolute',
																left: 0,
																top: 8,
																bottom: 8,
																width: '3px',
																bgcolor: config.color,
																borderRadius: '0 4px 4px 0'
															}
														}}>
															<Typography 
																variant="body2" 
																sx={{ 
																	fontSize: '0.8125rem', 
																	color: theme.palette.text.primary, 
																	lineHeight: 1.6, 
																	pl: 0.5,
																	whiteSpace: 'pre-wrap'
																}}
															>
																{item.remarks
																	?.replace(/\(CTC:.*Joining:.*\)/, '')
																	?.replace(/DocumentID: \d+ \| Document: .*/, '')
																	?.trim()}
															</Typography>
														</Box>
													)}

													{(item.to_status === 'offer_made' || item.to_status === 'offered' || (item.remarks && (item.remarks.includes('uploads/') || item.remarks.includes('Document:')))) && (
														<Button
															size="small"
															startIcon={<DescriptionIcon sx={{ fontSize: 14 }} />}
															onClick={() => {
																const idMatch = item.remarks?.match(/DocumentID: (\d+)/);
																const docMatch = item.remarks?.match(/Document: (.*)/);
																const idFromRemarks = idMatch ? parseInt(idMatch[1]) : undefined;
																const urlFromRemarks = docMatch ? docMatch[1] : undefined;
																
																handleViewDocument(
																	idFromRemarks || offer?.offer_letter_id, 
																	urlFromRemarks || offer?.offer_letter_url
																);
															}}
															sx={{
																mt: 1.5,
																textTransform: 'none',
																fontWeight: 700,
																fontSize: '0.75rem',
																color: theme.palette.primary.main,
																'&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
															}}
														>
															View Document
														</Button>
													)}
												</Box>
											</Box>
										</TimelineItem>
									);
								})}
								{history.length === 0 && (
									<Box sx={{ textAlign: 'center', py: 10 }}>
										<HistoryIcon sx={{ fontSize: 48, color: theme.palette.divider, mb: 2 }} />
										<Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
											No activity recorded for this candidate.
										</Typography>
									</Box>
								)}
							</Timeline>
						)}

						{tabValue === 1 && (
							<Box>
								{offer ? (
									<Paper
										elevation={0}
										sx={{
											border: `1px solid ${theme.palette.divider}`,
											borderRadius: '8px',
											bgcolor: theme.palette.background.paper,
											overflow: 'hidden'
										}}
									>
										<Box sx={{ p: 2.5, bgcolor: alpha(theme.palette.secondary.light, 0.02), borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
											<Typography variant="awsSectionTitle" sx={{ color: theme.palette.primary.main }}>Employment Offer</Typography>
											<Chip
												label={offer.joining_status || offer.candidate_response?.toUpperCase()}
												sx={{ fontWeight: 800, bgcolor: theme.palette.accent.main, color: 'white', height: 24, fontSize: '0.7rem', borderRadius: '4px' }}
											/>
										</Box>
										<Box sx={{ p: 3 }}>
											<Grid container spacing={4}>
												<Grid size={{ xs: 6 }}>
													<Typography variant="awsFieldLabel">Annual CTC</Typography>
													<Typography variant="body1" sx={{ fontWeight: 800, color: theme.palette.text.primary, fontSize: '1.1rem' }}>
														₹{offer.offered_ctc?.toLocaleString() || 'N/A'}
													</Typography>
												</Grid>
												<Grid size={{ xs: 6 }}>
													<Typography variant="awsFieldLabel">Designation</Typography>
													<Typography variant="body1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
														{offer.offered_designation || 'N/A'}
													</Typography>
												</Grid>
												<Grid size={{ xs: 12 }}><Divider sx={{ borderStyle: 'dashed' }} /></Grid>
												<Grid size={{ xs: 6 }}>
													<Typography variant="awsFieldLabel">Expected Joining</Typography>
													<Stack direction="row" spacing={1} alignItems="center">
														<EventIcon sx={{ fontSize: 18, color: theme.palette.accent.main }} />
														<Typography variant="body2" sx={{ fontWeight: 700 }}>
															{offer.joining_date ? formatDateIST(offer.joining_date) : 'N/A'}
														</Typography>
													</Stack>
												</Grid>
												<Grid size={{ xs: 6 }}>
													<Typography variant="awsFieldLabel">Work Location</Typography>
													<Stack direction="row" spacing={1} alignItems="center">
														<LocationIcon sx={{ fontSize: 18, color: theme.palette.error.main }} />
														<Typography variant="body2" sx={{ fontWeight: 700 }}>
															{offer.work_location || 'N/A'}
														</Typography>
													</Stack>
												</Grid>
												{(offer.offer_letter_id || offer.offer_letter_url) && (
													<Grid size={{ xs: 12 }}>
														<Button
															variant="outlined"
															fullWidth
															startIcon={<DescriptionIcon />}
															onClick={() => handleViewDocument(offer?.offer_letter_id, offer?.offer_letter_url)}
															sx={{
																mt: 1,
																textTransform: 'none',
																fontWeight: 700,
																borderColor: theme.palette.primary.main,
																color: theme.palette.primary.main,
																bgcolor: alpha(theme.palette.primary.main, 0.05),
																'&:hover': {
																	bgcolor: alpha(theme.palette.primary.main, 0.1),
																	borderColor: theme.palette.primary.main
																}
															}}
														>
															View Offer Letter
														</Button>
													</Grid>
												)}
											</Grid>

											<Box sx={{ mt: 4, pt: 3, borderTop: `1px dashed ${theme.palette.divider}` }}>
												{(!offer.candidate_response || offer.candidate_response === 'pending') ? (
													<Stack direction="row" spacing={2}>
														<Button
															fullWidth
															variant="contained"
															color="success"
															onClick={() => handleRecordOfferResponse('accepted')}
															sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '4px' }}
														>
															Accept Offer
														</Button>
														<Button
															fullWidth
															variant="outlined"
															color="error"
															onClick={() => handleRecordOfferResponse('rejected')}
															sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '4px' }}
														>
															Reject Offer
														</Button>
													</Stack>
												) : offer.candidate_response === 'accepted' && (!offer.joining_status || offer.joining_status === 'pending') ? (
													<Stack direction="row" spacing={2}>
														<Button
															fullWidth
															variant="contained"
															color="primary"
															onClick={() => handleRecordJoining('joined')}
															sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '4px' }}
														>
															Mark as Joined
														</Button>
														<Button
															fullWidth
															variant="outlined"
															color="warning"
															onClick={() => handleRecordJoining('not_joined')}
															sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '4px' }}
														>
															Did Not Join
														</Button>
													</Stack>
												) : (
													<Box sx={{ bgcolor: alpha(theme.palette.accent.main, 0.05), p: 2, borderRadius: '4px', textAlign: 'center' }}>
														<Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.accent.main }}>
															Lifecycle completed: {offer.joining_status?.toUpperCase() || offer.candidate_response?.toUpperCase()}
														</Typography>
													</Box>
												)}
											</Box>
										</Box>
									</Paper>
								) : (
									<Box sx={{ textAlign: 'center', py: 10, bgcolor: theme.palette.background.paper, borderRadius: '8px', border: `1px dashed ${theme.palette.divider}` }}>
										<OfferIcon sx={{ fontSize: 40, color: theme.palette.divider, mb: 2 }} />
										<Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
											Offer details not yet projected.
										</Typography>
										<Button
											size="small"
											variant="outlined"
											sx={{
												mt: 3,
												textTransform: 'none',
												fontWeight: 700,
												borderColor: theme.palette.divider,
												color: theme.palette.text.primary
											}}
										>
											Generate Offer
										</Button>
									</Box>
								)}
							</Box>
						)}

						{tabValue === 2 && (
							<Box>
								<Box sx={{ mb: 4 }}>
									<Typography variant="awsFieldLabel" sx={{ mb: 1.5 }}>Add Private Observation</Typography>
									<TextField
										multiline
										rows={3}
										fullWidth
										placeholder="Only visible to internal recruitment team..."
										value={newNote}
										onChange={(e) => setNewNote(e.target.value)}
										sx={{
											bgcolor: theme.palette.background.paper,
											'& .MuiOutlinedInput-root': { borderRadius: '4px' }
										}}
									/>
									<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
										<Button
											variant="contained"
											size="small"
											endIcon={<SendIcon sx={{ fontSize: 14 }} />}
											sx={{
												textTransform: 'none',
												bgcolor: theme.palette.accent.main,
												fontWeight: 700,
												borderRadius: '4px',
												px: 3,
												'&:hover': { bgcolor: theme.palette.accent.dark }
											}}
											disabled={!newNote.trim()}
										>
											Commit Note
										</Button>
									</Box>
								</Box>

								<Typography variant="awsSectionTitle" sx={{ mb: 2 }}>Note History</Typography>
								<Stack spacing={2}>
									{notes.map((note, index) => (
										<Paper
											key={index}
											elevation={0}
											sx={{
												p: 2.5,
												border: `1px solid ${theme.palette.divider}`,
												bgcolor: theme.palette.background.paper,
												borderRadius: '8px'
											}}
										>
											<Box sx={{ display: 'flex', gap: 2 }}>
												<Avatar sx={{ width: 32, height: 32, fontSize: '0.8125rem', bgcolor: theme.palette.secondary.light, fontWeight: 700 }}>
													{note.created_by_name?.[0] || 'U'}
												</Avatar>
												<Box sx={{ flexGrow: 1 }}>
													<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
														<Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
															{note.created_by_name || 'System User'}
														</Typography>
														<Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
															{formatDateIST(note.created_at)} • {formatTimeIST(note.created_at)}
														</Typography>
													</Box>
													<Typography variant="body2" sx={{ color: theme.palette.text.primary, fontSize: '0.875rem', lineHeight: 1.6 }}>
														{note.content}
													</Typography>
												</Box>
											</Box>
										</Paper>
									))}
								</Stack>
								{notes.length === 0 && (
									<Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
										<NotesIcon sx={{ fontSize: 40, mb: 1.5, color: theme.palette.divider }} />
										<Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.secondary }}>
											No internal notes captured yet.
										</Typography>
									</Box>
								)}
							</Box>
						)}
					</>
				)}
			</Box>
		</Drawer>
	);
};

export default PlacementDetailDrawer;
