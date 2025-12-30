import React from 'react';
import {
	Box,
	Paper,
	TextField,
	InputAdornment,
	Button,
	Badge,
	Typography
} from '@mui/material';
import {
	Search as SearchIcon,
	FilterList as FilterIcon
} from '@mui/icons-material';

interface ReportToolbarProps {
	search: string;
	onSearchChange: (value: string) => void;
	total: number;
	filterCount: number;
	onFilterClick: () => void;
	children?: React.ReactNode;
}

const ReportToolbar: React.FC<ReportToolbarProps> = ({
	search,
	onSearchChange,
	total,
	filterCount,
	onFilterClick,
	children
}) => {
	return (
		<Paper
			elevation={0}
			sx={{
				p: 2,
				mb: 0,
				border: '1px solid #eaeded',
				borderBottom: 'none',
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				backgroundColor: '#fff',
				borderRadius: '4px 4px 0 0'
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
				<TextField
					placeholder="Search candidates..."
					variant="outlined"
					size="small"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					sx={{
						width: 400,
						'& .MuiOutlinedInput-root': {
							height: 32,
							backgroundColor: '#fff',
							fontSize: '0.875rem',
							'& fieldset': { borderColor: '#d5dbdb' },
							'&:hover fieldset': { borderColor: '#aab7b7' },
							'&.Mui-focused fieldset': { borderColor: '#007eb9', borderWidth: 1 }
						}
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon sx={{ color: '#545b64', fontSize: 18 }} />
							</InputAdornment>
						),
					}}
				/>
				<Button
					variant="outlined"
					startIcon={
						<Badge
							badgeContent={filterCount}
							color="primary"
							sx={{
								'& .MuiBadge-badge': {
									fontSize: '0.65rem',
									height: 16,
									minWidth: 16,
									top: 2,
									right: -2,
									backgroundColor: '#007eb9'
								}
							}}
						>
							<FilterIcon sx={{ fontSize: 18 }} />
						</Badge>
					}
					onClick={onFilterClick}
					sx={{
						height: 32,
						borderColor: '#d5dbdb',
						color: '#545b64',
						textTransform: 'none',
						fontSize: '0.85rem',
						fontWeight: 500,
						'&:hover': { borderColor: '#aab7b7', backgroundColor: '#f2f3f3' }
					}}
				>
					Filter
				</Button>
				<Typography variant="body2" sx={{ color: '#545b64', ml: 1, fontWeight: 500 }}>
					({total} candidates)
				</Typography>
			</Box>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				{children}
			</Box>
		</Paper>
	);
};

export default ReportToolbar;
