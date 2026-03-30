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
	TextField
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
	Link as LinkIcon,
	Work as WorkIcon,
	Send as SendIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import placementMappingService from '../../../../services/placementMappingService';
import useToast from '../../../../hooks/useToast';

interface Props {
	open: boolean;
	onClose: () => void;
	mappingId: number;
	candidateName: string;
	jobTitle: string;
}

const PlacementDetailDrawer = ({ open, onClose, mappingId, candidateName, jobTitle }: Props) => {
	const toast = useToast();
	const [tabValue, setTabValue] = useState(0);
	const [loading, setLoading] = useState(false);
	const [history, setHistory] = useState<any[]>([]);
	const [interviews, setInterviews] = useState<any[]>([]);
	const [offer, setOffer] = useState<any>(null);
	const [notes, setNotes] = useState<any[]>([]);
	const [newNote, setNewNote] = useState('');

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			if (tabValue === 0) {
				const data = await placementMappingService.getPipelineHistory(mappingId);
				setHistory(data);
			} else if (tabValue === 1) {
				const data = await placementMappingService.getInterviews(mappingId);
				setInterviews(data);
			} else if (tabValue === 2) {
				const data = await placementMappingService.getOffer(mappingId);
				setOffer(data);
			} else if (tabValue === 3) {
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

	const getStatusColor = (status: string) => {
		const config: any = {
			applied: '#0066cc',
			shortlisted: '#1d8102',
			interview_l1: '#684eb8',
			interview_l2: '#684eb8',
			technical_round: '#684eb8',
			hr_round: '#684eb8',
			offer_made: '#ff9900',
			offer_accepted: '#1d8102',
			offer_rejected: '#d13212',
			joined: '#1d8102',
			not_joined: '#d13212',
			dropped: '#545b64',
			rejected: '#d13212',
			on_hold: '#ff9900',
		};
		return config[status.toLowerCase()] || '#545b64';
	};

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			sx={{
				zIndex: 1400, // Ensure it's above system headers
				'& .MuiDrawer-paper': {
					width: { xs: '100%', sm: 500, md: 600 },
					bgcolor: '#f8f9fa',
					boxShadow: '-4px 0 20px rgba(0,0,0,0.1)'
				}
			}}
		>
			<Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#232f3e', color: 'white' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<Box sx={{ bgcolor: '#ff9900', p: 1, borderRadius: '4px', display: 'flex' }}>
						<WorkIcon sx={{ color: '#232f3e', fontSize: 20 }} />
					</Box>
					<Box>
						<Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
							Placement Lifecycle
						</Typography>
						<Typography variant="caption" sx={{ color: '#aab7bd', fontSize: '0.7rem' }}>
							{candidateName} • {jobTitle}
						</Typography>
					</Box>
				</Box>
				<IconButton onClick={onClose} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
					<CloseIcon fontSize="small" />
				</IconButton>
			</Box>

			<Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, zIndex: 1 }}>
				<Tabs
					value={tabValue}
					onChange={(_, v) => setTabValue(v)}
					variant="fullWidth"
					sx={{ 
						'& .MuiTab-root': { 
							minHeight: 56, 
							textTransform: 'none', 
							fontWeight: 600, 
							fontSize: '0.85rem',
							color: '#545b64'
						},
						'& .MuiTabs-indicator': {
							height: 3,
							bgcolor: '#ec7211'
						},
						'& .Mui-selected': {
							color: '#ec7211 !important'
						}
					}}
				>
					<Tab icon={<HistoryIcon sx={{ fontSize: 18 }} />} label="Timeline" iconPosition="start" />
					<Tab icon={<ScheduleIcon sx={{ fontSize: 18 }} />} label="Interviews" iconPosition="start" />
					<Tab icon={<OfferIcon sx={{ fontSize: 18 }} />} label="Offer" iconPosition="start" />
					<Tab icon={<NotesIcon sx={{ fontSize: 18 }} />} label="Notes" iconPosition="start" />
				</Tabs>
			</Box>

			<Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
				{loading ? (
					<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, gap: 2 }}>
						<CircularProgress size={32} thickness={5} sx={{ color: '#ec7211' }} />
						<Typography variant="body2" color="textSecondary">Fetching placement data...</Typography>
					</Box>
				) : (
					<>
						{tabValue === 0 && (
							<Timeline sx={{ p: 0, m: 0 }}>
								{history.map((item, index) => (
									<TimelineItem key={index} sx={{ '&:before': { display: 'none' } }}>
										<Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
											<Box sx={{ minWidth: 70, textAlign: 'right', pt: 0.5 }}>
												<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
													{format(new Date(item.changed_at), 'MMM dd')}
												</Typography>
												<Typography variant="caption" sx={{ color: 'textDisabled', fontSize: '0.65rem' }}>
													{format(new Date(item.changed_at), 'p')}
												</Typography>
											</Box>
											
											<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
												<TimelineDot 
													sx={{ 
														bgcolor: getStatusColor(item.to_status), 
														boxShadow: 'none',
														width: 12,
														height: 12,
														m: 0,
														border: '2px solid white'
													}} 
												/>
												{index < history.length - 1 && <TimelineConnector sx={{ bgcolor: '#eaeded', width: 2 }} />}
											</Box>
											
											<Box sx={{ pb: 4, flex: 1 }}>
												<Stack direction="row" spacing={1} alignItems="center">
													<Typography variant="body2" sx={{ fontWeight: 600, color: '#232f3e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
														{item.to_status.replace('_', ' ')}
													</Typography>
													{item.changed_by_name && (
														<Typography variant="caption" sx={{ color: 'textSecondary', fontSize: '0.7rem', fontStyle: 'italic' }}>
															• {item.changed_by_name}
														</Typography>
													)}
												</Stack>
												
												{item.remarks && (
													<Box sx={{ 
														mt: 1, 
														p: 1.5, 
														bgcolor: 'white', 
														borderRadius: '4px',
														border: '1px solid #eaeded',
														boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
														position: 'relative',
														'&:before': {
															content: '""',
															position: 'absolute',
															left: 0,
															top: 0,
															bottom: 0,
															width: '3px',
															bgcolor: getStatusColor(item.to_status),
															borderTopLeftRadius: '4px',
															borderBottomLeftRadius: '4px'
														}
													}}>
														<Typography variant="body2" sx={{ fontSize: '0.825rem', color: '#545b64', lineHeight: 1.5 }}>
															{item.remarks}
														</Typography>
													</Box>
												)}
											</Box>
										</Box>
									</TimelineItem>
								))}
								{history.length === 0 && (
									<Box sx={{ textAlign: 'center', py: 10 }}>
										<HistoryIcon sx={{ fontSize: 48, color: '#eaeded', mb: 2 }} />
										<Typography variant="body2" color="textSecondary">No activity recorded for this candidate.</Typography>
									</Box>
								)}
							</Timeline>
						)}
						
						{tabValue === 1 && (
							<Box>
								<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
									<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e' }}>Interview Rounds</Typography>
									<Button 
										variant="contained" 
										size="small"
										startIcon={<ScheduleIcon sx={{ fontSize: 16 }} />}
										sx={{ 
											textTransform: 'none', 
											bgcolor: '#ec7211',
											'&:hover': { bgcolor: '#eb5f07' }
										}}
									>
										Schedule Round
									</Button>
								</Stack>
								<Stack spacing={2}>
									{interviews.map((iv, index) => (
										<Paper key={index} elevation={0} sx={{ border: '1px solid #eaeded', borderRadius: '8px', overflow: 'hidden' }}>
											<Box sx={{ display: 'flex' }}>
												<Box sx={{ width: 80, bgcolor: '#f3faff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
													<Typography variant="h4" sx={{ fontWeight: 300, color: '#0066cc' }}>{iv.round_number}</Typography>
													<Typography variant="caption" sx={{ fontWeight: 800, color: '#0066cc', fontSize: '0.6rem' }}>ROUND</Typography>
												</Box>
												<Box sx={{ p: 2, flexGrow: 1 }}>
													<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
														<Typography variant="body2" sx={{ fontWeight: 700, color: '#232f3e' }}>{iv.round_type?.toUpperCase()}</Typography>
														<Chip 
															label={iv.result?.toUpperCase() || 'PENDING'} 
															size="small"
															sx={{ 
																height: 20,
																fontSize: '0.65rem', 
																fontWeight: 700,
																bgcolor: iv.result === 'passed' ? '#e7f4e4' : iv.result === 'failed' ? '#fdeaea' : '#fff4e5',
																color: iv.result === 'passed' ? '#1d8102' : iv.result === 'failed' ? '#d13212' : '#ff9900'
															}}
														/>
													</Box>
													<Grid container spacing={1}>
														<Grid size={{ xs: 12 }}>
															<Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
																<WorkIcon sx={{ fontSize: 14 }} /> {iv.interviewer_name || 'Assigned Interviewer'}
															</Typography>
														</Grid>
														<Grid size={{ xs: 12 }}>
															<Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
																<EventIcon sx={{ fontSize: 14 }} /> {iv.scheduled_at ? format(new Date(iv.scheduled_at), 'PPP • p') : 'Date TBD'}
															</Typography>
														</Grid>
													</Grid>
													{iv.interview_link && (
														<Button 
															size="small" 
															startIcon={<LinkIcon />} 
															href={iv.interview_link} 
															target="_blank"
															sx={{ mt: 1.5, textTransform: 'none', fontSize: '0.75rem', color: '#0066cc' }}
														>
															Meeting Link
														</Button>
													)}
												</Box>
											</Box>
										</Paper>
									))}
								</Stack>
								{interviews.length === 0 && (
									<Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: '8px', border: '1px dashed #eaeded' }}>
										<ScheduleIcon sx={{ fontSize: 40, color: '#eaeded', mb: 2 }} />
										<Typography variant="body2" color="textSecondary">No scheduled interviews found.</Typography>
									</Box>
								)}
							</Box>
						)}
						
						{tabValue === 2 && (
							<Box>
								{offer ? (
									<Paper elevation={0} sx={{ border: '1px solid #eaeded', borderRadius: '8px', bgcolor: 'white', overflow: 'hidden' }}>
										<Box sx={{ p: 2, bgcolor: '#f3faff', borderBottom: '1px solid #eaeded', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
											<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0066cc' }}>Employment Offer</Typography>
											<Chip 
												label={offer.joining_status || offer.candidate_response?.toUpperCase()} 
												sx={{ fontWeight: 800, bgcolor: '#ec7211', color: 'white', height: 24, fontSize: '0.7rem' }}
											/>
										</Box>
										<Box sx={{ p: 3 }}>
											<Grid container spacing={3}>
												<Grid size={{ xs: 6 }}>
													<Typography variant="caption" color="textSecondary">Annual CTC</Typography>
													<Typography variant="body1" sx={{ fontWeight: 700, color: '#232f3e' }}>₹{offer.offered_ctc?.toLocaleString() || 'N/A'}</Typography>
												</Grid>
												<Grid size={{ xs: 6 }}>
													<Typography variant="caption" color="textSecondary">Designation</Typography>
													<Typography variant="body1" sx={{ fontWeight: 700, color: '#232f3e' }}>{offer.offered_designation || 'N/A'}</Typography>
												</Grid>
												<Grid size={{ xs: 12 }}><Divider /></Grid>
												<Grid size={{ xs: 6 }}>
													<Typography variant="caption" color="textSecondary">Expected Joining</Typography>
													<Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, fontWeight: 500 }}>
														<EventIcon sx={{ fontSize: 16, color: '#ec7211' }} />
														{offer.joining_date ? format(new Date(offer.joining_date), 'PPP') : 'N/A'}
													</Typography>
												</Grid>
												<Grid size={{ xs: 6 }}>
													<Typography variant="caption" color="textSecondary">Work Location</Typography>
													<Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, fontWeight: 500 }}>
														<LocationIcon sx={{ fontSize: 16, color: '#d13212' }} />
														{offer.work_location || 'N/A'}
													</Typography>
												</Grid>
											</Grid>
										</Box>
									</Paper>
								) : (
									<Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: '8px', border: '1px dashed #eaeded' }}>
										<OfferIcon sx={{ fontSize: 40, color: '#eaeded', mb: 2 }} />
										<Typography variant="body2" color="textSecondary">Offer details not available.</Typography>
										<Button size="small" variant="outlined" sx={{ mt: 3, textTransform: 'none' }}>Create Offer</Button>
									</Box>
								)}
							</Box>
						)}
						
						{tabValue === 3 && (
							<Box>
								<Box sx={{ mb: 3 }}>
									<TextField
										multiline
										rows={2}
										fullWidth
										placeholder="Write a professional internal note..."
										value={newNote}
										onChange={(e) => setNewNote(e.target.value)}
										sx={{ bgcolor: 'white' }}
									/>
									<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
										<Button 
											variant="contained" 
											size="small" 
											endIcon={<SendIcon sx={{ fontSize: 14 }} />}
											sx={{ textTransform: 'none', bgcolor: '#ec7211' }}
											disabled={!newNote.trim()}
										>
											Add Note
										</Button>
									</Box>
								</Box>
								
								<Stack spacing={2}>
									{notes.map((note, index) => (
										<Paper key={index} elevation={0} sx={{ p: 2, border: '1px solid #eaeded', bgcolor: 'white' }}>
											<Box sx={{ display: 'flex', gap: 1.5 }}>
												<Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#545b64' }}>
													{note.created_by_name?.[0] || 'U'}
												</Avatar>
												<Box sx={{ flexGrow: 1 }}>
													<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
														<Typography variant="caption" sx={{ fontWeight: 700, color: '#232f3e' }}>
															{note.created_by_name || 'System Admin'}
														</Typography>
														<Typography variant="caption" sx={{ color: 'textDisabled' }}>
															{format(new Date(note.created_at), 'MMM dd, p')}
														</Typography>
													</Box>
													<Typography variant="body2" sx={{ color: '#545b64', fontSize: '0.85rem', lineHeight: 1.5 }}>
														{note.content}
													</Typography>
												</Box>
											</Box>
										</Paper>
									))}
								</Stack>
								{notes.length === 0 && (
									<Box sx={{ textAlign: 'center', py: 6, opacity: 0.5 }}>
										<NotesIcon sx={{ fontSize: 40, mb: 1.5, color: '#eaeded' }} />
										<Typography variant="body2">No internal notes captured yet.</Typography>
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
