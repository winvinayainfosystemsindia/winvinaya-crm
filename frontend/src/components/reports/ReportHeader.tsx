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
		<Box sx={{
			display: 'flex',
			flexDirection: isMobile ? 'column' : 'row',
			justifyContent: 'space-between',
			alignItems: isMobile ? 'flex-start' : 'center',
			mb: 3,
			gap: isMobile ? 2 : 0
		}}>
			<Box component="header" role="banner">
				<Typography
					variant={isMobile ? "h5" : "h4"}
					component="h1"
					sx={{
						fontWeight: 300,
						color: 'text.primary',
						mb: 0.5
					}}
				>
					{reportType === 'candidate' ? 'Candidates Report' : 'Training Management Report'}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{reportType === 'candidate'
						? 'Generate and customize candidate data reports for export.'
						: 'Track candidate progress and allocations across training batches.'}
				</Typography>
			</Box>
			<Box
				sx={{
					display: 'flex',
					flexDirection: isMobile ? 'column' : 'row',
					gap: 2,
					alignItems: isMobile ? 'stretch' : 'center',
					width: isMobile ? '100%' : 'auto'
				}}
				role="toolbar"
				aria-label="Report Actions"
			>
				<FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 180 }}>
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
						inputProps={{
							'aria-label': 'Select report type'
						}}
					>
						<MenuItem value="candidate" sx={{ fontSize: '0.85rem' }}>Candidate Report</MenuItem>
						<MenuItem value="training" sx={{ fontSize: '0.85rem' }}>Training Management Report</MenuItem>
					</Select>
				</FormControl>

				<Box sx={{ display: 'flex', gap: 2, width: isMobile ? '100%' : 'auto' }}>
					<Button
						variant="outlined"
						startIcon={<RefreshIcon className={loading ? 'spin-animation' : ''} aria-hidden="true" />}
						onClick={onRefresh}
						disabled={loading}
						size="small"
						aria-label={loading ? "Refreshing data" : "Refresh report data"}
						sx={{
							height: 32,
							flex: isMobile ? 1 : 'none',
							borderColor: '#d5dbdb',
							color: '#545b64',
							textTransform: 'none',
							fontWeight: 700,
							whiteSpace: 'nowrap',
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
						startIcon={<ExportIcon aria-hidden="true" />}
						onClick={onExport}
						size="small"
						aria-label="Export report to Excel"
						sx={{
							height: 32,
							flex: isMobile ? 1 : 'none',
							backgroundColor: '#ec7211',
							color: '#fff',
							textTransform: 'none',
							fontWeight: 700,
							whiteSpace: 'nowrap',
							'&:hover': {
								backgroundColor: '#eb5f07'
							},
							boxShadow: 'none'
						}}
					>
						Export Report
					</Button>
				</Box>
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
