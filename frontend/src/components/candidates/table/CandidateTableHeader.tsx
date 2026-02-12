import React from 'react';
import {
	Box,
	TextField,
	Button,
	IconButton,
	InputAdornment,
	Tooltip,
	Badge,
	useTheme
} from '@mui/material';
import { Search, FilterList, Refresh } from '@mui/icons-material';
import FilterDrawer, { type FilterField } from '../../common/FilterDrawer';

interface CandidateTableHeaderProps {
	searchTerm: string;
	onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onRefresh: () => void;
	loading: boolean;
	activeFilterCount: number;
	filterDrawerOpen: boolean;
	onFilterOpen: () => void;
	onFilterClose: () => void;
	filterFields: FilterField[];
	filters: any;
	onFilterChange: (key: string, value: unknown) => void;
	onClearFilters: () => void;
	onApplyFilters: () => void;
}

const CandidateTableHeader: React.FC<CandidateTableHeaderProps> = ({
	searchTerm,
	onSearchChange,
	onRefresh,
	loading,
	activeFilterCount,
	filterDrawerOpen,
	onFilterOpen,
	onFilterClose,
	filterFields,
	filters,
	onFilterChange,
	onClearFilters,
	onApplyFilters
}) => {
	const theme = useTheme();

	return (
		<Box sx={{
			p: 2,
			display: 'flex',
			flexDirection: { xs: 'column', sm: 'row' },
			justifyContent: 'space-between',
			alignItems: { xs: 'stretch', sm: 'center' },
			gap: 2,
			borderBottom: '1px solid #d5dbdb',
			bgcolor: '#fafafa'
		}}>
			<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
				<TextField
					placeholder="Search candidates..."
					value={searchTerm}
					onChange={onSearchChange}
					size="small"
					fullWidth={true}
					sx={{
						maxWidth: { xs: '100%', sm: '300px' },
						'& .MuiOutlinedInput-root': {
							bgcolor: 'white',
							'& fieldset': {
								borderColor: '#d5dbdb',
							},
							'&:hover fieldset': {
								borderColor: theme.palette.primary.main,
							},
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
			</Box>

			<Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
				<Box sx={{ display: 'flex', gap: 1 }}>
					<Tooltip title="Refresh Data">
						<IconButton
							onClick={onRefresh}
							disabled={loading}
							sx={{
								border: '1px solid #d5dbdb',
								borderRadius: 1,
								color: 'text.secondary',
								'&:hover': {
									borderColor: theme.palette.primary.main,
									color: theme.palette.primary.main,
									bgcolor: 'white'
								}
							}}
						>
							<Refresh fontSize="small" className={loading ? 'spin-animation' : ''} />
						</IconButton>
					</Tooltip>

					<Badge badgeContent={activeFilterCount} color="primary">
						<Button
							variant="outlined"
							startIcon={<FilterList />}
							onClick={onFilterOpen}
							sx={{
								borderColor: '#d5dbdb',
								color: 'text.secondary',
								textTransform: 'none',
								px: { xs: 1, sm: 2 },
								'&:hover': {
									borderColor: theme.palette.primary.main,
									color: theme.palette.primary.main,
									bgcolor: 'white'
								}
							}}
						>
							Filter
						</Button>
					</Badge>
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

				<FilterDrawer
					open={filterDrawerOpen}
					onClose={onFilterClose}
					fields={filterFields}
					activeFilters={filters}
					onFilterChange={onFilterChange}
					onClearFilters={onClearFilters}
					onApplyFilters={onApplyFilters}
				/>
			</Box>
		</Box>
	);
};

export default CandidateTableHeader;
