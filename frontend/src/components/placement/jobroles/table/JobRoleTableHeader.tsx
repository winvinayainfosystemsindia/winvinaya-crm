import React from 'react';
import { Box, Button, TextField, InputAdornment, Stack, Tooltip, Badge } from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import FilterDrawer, { type FilterField } from '../../../common/FilterDrawer';

interface JobRoleTableHeaderProps {
	searchTerm: string;
	onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onRefresh: () => void;
	loading: boolean;
	activeFilterCount: number;
	filterDrawerOpen: boolean;
	onFilterOpen: () => void;
	onFilterClose: () => void;
	filterFields: FilterField[];
	filters: Record<string, any>;
	onFilterChange: (key: string, value: any) => void;
	onClearFilters: () => void;
	onApplyFilters: () => void;
}

const JobRoleTableHeader: React.FC<JobRoleTableHeaderProps> = ({
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

	return (
		<Box sx={{
			p: 2,
			display: 'flex',
			flexDirection: { xs: 'column', sm: 'row' },
			justifyContent: 'space-between',
			alignItems: { xs: 'stretch', sm: 'center' },
			gap: 2,
			borderBottom: '1px solid',
			borderColor: 'divider',
			bgcolor: '#fafafa'
		}}>
			<Box sx={{ display: 'flex', flex: 1 }}>
				<TextField
					size="small"
					placeholder="Search job roles..."
					value={searchTerm}
					onChange={onSearchChange}
					fullWidth={true}
					sx={{
						maxWidth: { xs: '100%', sm: '300px' },
						'& .MuiOutlinedInput-root': {
							bgcolor: 'background.paper',
							'& fieldset': { borderColor: 'divider' },
							'&:hover fieldset': { borderColor: 'primary.main' }
						}
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
							</InputAdornment>
						)
					}}
				/>
			</Box>

			<Box sx={{
				display: 'flex',
				gap: 1.5,
				justifyContent: { xs: 'flex-start', sm: 'flex-end' },
				flexWrap: 'wrap'
			}}>
				<Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
					<Tooltip title="Refresh Data">
						<Button
							variant="outlined"
							startIcon={<RefreshIcon />}
							onClick={onRefresh}
							disabled={loading}
							sx={{
								textTransform: 'none',
								color: 'secondary.main',
								borderColor: 'divider',
								fontWeight: 600,
								flex: { xs: 1, sm: 'none' },
								'&:hover': {
									borderColor: 'secondary.main',
									bgcolor: 'action.hover'
								}
							}}
						>
							Refresh
						</Button>
					</Tooltip>

					<Badge badgeContent={activeFilterCount} color="primary">
						<Button
							variant="outlined"
							startIcon={<FilterIcon />}
							onClick={onFilterOpen}
							sx={{
								borderColor: 'divider',
								color: 'text.secondary',
								textTransform: 'none',
								fontWeight: 600,
								px: { xs: 1, sm: 2 },
								'&:hover': {
									borderColor: 'primary.main',
									color: 'primary.main',
									bgcolor: 'background.paper'
								}
							}}
						>
							Filter
						</Button>
					</Badge>
				</Stack>
			</Box>

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
	);
};

export default JobRoleTableHeader;
