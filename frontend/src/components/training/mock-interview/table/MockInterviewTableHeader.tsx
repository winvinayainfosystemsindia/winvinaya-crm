import React, { memo } from 'react';
import {
	Paper,
	Stack,
	TextField,
	InputAdornment,
	Tooltip,
	IconButton,
	Button,
	useTheme
} from '@mui/material';
import {
	Search as SearchIcon,
	Refresh as RefreshIcon,
	FilterList as FilterIcon,
	Add as AddIcon
} from '@mui/icons-material';

interface MockInterviewTableHeaderProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	onRefresh: () => void;
	onCreate: () => void;
}

const MockInterviewTableHeader: React.FC<MockInterviewTableHeaderProps> = memo(({
	searchTerm,
	onSearchChange,
	onRefresh,
	onCreate
}) => {
	const theme = useTheme();

	return (
		<Paper
			elevation={0}
			sx={{
				p: 2,
				mb: 3,
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				borderRadius: 2,
				border: `1px solid ${theme.palette.divider}`,
				backgroundColor: theme.palette.background.paper
			}}
		>
			<Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
				<TextField
					placeholder="Search candidates or interviewers..."
					size="small"
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon fontSize="small" color="action" />
							</InputAdornment>
						),
					}}
					sx={{ width: 350 }}
				/>
				<Tooltip title="Refresh">
					<IconButton onClick={onRefresh} size="small">
						<RefreshIcon fontSize="small" />
					</IconButton>
				</Tooltip>
				<Tooltip title="Filters">
					<IconButton size="small">
						<FilterIcon fontSize="small" />
					</IconButton>
				</Tooltip>
			</Stack>

			<Button
				variant="contained"
				startIcon={<AddIcon />}
				onClick={onCreate}
				sx={{
					textTransform: 'none',
					fontWeight: 600,
					boxShadow: 'none',
					'&:hover': {
						boxShadow: 'none'
					}
				}}
			>
				Create session
			</Button>
		</Paper>
	);
});

MockInterviewTableHeader.displayName = 'MockInterviewTableHeader';

export default MockInterviewTableHeader;

