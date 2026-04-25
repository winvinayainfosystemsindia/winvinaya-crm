import React, { memo } from 'react';
import {
	Box,
	TextField,
	Button,
	InputAdornment,
	useTheme
} from '@mui/material';
import { Search, FilterList, Refresh } from '@mui/icons-material';

interface ScreeningTableHeaderProps {
	type: 'unscreened' | 'screened';
	searchTerm: string;
	onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	activeFilterCount: number;
	onFilterOpen: () => void;
	onRefresh: () => void;
}

const ScreeningTableHeader: React.FC<ScreeningTableHeaderProps> = memo(({
	type,
	searchTerm,
	onSearchChange,
	activeFilterCount,
	onFilterOpen,
	onRefresh
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
			bgcolor: '#fafafa'
		}}>
			<TextField
				placeholder={`Search ${type === 'unscreened' ? 'unscreened' : 'screened'} candidates...`}
				value={searchTerm}
				onChange={onSearchChange}
				size="small"
				fullWidth={true}
				sx={{
					maxWidth: { xs: '100%', sm: '350px' },
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
			<Box sx={{ display: 'flex', gap: 1, mt: { xs: 1, sm: 0 } }}>
				<Button
					variant="outlined"
					startIcon={<Refresh />}
					onClick={onRefresh}
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
				<Button
					variant="outlined"
					startIcon={
						<Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
							<FilterList fontSize="small" />
							{activeFilterCount > 0 && (
								<Box
									sx={{
										position: 'absolute',
										top: -6,
										right: -10,
										bgcolor: theme.palette.primary.main,
										color: 'white',
										borderRadius: '50%',
										width: 16,
										height: 16,
										fontSize: '0.65rem',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontWeight: 'bold',
										border: '1px solid white'
									}}
								>
									{activeFilterCount}
								</Box>
							)}
						</Box>
					}
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
			</Box>
		</Box>
	);
});

ScreeningTableHeader.displayName = 'ScreeningTableHeader';

export default ScreeningTableHeader;
