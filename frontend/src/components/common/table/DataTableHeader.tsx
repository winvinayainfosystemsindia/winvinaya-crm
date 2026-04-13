import React, { memo } from 'react';
import {
	Box,
	TextField,
	Button,
	InputAdornment,
	Badge,
	useTheme,
	Tooltip
} from '@mui/material';
import { Search, FilterList, Refresh, Add } from '@mui/icons-material';

export interface DataTableHeaderProps {
	searchTerm: string;
	onSearchChange?: (value: string) => void;
	searchPlaceholder?: string;
	activeFilterCount?: number;
	onFilterOpen?: () => void;
	onRefresh?: () => void;
	onCreateClick?: () => void;
	createButtonText?: string;
	canCreate?: boolean;
	loading?: boolean;
	headerActions?: React.ReactNode;
}

const DataTableHeader: React.FC<DataTableHeaderProps> = memo(({
	searchTerm,
	onSearchChange,
	searchPlaceholder = 'Search...',
	activeFilterCount = 0,
	onFilterOpen,
	onRefresh,
	onCreateClick,
	createButtonText = 'Create',
	canCreate = false,
	loading = false,
	headerActions
}) => {
	const theme = useTheme();

	return (
		<Box sx={{
			p: 2,
			display: 'flex',
			flexDirection: { xs: 'column', sm: 'row' },
			justifyContent: 'space-between',
			alignItems: { xs: 'stretch', sm: 'center' },
			borderBottom: '1px solid #d5dbdb',
			bgcolor: '#fafafa',
			gap: 2
		}}>
			<Box sx={{ display: 'flex', flex: 1, gap: 2, alignItems: 'center' }}>
				{onSearchChange && (
					<TextField
						placeholder={searchPlaceholder}
						value={searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
						size="small"
						fullWidth
						sx={{
							maxWidth: { xs: '100%', sm: '350px' },
							'& .MuiOutlinedInput-root': {
								bgcolor: 'white',
								'& fieldset': { borderColor: '#d5dbdb' },
								'&:hover fieldset': { borderColor: theme.palette.primary.main },
							}
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Search sx={{ color: 'text.secondary', fontSize: 20 }} />
								</InputAdornment>
							),
						}}
					/>
				)}
				{headerActions}
			</Box>

			<Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
				<Box sx={{ display: 'flex', gap: 1 }}>
					{onRefresh && (
						<Tooltip title="Refresh data">
							<Button
								variant="outlined"
								startIcon={<Refresh />}
								onClick={onRefresh}
								disabled={loading}
								sx={{
									textTransform: 'none',
									color: '#232f3e',
									borderColor: '#d5dbdb',
									'&:hover': {
										borderColor: '#232f3e',
										bgcolor: '#f5f8fa'
									}
								}}
							>
								Refresh
							</Button>
						</Tooltip>
					)}

					{onFilterOpen && (
						<Badge badgeContent={activeFilterCount} color="primary">
							<Button
								variant="outlined"
								startIcon={<FilterList fontSize="small" />}
								onClick={onFilterOpen}
								sx={{
									textTransform: 'none',
									color: '#232f3e',
									borderColor: '#d5dbdb',
									'&:hover': {
										borderColor: '#232f3e',
										bgcolor: '#f5f8fa'
									}
								}}
							>
								Filters
							</Button>
						</Badge>
					)}
				</Box>

				{canCreate && onCreateClick && (
					<Button
						variant="contained"
						startIcon={<Add />}
						onClick={onCreateClick}
						sx={{
							bgcolor: '#ec7211',
							color: 'white',
							textTransform: 'none',
							fontWeight: 600,
							'&:hover': {
								bgcolor: '#eb5f07',
							}
						}}
					>
						{createButtonText}
					</Button>
				)}
			</Box>
		</Box>
	);
});

DataTableHeader.displayName = 'DataTableHeader';

export default DataTableHeader;
