import React, { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Box,
	Typography,
	IconButton,
	LinearProgress,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Paper,
	Alert,
	Fade
} from '@mui/material';
import {
	Close as CloseIcon,
	Upload as UploadIcon,
	ErrorOutline as ErrorIcon,
	Description as FileIcon,
	FilePresent as ExcelIcon
} from '@mui/icons-material';
import type { ImportResult } from '../../models/dsr';

interface ExcelImportModalProps {
	open: boolean;
	onClose: () => void;
	onImport: (file: File) => Promise<ImportResult>;
	title: string;
	onDownloadTemplate?: () => Promise<void>;
	description?: string;
	onSuccess?: () => void;
	accept?: string;
}

const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
	open,
	onClose,
	onImport,
	title,
	onDownloadTemplate,
	description,
	onSuccess,
	accept = ".xlsx, .xls"
}) => {
	const [file, setFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [downloading, setDownloading] = useState(false);
	const [result, setResult] = useState<ImportResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
			setError(null);
			setResult(null);
		}
	};

	const handleUpload = async () => {
		if (!file) return;

		setLoading(true);
		setError(null);
		try {
			const res = await onImport(file);
			setResult(res);
			if (onSuccess) onSuccess();
		} catch (err: any) {
			console.error('Import failed:', err);
			setError(err.response?.data?.detail || 'Failed to import records from Excel.');
		} finally {
			setLoading(false);
		}
	};

	const handleDownload = async () => {
		if (!onDownloadTemplate) return;
		setDownloading(true);
		try {
			await onDownloadTemplate();
		} catch (err) {
			console.error('Download failed:', err);
		} finally {
			setDownloading(false);
		}
	};

	const handleClose = () => {
		if (loading) return;
		setFile(null);
		setResult(null);
		setError(null);
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="sm"
			fullWidth
			TransitionComponent={Fade}
			TransitionProps={{ timeout: 400 }}
			PaperProps={{
				sx: {
					borderRadius: '4px',
					boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
				}
			}}
		>
			<DialogTitle sx={{
				bgcolor: '#232f3e',
				color: '#ffffff',
				py: 2,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between'
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<ExcelIcon />
					<Box>
						<Typography variant="h6" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
							{title}
						</Typography>
						<Typography variant="caption" sx={{ color: '#879196', display: 'block' }}>
							Bulk data ingestion from spreadsheet
						</Typography>
					</Box>
				</Box>
				<IconButton onClick={handleClose} size="small" disabled={loading} sx={{ color: '#ffffff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
					<CloseIcon fontSize="small" />
				</IconButton>
			</DialogTitle>
			<DialogContent dividers>
				{description && (
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						{description}
					</Typography>
				)}

				{!result ? (
					<Box
						sx={{
							border: '2px dashed #d5dbdb',
							borderRadius: 1,
							p: 4,
							textAlign: 'center',
							bgcolor: '#f9f9f9',
							position: 'relative'
						}}
					>
						<input
							type="file"
							accept={accept}
							onChange={handleFileChange}
							style={{
								opacity: 0,
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: '100%',
								cursor: 'pointer'
							}}
						/>
						<UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
						<Typography variant="subtitle1" fontWeight={700}>
							{file ? file.name : 'Click or drag to upload Excel file'}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Supports {accept.split(',').join(' and ')} formats
						</Typography>
					</Box>
				) : (
					<Box sx={{ py: 1 }}>
						<Alert severity={result.errors.length > 0 ? 'warning' : 'success'} sx={{ mb: 2 }}>
							Import Processed: {result.created} created, {result.skipped} skipped.
						</Alert>

						{result.errors.length > 0 && (
							<>
								<Typography variant="subtitle2" color="error" gutterBottom>
									Errors ({result.errors.length}):
								</Typography>
								<Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto', p: 1, bgcolor: '#fff0f0' }}>
									<List dense>
										{result.errors.map((err: any, idx: number) => (
											<ListItem key={idx}>
												<ListItemIcon sx={{ minWidth: 30 }}>
													<ErrorIcon color="error" fontSize="small" />
												</ListItemIcon>
												<ListItemText
													primary={`Row ${err.row}`}
													secondary={err.error}
													primaryTypographyProps={{ fontWeight: 700 }}
												/>
											</ListItem>
										))}
									</List>
								</Paper>
							</>
						)}
					</Box>
				)}

				{error && (
					<Alert severity="error" sx={{ mt: 2 }}>
						{error}
					</Alert>
				)}

				{loading && (
					<Box sx={{ width: '100%', mt: 2 }}>
						<LinearProgress />
					</Box>
				)}
			</DialogContent>
			<DialogActions sx={{ p: 3, bgcolor: '#ffffff', borderTop: '1px solid #eaeded' }}>
				{onDownloadTemplate && !result && (
					<Button
						onClick={handleDownload}
						disabled={downloading}
						startIcon={<FileIcon />}
						sx={{
							mr: 'auto',
							textTransform: 'none',
							color: '#0073bb',
							fontWeight: 700,
							'&:hover': { bgcolor: '#f5f8fa' }
						}}
					>
						{downloading ? 'Downloading...' : 'Download Template'}
					</Button>
				)}
				<Button
					onClick={handleClose}
					disabled={loading}
					sx={{
						color: '#545b64',
						textTransform: 'none',
						fontWeight: 700,
						'&:hover': { bgcolor: '#eaeded' }
					}}
				>
					{result ? 'Dismiss' : 'Cancel'}
				</Button>
				{!result && (
					<Button
						onClick={handleUpload}
						variant="contained"
						disabled={!file || loading}
						startIcon={<UploadIcon />}
						sx={{
							bgcolor: '#ec7211',
							color: '#ffffff',
							textTransform: 'none',
							fontWeight: 700,
							px: 4,
							py: 1,
							borderRadius: '2px',
							boxShadow: 'none',
							'&:hover': { bgcolor: '#eb5f07', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
							'&.Mui-disabled': { bgcolor: '#f2f3f3', color: '#959ba1' }
						}}
					>
						{loading ? 'Uploading...' : 'Upload & Import'}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};

export default ExcelImportModal;
