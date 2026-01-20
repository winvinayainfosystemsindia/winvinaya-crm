import React from 'react';
import {
	Box,
	Typography,
	Button,
	useTheme,
	useMediaQuery,
	FormControl,
	Select,
	MenuItem,
	InputLabel
} from '@mui/material';
import { Refresh as RefreshIcon, FileDownload as ExportIcon } from '@mui/icons-material';

interface ReportHeaderProps {
	onRefresh: () => void;
	onExport: () => void;
	loading: boolean;
	reportType: string;
	onReportTypeChange: (type: string) => void;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({
	onRefresh,
	onExport,
	loading,
	reportType,
	onReportTypeChange
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	return (
		<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
			<Box>
				<Typography
					variant={isMobile ? "h5" : "h4"}
					component="h1"
					sx={{
						fontWeight: 300,
						color: 'text.primary',
						mb: 0.5
					}}
				>
					Candidates Report
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Generate and customize candidate data reports for export.
				</Typography>
			</Box>
			<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
				<FormControl size="small" sx={{ minWidth: 180 }}>
					<InputLabel id="report-type-label">Report Type</InputLabel>
					<Select
						labelId="report-type-label"
						value={reportType}
						label="Report Type"
						onChange={(e) => onReportTypeChange(e.target.value)}
						sx={{
							height: 32,
							fontSize: '0.85rem',
							borderRadius: '2px',
							'& .MuiOutlinedInput-notchedOutline': { borderColor: '#d5dbdb' }
						}}
					>
						<MenuItem value="candidate" sx={{ fontSize: '0.85rem' }}>Candidate Report</MenuItem>
						<MenuItem value="screening" disabled sx={{ fontSize: '0.85rem' }}>Screening Report</MenuItem>
						<MenuItem value="counseling" disabled sx={{ fontSize: '0.85rem' }}>Counseling Report</MenuItem>
					</Select>
				</FormControl>

				<Button
					variant="outlined"
					startIcon={<RefreshIcon className={loading ? 'spin-animation' : ''} />}
					onClick={onRefresh}
					disabled={loading}
					size="small"
					sx={{
						height: 32,
						borderColor: '#d5dbdb',
						color: '#545b64',
						textTransform: 'none',
						fontWeight: 700,
						'&:hover': {
							borderColor: '#aab7b7',
							backgroundColor: '#f2f3f3'
						},
						'&.Mui-disabled': {
							color: '#aab7b7',
							borderColor: '#eaeded'
						}
					}}
				>
					Refresh
				</Button>
				<Button
					variant="contained"
					startIcon={<ExportIcon />}
					onClick={onExport}
					size="small"
					sx={{
						height: 32,
						backgroundColor: '#ec7211',
						color: '#fff',
						textTransform: 'none',
						fontWeight: 700,
						'&:hover': {
							backgroundColor: '#eb5f07'
						},
						boxShadow: 'none'
					}}
				>
					Export Report
				</Button>
				<style>
					{`
						@keyframes spin {
							from { transform: rotate(0deg); }
							to { transform: rotate(360deg); }
						}
						.spin-animation {
							animation: spin 1s linear infinite;
						}
					`}
				</style>
			</Box>
		</Box>
	);
};

export default ReportHeader;
