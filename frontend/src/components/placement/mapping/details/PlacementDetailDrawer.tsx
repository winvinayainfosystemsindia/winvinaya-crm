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
    List,
    Paper,
    Button,
    Grid,
    Avatar
} from '@mui/material';
import {
	Timeline,
	TimelineItem,
	TimelineSeparator,
	TimelineConnector,
	TimelineContent,
	TimelineDot,
	TimelineOppositeContent
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
    Work as WorkIcon
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
			PaperProps={{
				sx: { width: { xs: '100%', sm: 500, md: 600 }, bgcolor: '#f8f9fa' }
			}}
		>
			<Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#232f3e', color: 'white' }}>
				<Box>
					<Typography variant="h6" sx={{ fontWeight: 300, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon sx={{ color: '#ff9900' }} />
                        Placement Lifecycle
                    </Typography>
					<Typography variant="caption" sx={{ color: '#aab7bd' }}>Tracking {candidateName} for {jobTitle}</Typography>
				</Box>
				<IconButton onClick={onClose} sx={{ color: 'white' }}>
					<CloseIcon />
				</IconButton>
			</Box>

			<Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, zIndex: 1 }}>
				<Tabs
					value={tabValue}
					onChange={(_, v) => setTabValue(v)}
					sx={{ 
                        px: 2,
                        '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }
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
						<CircularProgress size={32} />
                        <Typography variant="body2" color="textSecondary">Fetching placement data...</Typography>
					</Box>
				) : (
					<>
						{tabValue === 0 && (
							<Timeline position="right" sx={{ px: 0 }}>
								{history.map((item, index) => (
									<TimelineItem key={index}>
										<TimelineOppositeContent sx={{ flex: 0.25, py: '12px', px: 2 }}>
											<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
												{format(new Date(item.changed_at), 'MMM dd')}
											</Typography>
                                            <Typography variant="caption" display="block" color="textDisabled">
                                                {format(new Date(item.changed_at), 'p')}
                                            </Typography>
										</TimelineOppositeContent>
										<TimelineSeparator>
											<TimelineDot sx={{ bgcolor: getStatusColor(item.to_status), boxShadow: 'none' }} />
											{index < history.length - 1 && <TimelineConnector sx={{ bgcolor: '#e0e0e0' }} />}
										</TimelineSeparator>
										<TimelineContent sx={{ py: '12px', px: 2 }}>
											<Typography variant="subtitle2" sx={{ fontWeight: 800, color: getStatusColor(item.to_status) }}>
												{item.to_status.replace('_', ' ').toUpperCase()}
											</Typography>
											{item.remarks && (
												<Paper variant="outlined" sx={{ p: 1.5, mt: 1, bgcolor: '#fcfcfc', borderStyle: 'dashed' }}>
                                                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8125rem' }}>
                                                        {item.remarks}
                                                    </Typography>
                                                </Paper>
											)}
										</TimelineContent>
									</TimelineItem>
								))}
								{history.length === 0 && (
									<Box sx={{ textAlign: 'center', py: 10 }}>
										<HistoryIcon sx={{ fontSize: 48, color: 'divider', mb: 2 }} />
										<Typography variant="body2" color="textSecondary">No timeline history recorded yet.</Typography>
									</Box>
								)}
							</Timeline>
						)}
                        
                        {tabValue === 1 && (
                            <Box>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Interview Rounds</Typography>
                                    <Button size="small" variant="contained" startIcon={<ScheduleIcon />} sx={{ textTransform: 'none', borderRadius: '4px' }}>
                                        Schedule Next
                                    </Button>
                                </Stack>
                                <List sx={{ width: '100%', p: 0 }}>
                                    {interviews.map((iv, index) => (
                                        <Paper key={index} variant="outlined" sx={{ mb: 2, overflow: 'hidden', borderRadius: '4px' }}>
                                            <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
                                                <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                                                    <Typography variant="h5" sx={{ fontWeight: 200 }}>R{iv.round_number}</Typography>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{iv.round_type?.toUpperCase()}</Typography>
                                                </Box>
                                                <Divider orientation="vertical" flexItem />
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{iv.interviewer_name || 'TBD'}</Typography>
                                                            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                                    <EventIcon sx={{ fontSize: 14 }} /> {iv.scheduled_at ? format(new Date(iv.scheduled_at), 'MMM dd, p') : 'Unscheduled'}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                                    <LocationIcon sx={{ fontSize: 14 }} /> {iv.mode}
                                                                </Typography>
                                                            </Stack>
                                                        </Box>
                                                        <Chip 
                                                            label={iv.result?.toUpperCase() || 'PENDING'} 
                                                            size="small"
                                                            sx={{ 
                                                                fontSize: '0.65rem', 
                                                                fontWeight: 800,
                                                                bgcolor: iv.result === 'passed' ? 'success.lighter' : iv.result === 'failed' ? 'error.lighter' : 'warning.lighter',
                                                                color: iv.result === 'passed' ? 'success.main' : iv.result === 'failed' ? 'error.main' : 'warning.main',
                                                                borderRadius: '2px'
                                                            }}
                                                        />
                                                    </Stack>
                                                    {iv.interview_link && (
                                                        <Button 
                                                            size="small" 
                                                            startIcon={<LinkIcon />} 
                                                            href={iv.interview_link} 
                                                            target="_blank"
                                                            sx={{ mt: 1, textTransform: 'none', fontSize: '0.75rem' }}
                                                        >
                                                            Join Meeting
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Paper>
                                    ))}
                                    {interviews.length === 0 && (
                                        <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: '4px', border: '1px dashed #e0e0e0' }}>
                                            <ScheduleIcon sx={{ fontSize: 48, color: 'divider', mb: 2 }} />
                                            <Typography variant="body2" color="textSecondary">No interviews scheduled yet.</Typography>
                                        </Box>
                                    )}
                                </List>
                            </Box>
                        )}
                        
                        {tabValue === 2 && (
                            <Box>
                                {offer ? (
                                    <Paper variant="outlined" sx={{ p: 3, borderRadius: '4px', bgcolor: 'white' }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                                            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 300 }}>Offer Details</Typography>
                                            <Chip 
                                                label={offer.joining_status || offer.candidate_response?.toUpperCase()} 
                                                color={offer.candidate_response === 'accepted' ? 'success' : 'warning'}
                                                sx={{ borderRadius: '4px', fontWeight: 700 }}
                                            />
                                        </Stack>
                                        <Grid container spacing={3}>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography variant="caption" color="textSecondary">OFFERED CTC</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 700 }}>₹{offer.offered_ctc?.toLocaleString() || 'N/A'}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography variant="caption" color="textSecondary">DESIGNATION</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 700 }}>{offer.offered_designation || 'N/A'}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <Divider sx={{ my: 1 }} />
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography variant="caption" color="textSecondary">JOINING DATE</Typography>
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                    <EventIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                                    {offer.joining_date ? format(new Date(offer.joining_date), 'PPP') : 'N/A'}
                                                </Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography variant="caption" color="textSecondary">LOCATION</Typography>
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                    <LocationIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                                    {offer.work_location || 'N/A'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: '4px', border: '1px dashed #e0e0e0' }}>
                                        <OfferIcon sx={{ fontSize: 48, color: 'divider', mb: 2 }} />
                                        <Typography variant="body2" color="textSecondary">No job offer recorded for this mapping.</Typography>
                                        <Button variant="outlined" sx={{ mt: 3, textTransform: 'none' }}>Generate Offer</Button>
                                    </Box>
                                )}
                            </Box>
                        )}
                        
                        {tabValue === 3 && (
                            <Box>
                                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                                    <Paper sx={{ flexGrow: 1, p: 1, display: 'flex', gap: 1 }}>
                                        <Box component="input" placeholder="Add internal note..." sx={{ flexGrow: 1, border: 'none', px: 1, '&:focus': { outline: 'none' } }} />
                                        <Button variant="contained" size="small" sx={{ textTransform: 'none' }}>Add</Button>
                                    </Paper>
                                </Stack>
                                <List sx={{ width: '100%', p: 0 }}>
                                    {notes.map((note, index) => (
                                        <Paper key={index} variant="outlined" sx={{ mb: 2, p: 2, borderLeft: note.is_pinned ? '4px solid #ff9900' : '1px solid #e0e0e0' }}>
                                            <Stack direction="row" spacing={2}>
                                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>{note.created_by_name?.[0] || 'U'}</Avatar>
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>{note.created_by_name || 'System User'}</Typography>
                                                        <Typography variant="caption" color="textSecondary">{format(new Date(note.created_at), 'MMM dd')}</Typography>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ mt: 1, color: 'text.primary' }}>{note.content}</Typography>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    ))}
                                    {notes.length === 0 && (
                                        <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: '4px', border: '1px dashed #e0e0e0' }}>
                                            <NotesIcon sx={{ fontSize: 48, color: 'divider', mb: 2 }} />
                                            <Typography variant="body2" color="textSecondary">No internal notes for this mapping.</Typography>
                                        </Box>
                                    )}
                                </List>
                            </Box>
                        )}
					</>
				)}
			</Box>
		</Drawer>
	);
};

export default PlacementDetailDrawer;
