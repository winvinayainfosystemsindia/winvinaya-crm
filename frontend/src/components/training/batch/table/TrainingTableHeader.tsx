import React, { memo } from 'react';
import {
	Box,
	TextField,
	Button,
	InputAdornment,
	Badge,
	useTheme
} from '@mui/material';
import { Search, FilterList, Refresh } from '@mui/icons-material';

interface TrainingTableHeaderProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	activeFilterCount: number;
	onFilterOpen: () => void;
	onCreateClick: () => void;
	onRefresh: () => void;
	loading: boolean;
}

const TrainingTableHeader: React.FC<TrainingTableHeaderProps> = memo(({
	searchTerm,
	onSearchChange,
	activeFilterCount,
	onFilterOpen,
	onCreateClick,
	onRefresh,
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
			<TextField
				placeholder="Search batches..."
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

			<Box sx={{ display: 'flex', gap: 1, mt: { xs: 1, sm: 0 }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
				<Box sx={{ display: 'flex', gap: 1 }}>
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
				</Box>

				<Button
					variant="contained"
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
					Create Batch
				</Button>
			</Box>
		</Box>
	);
});

TrainingTableHeader.displayName = 'TrainingTableHeader';

export default TrainingTableHeader;
