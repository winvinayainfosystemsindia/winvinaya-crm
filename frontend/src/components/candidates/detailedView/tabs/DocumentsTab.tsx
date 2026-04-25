import React from 'react';
import { Paper, Grid, Typography, Chip, Box, Button, Stack } from '@mui/material';
import { Description as DescriptionIcon, UploadFile as UploadFileIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { SectionHeader, SectionCard } from '../DetailedViewCommon';
import type { Candidate } from '../../../../models/candidate';

interface DocumentsTabProps {
	candidate: Candidate;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ candidate }) => {
	const navigate = useNavigate();

	return (
		<SectionCard>
			<SectionHeader title="Candidate Documents">
				<Chip label={`${candidate.documents?.length || 0} Files`} size="small" variant="outlined" />
			</SectionHeader>
			{candidate.documents && candidate.documents.length > 0 ? (
				<Grid container spacing={2}>
					{candidate.documents.map((doc) => (
						<Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc.id}>
							<Paper variant="outlined" sx={{ p: 2, position: 'relative', '&:hover': { bgcolor: '#f8f9fa' } }}>
								<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
									<DescriptionIcon color="action" />
									<Box sx={{ minWidth: 0, flex: 1 }}>
										<Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>
											{doc.document_name}
										</Typography>
										<Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
											Type: {doc.document_type.replace('_', ' ')}
										</Typography>
										<Stack direction="row" spacing={0.5} sx={{ mt: 0.75 }}>
											<Chip
												label={doc.document_source === 'trainer' ? 'Trainer Prepared' : 'Candidate Original'}
												size="small"
												sx={{
													height: 18,
													fontSize: '0.6rem',
													textTransform: 'uppercase',
													fontWeight: 700,
													bgcolor: doc.document_source === 'trainer' ? '#ec7211' : '#007eb9',
													color: 'white'
												}}
											/>
											{doc.is_active && (
												<Chip
													label="Active"
													size="small"
													color="success"
													sx={{ height: 18, fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 700 }}
												/>
											)}
										</Stack>
										<Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
											{doc.file_size ? (doc.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown size'}
										</Typography>
									</Box>
									<Button
										size="small"
										variant="outlined"
										onClick={async () => {
											try {
												// Dynamic import to avoid circular dependencies if any, though here it's fine
												const { documentService } = await import('../../../../services/candidateService');
												const blob = await documentService.download(doc.id);
												const url = window.URL.createObjectURL(blob);
												window.open(url, '_blank');
												// Clean up the URL object after a delay to allow the new tab to load
												setTimeout(() => window.URL.revokeObjectURL(url), 1000);
											} catch (error) {
												console.error('Failed to view document:', error);
												alert('Failed to load document');
											}
										}}
										sx={{ textTransform: 'none', minWidth: 'auto', px: 2 }}
									>
										View
									</Button>
								</Box>
							</Paper>
						</Grid>
					))}
				</Grid>
			) : (
				<Box sx={{ textAlign: 'center', py: 5 }}>
					<UploadFileIcon sx={{ fontSize: 60, color: '#d5dbdb', mb: 2 }} />
					<Typography color="text.secondary">No documents have been collected yet.</Typography>
					<Button variant="outlined" sx={{ mt: 2, textTransform: 'none' }} onClick={() => navigate(`/candidates/documents/${candidate.public_id}`)}>
						Collect Documents
					</Button>
				</Box>
			)}
		</SectionCard>
	);
};

export default DocumentsTab;
