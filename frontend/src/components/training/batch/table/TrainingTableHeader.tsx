import React, { memo } from 'react';
import {
	Box,
	TextField,
	Button,
	InputAdornment,
	Tooltip,
	IconButton,
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
	loading
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
			<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
				<TextField
					placeholder="Search batches..."
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
					size="small"
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
			</Box>

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
						<Refresh
							fontSize="small"
							className={loading ? 'spin-animation' : ''}
							sx={loading ? { animation: 'spin 1s linear infinite' } : {}}
						/>
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

			<style>
				{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}
			</style>
		</Box>
	);
});

TrainingTableHeader.displayName = 'TrainingTableHeader';

export default TrainingTableHeader;
