import React from 'react';
import {
	Box,
	TextField,
	Button,
	InputAdornment,
	Badge,
} from '@mui/material';
import { Search, FilterList, Refresh } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface CounselingTableHeaderProps {
	searchTerm: string;
	onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onRefresh: () => void;
	activeFilterCount: number;
	filterDrawerOpen: boolean;
	onFilterOpen: () => void;
}

const CounselingTableHeader: React.FC<CounselingTableHeaderProps> = ({
	searchTerm,
	onSearchChange,
	onRefresh,
	activeFilterCount,
	onFilterOpen,
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
				placeholder="Search candidates..."
				value={searchTerm}
				onChange={onSearchChange}
				size="small"
				fullWidth
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
			</Box>
		</Box>
	);
};

export default React.memo(CounselingTableHeader);
