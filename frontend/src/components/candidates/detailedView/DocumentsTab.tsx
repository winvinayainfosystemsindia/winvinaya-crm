import React from 'react';
import { Paper, Grid, Typography, Chip, Box, Button } from '@mui/material';
import { Description as DescriptionIcon, UploadFile as UploadFileIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from './DetailedViewCommon';
import type { Candidate } from '../../../models/candidate';

interface DocumentsTabProps {
	candidate: Candidate;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ candidate }) => {
	const navigate = useNavigate();

	return (
		<Paper variant="outlined" sx={{ p: 3, borderRadius: 0, border: '1px solid #d5dbdb' }}>
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
									<Box sx={{ minWidth: 0 }}>
										<Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>
											{doc.document_name}
										</Typography>
										<Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
											Type: {doc.document_type.replace('_', ' ')}
										</Typography>
										<Typography variant="caption" color="text.secondary">
											{doc.file_size ? (doc.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown size'}
										</Typography>
									</Box>
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
		</Paper>
	);
};

export default DocumentsTab;
