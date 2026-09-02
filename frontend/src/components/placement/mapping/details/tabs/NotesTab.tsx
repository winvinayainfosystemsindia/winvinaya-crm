import React, { useState, useRef } from 'react';
import { 
	Box, 
	Typography, 
	Stack, 
	Button, 
	useTheme, 
	Paper, 
	TextField, 
	Avatar, 
	IconButton, 
	Chip, 
	Dialog, 
	DialogContent, 
	DialogActions,
	CircularProgress,
	Tooltip
} from '@mui/material';
import {
	Notes as NotesIcon,
	Send as SendIcon,
	AttachFile as AttachFileIcon,
	Close as CloseIcon,
	Image as ImageIcon,
	PictureAsPdf as PdfIcon,
	Description as DocIcon,
	InsertDriveFile as FileIcon,
	Download as DownloadIcon,
	ZoomIn as ZoomInIcon
} from '@mui/icons-material';
import { formatDateIST, formatTimeIST } from '../drawerUtils';
import placementMappingService from '../../../../../services/placementMappingService';

interface AttachmentItem {
	file_name: string;
	saved_name?: string;
	file_path?: string;
	file_size?: number;
	mime_type?: string;
}

interface NoteItem {
	id: number;
	mapping_id: number;
	content: string;
	note_type?: string;
	is_pinned?: boolean;
	created_at: string;
	created_by_name?: string;
	attachments?: AttachmentItem[];
}

interface NotesTabProps {
	notes: NoteItem[];
	onAddNote: (content: string, files?: File[]) => Promise<void>;
	isAdding: boolean;
}

