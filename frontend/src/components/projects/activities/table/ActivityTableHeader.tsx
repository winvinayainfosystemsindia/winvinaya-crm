import React from 'react';
import {
	Box,
	TextField,
	InputAdornment,
	Button,
	Menu,
	MenuItem,
	useTheme
} from '@mui/material';
import {
	Search as SearchIcon,
	Refresh as RefreshIcon,
	FilterList as FilterIcon
} from '@mui/icons-material';
import { DSRActivityStatusValues } from '../../../../models/dsr';

interface ActivityTableHeaderProps {
	searchTerm: string;
	onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onRefresh: () => void;
	statusFilter: string;
	filterAnchorEl: null | HTMLElement;
	filterOpen: boolean;
	onFilterClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
	onFilterClose: () => void;
	onStatusSelect: (status: string) => void;
}

const ActivityTableHeader: React.FC<ActivityTableHeaderProps> = ({
	searchTerm,
	onSearchChange,
	onRefresh,
	statusFilter,
	filterAnchorEl,
	filterOpen,
	onFilterClick,
	onFilterClose,
	onStatusSelect
}) => {
	const theme = useTheme();

	return (
		<Box sx={{
			p: 2,
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			borderBottom: `1px solid ${theme.palette.divider}`,
			bgcolor: '#fafafa'
		}}>
			<TextField
				placeholder="Search activities..."
				size="small"
				value={searchTerm}
				onChange={onSearchChange}
				sx={{
					width: 300,
					'& .MuiInputBase-root': {
						fontSize: '0.8125rem',
						height: 36,
						bgcolor: theme.palette.background.paper
					}
				}}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
						</InputAdornment>
					),
				}}
			/>
			<Box sx={{ display: 'flex', gap: 1.5 }}>
				<Button
					variant="outlined"
					startIcon={<RefreshIcon sx={{ fontSize: 18 }} />}
					onClick={onRefresh}
					sx={{
						color: theme.palette.text.primary,
						borderColor: theme.palette.divider,
						textTransform: 'none',
						fontWeight: 600,
						fontSize: '0.8125rem',
						height: 36,
						px: 2,
						'&:hover': { bgcolor: '#f2f3f3', border: `1px solid ${theme.palette.divider}` }
					}}
				>
					Refresh
				</Button>
				<Button
					variant="outlined"
					startIcon={<FilterIcon sx={{ fontSize: 18 }} />}
					onClick={onFilterClick}
					sx={{
						color: theme.palette.text.primary,
						borderColor: theme.palette.divider,
						textTransform: 'none',
						fontWeight: 600,
						fontSize: '0.8125rem',
						height: 36,
						px: 2,
						'&:hover': { bgcolor: '#f2f3f3', border: `1px solid ${theme.palette.divider}` }
					}}
				>
					Filter
				</Button>
				<Menu
					anchorEl={filterAnchorEl}
					open={filterOpen}
					onClose={onFilterClose}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				>
					<MenuItem onClick={() => onStatusSelect('all')} selected={statusFilter === 'all'}>Status: All</MenuItem>
					{Object.values(DSRActivityStatusValues).map(status => (
						<MenuItem key={status} onClick={() => onStatusSelect(status)} selected={statusFilter === status}>
							Status: {status.charAt(0) + status.slice(1).toLowerCase()}
						</MenuItem>
					))}
				</Menu>
			</Box>
		</Box>
	);
};

export default ActivityTableHeader;
