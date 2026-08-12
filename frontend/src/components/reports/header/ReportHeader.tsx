import React from 'react';
import {
	Box,
	Typography,
	Button,
	useTheme,
	useMediaQuery
} from '@mui/material';
import { Refresh as RefreshIcon, FileDownload as ExportIcon } from '@mui/icons-material';

interface ReportHeaderProps {
	onRefresh: () => void;
	onExport: () => void;
	loading: boolean;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({
	onRefresh,
	onExport,
	loading
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
					Reports
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Configure columns and filters to build your custom report across all modules.
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
				<Box sx={{ display: 'flex', gap: 2, width: isMobile ? '100%' : 'auto' }}>
					<Button
						variant="outlined"
						startIcon={<RefreshIcon className={loading ? 'spin-animation' : ''} aria-hidden="true" />}
						onClick={onRefresh}
						disabled={loading}
						size="small"
						aria-label={loading ? "Refreshing data" : "Refresh report data"}
						sx={{
							height: 36,
							flex: isMobile ? 1 : 'none',
							borderColor: theme.palette.divider,
							color: theme.palette.text.primary,
							textTransform: 'none',
							fontWeight: 600,
							fontSize: theme.typography.body2.fontSize,
							whiteSpace: 'nowrap',
							'&:hover': {
								borderColor: theme.palette.primary.light,
								backgroundColor: theme.palette.action.hover
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
							height: 36,
							flex: isMobile ? 1 : 'none',
							textTransform: 'none',
							fontWeight: 700,
							fontSize: theme.typography.body2.fontSize,
							whiteSpace: 'nowrap',
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