const formatFileSize = (bytes?: number): string => {
	if (!bytes || bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const isImageFile = (filename: string, mimeType?: string): boolean => {
	if (mimeType && mimeType.startsWith('image/')) return true;
	const lower = filename.toLowerCase();
	return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') || lower.endsWith('.gif') || lower.endsWith('.svg');
};

const isPdfFile = (filename: string, mimeType?: string): boolean => {
	if (mimeType === 'application/pdf') return true;
	return filename.toLowerCase().endsWith('.pdf');
};

const getFileIcon = (filename: string, mimeType?: string) => {
	if (isImageFile(filename, mimeType)) return <ImageIcon fontSize="small" color="primary" />;
	if (isPdfFile(filename, mimeType)) return <PdfIcon fontSize="small" color="error" />;
	if (filename.toLowerCase().endsWith('.doc') || filename.toLowerCase().endsWith('.docx')) {
		return <DocIcon fontSize="small" color="info" />;
	}
	return <FileIcon fontSize="small" color="action" />;
};

const NotesTab: React.FC<NotesTabProps> = ({ 
	notes, 
	onAddNote, 
	isAdding 
}) => {
	const theme = useTheme();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [newNote, setNewNote] = useState('');
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

	// Lightbox Modal for Image Preview
	const [previewModalOpen, setPreviewModalOpen] = useState(false);
	const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
	const [previewTitle, setPreviewTitle] = useState<string>('');
	const [previewLoading, setPreviewLoading] = useState(false);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const filesArr = Array.from(e.target.files);
			setSelectedFiles(prev => [...prev, ...filesArr]);
		}
		// Reset input value so same file can be re-selected if removed
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleRemoveFile = (index: number) => {
		setSelectedFiles(prev => prev.filter((_, i) => i !== index));
	};

	const handleCommit = async () => {
		if (!newNote.trim() && selectedFiles.length === 0) return;
		try {
			await onAddNote(newNote.trim(), selectedFiles);
			setNewNote('');
			setSelectedFiles([]);
		} catch (error) {
			// Error handled by parent
		}
	};

	const handleDownloadOrViewAttachment = async (noteId: number, attachment: AttachmentItem, openInViewer = false) => {
		const fileName = attachment.file_name;
		const fileKey = `${noteId}-${fileName}`;
		
		if (openInViewer && isImageFile(fileName, attachment.mime_type)) {
			setPreviewTitle(fileName);
			setPreviewModalOpen(true);
			setPreviewLoading(true);
			try {
				const blob = await placementMappingService.downloadNoteAttachment(noteId, fileName);
				const objectUrl = URL.createObjectURL(blob);
				setPreviewImageUrl(objectUrl);
			} catch (err) {
				console.error("Failed to load image preview:", err);
			} finally {
				setPreviewLoading(false);
			}
			return;
		}

		try {
			setDownloadingFile(fileKey);
			const blob = await placementMappingService.downloadNoteAttachment(noteId, fileName);
			const objectUrl = URL.createObjectURL(blob);
			
			if (isImageFile(fileName, attachment.mime_type) || isPdfFile(fileName, attachment.mime_type)) {
				window.open(objectUrl, '_blank');
			} else {
				const link = document.createElement('a');
				link.href = objectUrl;
				link.download = fileName;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
			setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
		} catch (err) {
			console.error("Failed to download attachment:", err);
		} finally {
			setDownloadingFile(null);
		}
	};

	const handleClosePreviewModal = () => {
		setPreviewModalOpen(false);
		if (previewImageUrl) {
			URL.revokeObjectURL(previewImageUrl);
			setPreviewImageUrl(null);
		}
	};

	return (
		<Box>
			{/* New Note Form */}
			<Box sx={{ mb: 4 }}>
				<Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
					Add Private Observation
				</Typography>
				<TextField
					multiline
					rows={3}
					fullWidth
					placeholder="Only visible to internal recruitment team..."
					value={newNote}
					onChange={(e) => setNewNote(e.target.value)}
					sx={{
						bgcolor: theme.palette.background.paper,
						'& .MuiOutlinedInput-root': { borderRadius: '6px' }
					}}
				/>

				{/* Selected Files Preview */}
				{selectedFiles.length > 0 && (
					<Box sx={{ mt: 1.5, p: 1.5, bgcolor: theme.palette.action.hover, borderRadius: '6px', border: `1px dashed ${theme.palette.divider}` }}>
						<Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary, display: 'block', mb: 1 }}>
							Attached Files ({selectedFiles.length}):
						</Typography>
						<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
							{selectedFiles.map((file, idx) => (
								<Chip
									key={idx}
									icon={getFileIcon(file.name, file.type)}
									label={`${file.name} (${formatFileSize(file.size)})`}
									onDelete={() => handleRemoveFile(idx)}
									size="small"
									sx={{ 
										bgcolor: theme.palette.background.paper,
										fontWeight: 600,
										maxWidth: 240
									}}
								/>
							))}
						</Stack>
					</Box>
				)}

				{/* Form Actions */}
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
					<Box>
						<input
							type="file"
							ref={fileInputRef}
							onChange={handleFileSelect}
							multiple
							accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.txt,.xls,.xlsx,.zip,image/*"
							style={{ display: 'none' }}
							id="note-file-upload-input"
						/>
						<label htmlFor="note-file-upload-input">
							<Button
								variant="outlined"
								size="small"
								component="span"
								startIcon={<AttachFileIcon sx={{ fontSize: 16 }} />}
								sx={{
									textTransform: 'none',
									fontWeight: 700,
									fontSize: '0.8125rem',
									borderRadius: '6px',
									color: theme.palette.text.secondary,
									borderColor: theme.palette.divider,
									'&:hover': {
										borderColor: theme.palette.primary.main,
										bgcolor: theme.palette.action.hover
									}
								}}
							>
								Attach Files (Images / Docs)
							</Button>
						</label>
					</Box>

					<Button
						variant="contained"
						size="small"
						endIcon={<SendIcon sx={{ fontSize: 14 }} />}
						onClick={handleCommit}
						disabled={(!newNote.trim() && selectedFiles.length === 0) || isAdding}
						sx={{
							textTransform: 'none',
							bgcolor: theme.palette.accent.main,
							fontWeight: 700,
							borderRadius: '6px',
							px: 3,
							'&:hover': { bgcolor: theme.palette.accent.dark }
						}}
					>
						{isAdding ? 'Posting...' : 'Commit Note'}
					</Button>
				</Box>
			</Box>

			{/* Note History */}
			<Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 2 }}>
				Note History
			</Typography>
			
			<Stack spacing={2}>
				{notes.map((note) => {
					const attachments = note.attachments || [];
					const imageAttachments = attachments.filter(att => isImageFile(att.file_name, att.mime_type));
					const docAttachments = attachments.filter(att => !isImageFile(att.file_name, att.mime_type));

					return (
						<Paper
							key={note.id}
							elevation={0}
							sx={{
								p: 2.5,
								border: `1px solid ${theme.palette.divider}`,
								bgcolor: theme.palette.background.paper,
								borderRadius: '8px'
							}}
						>
							<Box sx={{ display: 'flex', gap: 2 }}>
								<Avatar sx={{ 
									width: 34, 
									height: 34, 
									fontSize: '0.8125rem', 
									bgcolor: theme.palette.secondary.light, 
									fontWeight: 700 
								}}>
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
									
									{note.content && (
										<Typography variant="body2" sx={{ color: theme.palette.text.primary, fontSize: '0.875rem', lineHeight: 1.6, mb: attachments.length > 0 ? 1.5 : 0 }}>
											{note.content}
										</Typography>
									)}

									{/* Image Attachments Gallery */}
									{imageAttachments.length > 0 && (
										<Box sx={{ mt: 1.5, mb: docAttachments.length > 0 ? 1.5 : 0 }}>
											<Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary, mb: 0.8, display: 'block' }}>
												Images ({imageAttachments.length}):
											</Typography>
											<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
												{imageAttachments.map((img, idx) => {
													const fileKey = `${note.id}-${img.file_name}`;
													const isDownloading = downloadingFile === fileKey;

													return (
														<Box
															key={idx}
															sx={{
																display: 'flex',
																alignItems: 'center',
																gap: 1,
																p: 1,
																borderRadius: '6px',
																border: `1px solid ${theme.palette.divider}`,
																bgcolor: theme.palette.background.default,
																cursor: 'pointer',
																transition: 'all 0.2s',
																'&:hover': {
																	borderColor: theme.palette.primary.main,
																	bgcolor: theme.palette.action.hover
																}
															}}
															onClick={() => handleDownloadOrViewAttachment(note.id, img, true)}
														>
															<ImageIcon color="primary" fontSize="small" />
															<Box sx={{ maxWidth: 180, overflow: 'hidden' }}>
																<Typography variant="caption" noWrap sx={{ fontWeight: 700, display: 'block', color: theme.palette.text.primary }}>
																	{img.file_name}
																</Typography>
																<Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
																	{formatFileSize(img.file_size)}
																</Typography>
															</Box>
															{isDownloading ? (
																<CircularProgress size={16} />
															) : (
																<Tooltip title="Preview / Open image">
																	<IconButton size="small" sx={{ p: 0.5 }}>
																		<ZoomInIcon fontSize="small" />
																	</IconButton>
																</Tooltip>
															)}
														</Box>
													);
												})}
											</Box>
										</Box>
									)}

									{/* Document Attachments */}
									{docAttachments.length > 0 && (
										<Box sx={{ mt: 1.5 }}>
											<Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary, mb: 0.8, display: 'block' }}>
												Documents ({docAttachments.length}):
											</Typography>
											<Stack spacing={1}>
												{docAttachments.map((doc, idx) => {
													const fileKey = `${note.id}-${doc.file_name}`;
													const isDownloading = downloadingFile === fileKey;

													return (
														<Box
															key={idx}
															sx={{
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'space-between',
																p: 1,
																px: 1.5,
																borderRadius: '6px',
																border: `1px solid ${theme.palette.divider}`,
																bgcolor: theme.palette.background.default,
																transition: 'all 0.2s',
																'&:hover': {
																	borderColor: theme.palette.primary.main,
																	bgcolor: theme.palette.action.hover
																}
															}}
														>
															<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
																{getFileIcon(doc.file_name, doc.mime_type)}
																<Box sx={{ minWidth: 0 }}>
																	<Typography variant="caption" noWrap sx={{ fontWeight: 700, display: 'block', color: theme.palette.text.primary }}>
																		{doc.file_name}
																	</Typography>
																	<Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
																		{formatFileSize(doc.file_size)}
																	</Typography>
																</Box>
															</Box>

															<Button
																size="small"
																variant="text"
																startIcon={isDownloading ? <CircularProgress size={14} /> : <DownloadIcon sx={{ fontSize: 16 }} />}
																onClick={() => handleDownloadOrViewAttachment(note.id, doc, false)}
																disabled={isDownloading}
																sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', minWidth: 'auto' }}
															>
																{isDownloading ? 'Loading...' : 'Download'}
															</Button>
														</Box>
													);
												})}
											</Stack>
										</Box>
									)}
								</Box>
							</Box>
						</Paper>
					);
				})}
			</Stack>
			
			{notes.length === 0 && (
				<Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
					<NotesIcon sx={{ fontSize: 40, mb: 1.5, color: theme.palette.divider }} />
					<Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.secondary }}>
						No internal notes captured yet.
					</Typography>
				</Box>
			)}

			{/* Lightbox Image Preview Dialog */}
			<Dialog
				open={previewModalOpen}
				onClose={handleClosePreviewModal}
				maxWidth="md"
				fullWidth
				PaperProps={{
					sx: { borderRadius: '10px', overflow: 'hidden' }
				}}
			>
				<Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
					<Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
						{previewTitle}
					</Typography>
					<IconButton size="small" onClick={handleClosePreviewModal}>
						<CloseIcon />
					</IconButton>
				</Box>

				<DialogContent sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, bgcolor: theme.palette.background.default }}>
					{previewLoading ? (
						<CircularProgress />
					) : previewImageUrl ? (
						<Box
							component="img"
							src={previewImageUrl}
							alt={previewTitle}
							sx={{
								maxWidth: '100%',
								maxHeight: '65vh',
								objectFit: 'contain',
								borderRadius: '4px',
								boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
							}}
						/>
					) : (
						<Typography variant="body2" color="error">
							Failed to load image preview.
						</Typography>
					)}
				</DialogContent>

				<DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
					{previewImageUrl && (
						<Button
							variant="contained"
							size="small"
							startIcon={<DownloadIcon />}
							component="a"
							href={previewImageUrl}
							download={previewTitle}
							sx={{ textTransform: 'none', fontWeight: 700 }}
						>
							Download Image
						</Button>
					)}
					<Button onClick={handleClosePreviewModal} sx={{ textTransform: 'none', fontWeight: 600 }}>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default NotesTab;
