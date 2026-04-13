import React, { useState, useRef } from 'react';
import { 
	Button, 
	Typography, 
	Box, 
	alpha, 
	useTheme, 
	LinearProgress,
	Link,
	Paper
} from '@mui/material';
import { 
	CloudUploadRounded, 
	DescriptionRounded,
	Close as CloseIcon,
	DownloadRounded
} from '@mui/icons-material';
import BaseDialog from './BaseDialog';
import type { ImportDialogProps } from './types';

const ImportDialog: React.FC<ImportDialogProps> = ({
	open,
	onClose,
	onImport,
	title = 'Import Records',
	subtitle = 'Upload your structured data file to synchronize with the core database',
	acceptedFiles = '.csv,.xlsx,.xls',
	templateUrl,
	loading = false,
	maxWidth = 'sm'
}) => {
	const theme = useTheme();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [dragActive, setDragActive] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			setSelectedFile(e.dataTransfer.files[0]);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setSelectedFile(e.target.files[0]);
		}
	};

	const handleConfirmImport = async () => {
		if (selectedFile) {
			await onImport(selectedFile);
			setSelectedFile(null);
		}
	};

	const actions = (
		<Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
			{templateUrl ? (
				<Link 
					href={templateUrl} 
					download
					sx={{ 
						display: 'flex', 
						alignItems: 'center', 
						gap: 1, 
						fontSize: '0.8125rem',
						color: 'primary.main',
						textDecoration: 'none',
						fontWeight: 600,
						'&:hover': { textDecoration: 'underline' }
					}}
				>
					<DownloadRounded sx={{ fontSize: 18 }} />
					Download Template
				</Link>
			) : <Box />}
			<Box sx={{ display: 'flex', gap: 1.5 }}>
				<Button 
					onClick={onClose} 
					disabled={loading}
					sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
				>
					Cancel
				</Button>
				<Button
					variant="contained"
					disabled={!selectedFile || loading}
					onClick={handleConfirmImport}
					sx={{
						bgcolor: 'accent.main',
						color: 'white',
						textTransform: 'none',
						fontWeight: 700,
						px: 4,
						'&:hover': { bgcolor: 'accent.dark' }
					}}
				>
					{loading ? 'Processing...' : 'Begin Ingestion'}
				</Button>
			</Box>
		</Box>
	);

	return (
		<BaseDialog
			open={open}
			onClose={onClose}
			title={title}
			subtitle={subtitle}
			maxWidth={maxWidth}
			loading={loading}
			actions={actions}
		>
			<Box sx={{ position: 'relative' }}>
				<Paper
					variant="outlined"
					onDragEnter={handleDrag}
					onDragLeave={handleDrag}
					onDragOver={handleDrag}
					onDrop={handleDrop}
					onClick={() => fileInputRef.current?.click()}
					sx={{
						py: 6,
						px: 2,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
						transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
						bgcolor: dragActive ? alpha(theme.palette.primary.main, 0.03) : alpha(theme.palette.background.default, 0.2),
						borderStyle: 'dashed',
						borderWidth: 2,
						borderColor: dragActive ? 'primary.main' : alpha(theme.palette.divider, 0.8),
						'&:hover': {
							borderColor: 'primary.main',
							bgcolor: alpha(theme.palette.primary.main, 0.02)
						}
					}}
				>
					<input
						ref={fileInputRef}
						type="file"
						accept={acceptedFiles}
						style={{ display: 'none' }}
						onChange={handleFileSelect}
					/>

					{selectedFile ? (
						<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
							<DescriptionRounded sx={{ fontSize: 48, color: 'primary.main' }} />
							<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
								{selectedFile.name}
							</Typography>
							<Typography variant="caption" sx={{ color: 'text.secondary' }}>
								{(selectedFile.size / 1024).toFixed(1)} KB
							</Typography>
							<Button 
								size="small" 
								color="error" 
								onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
								sx={{ mt: 1, textTransform: 'none' }}
								startIcon={<CloseIcon fontSize="small" />}
							>
								Remove
							</Button>
						</Box>
					) : (
						<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
							<Box sx={{ 
								p: 1.5, 
								borderRadius: '12px', 
								bgcolor: alpha(theme.palette.primary.main, 0.08),
								color: 'primary.main'
							}}>
								<CloudUploadRounded sx={{ fontSize: 32 }} />
							</Box>
							<Box sx={{ textAlign: 'center' }}>
								<Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
									Click or drag file to this area to upload
								</Typography>
								<Typography variant="caption" color="text.secondary">
									Supported formats: {acceptedFiles} (Max 10MB)
								</Typography>
							</Box>
						</Box>
					)}
				</Paper>

				{loading && (
					<Box sx={{ mt: 3 }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
								Ingesting data stream...
							</Typography>
							<Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
								75%
							</Typography>
						</Box>
						<LinearProgress 
							variant="determinate" 
							value={75} 
							sx={{ 
								height: 6, 
								borderRadius: 3,
								bgcolor: alpha(theme.palette.primary.main, 0.1),
								'& .MuiLinearProgress-bar': { borderRadius: 3 }
							}} 
						/>
					</Box>
				)}
			</Box>
		</BaseDialog>
	);
};

export default ImportDialog;
