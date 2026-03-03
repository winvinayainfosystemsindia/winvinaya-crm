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
	ListItemText,
	ListItemIcon,
	Paper,
	Alert
} from '@mui/material';
import {
	Close as CloseIcon,
	Upload as UploadIcon,
	ErrorOutline as ErrorIcon,
	Description as FileIcon
} from '@mui/icons-material';
import type { ImportResult } from '../../models/dsr';

interface ExcelImportModalProps {
	open: boolean;
	onClose: () => void;
	onImport: (file: File) => Promise<ImportResult>;
	title: string;
	templateUrl?: string;
	description?: string;
}

const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
	open,
	onClose,
	onImport,
	title,
	templateUrl,
	description
}) => {
	const [file, setFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
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
		} catch (err: any) {
			console.error('Import failed:', err);
			setError(err.response?.data?.detail || 'Failed to import records from Excel.');
		} finally {
			setLoading(false);
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
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Typography variant="h6">{title}</Typography>
					<IconButton onClick={handleClose} size="small" disabled={loading}>
						<CloseIcon />
					</IconButton>
				</Box>
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
							accept=".xlsx, .xls"
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
							Supports .xlsx and .xls formats
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
			<DialogActions sx={{ p: 2 }}>
				{templateUrl && !result && (
					<Button
						href={templateUrl}
						target="_blank"
						startIcon={<FileIcon />}
						sx={{ mr: 'auto', textTransform: 'none' }}
					>
						Download Template
					</Button>
				)}
				<Button onClick={handleClose} disabled={loading} color="inherit">
					{result ? 'Close' : 'Cancel'}
				</Button>
				{!result && (
					<Button
						onClick={handleUpload}
						variant="contained"
						disabled={!file || loading}
						startIcon={<UploadIcon />}
						sx={{ bgcolor: '#232f3e', '&:hover': { bgcolor: '#1a242f' } }}
					>
						Upload & Import
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};

export default ExcelImportModal;
