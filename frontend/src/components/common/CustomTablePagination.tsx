import React from 'react';
import {
	Box,
	TablePagination,
	Typography,
	FormControl,
	Select,
	MenuItem,
	useTheme,
	useMediaQuery
} from '@mui/material';

interface CustomTablePaginationProps {
	count: number;
	page: number;
	rowsPerPage: number;
	onPageChange: (event: unknown, newPage: number) => void;
	onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onRowsPerPageSelectChange: (rows: number) => void;
}

const CustomTablePagination: React.FC<CustomTablePaginationProps> = ({
	count,
	page,
	rowsPerPage,
	onPageChange,
	onRowsPerPageChange,
	onRowsPerPageSelectChange
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	return (
		<Box sx={{
			display: 'flex',
			flexDirection: { xs: 'column-reverse', sm: 'row' },
			justifyContent: 'space-between',
			alignItems: 'center',
			p: { xs: 1.5, sm: 2 },
			gap: { xs: 1.5, sm: 2 },
			bgcolor: '#f8fafc',
			borderTop: '1px solid #e5e7eb'
		}}>
			<Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
				<Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
					Rows per page:
				</Typography>
				<FormControl size="small">
					<Select
						value={rowsPerPage}
						onChange={(e) => onRowsPerPageSelectChange(parseInt(String(e.target.value), 10))}
						sx={{
							height: '28px',
							fontSize: '0.75rem',
							bgcolor: 'white',
							'& .MuiOutlinedInput-notchedOutline': {
								borderColor: '#e2e8f0',
							},
							'&:hover .MuiOutlinedInput-notchedOutline': {
								borderColor: '#cbd5e1',
							}
						}}
					>
						<MenuItem value={5}>5</MenuItem>
						<MenuItem value={10}>10</MenuItem>
						<MenuItem value={25}>25</MenuItem>
						<MenuItem value={50}>50</MenuItem>
						<MenuItem value={100}>100</MenuItem>
					</Select>
				</FormControl>
			</Box>

			<TablePagination
				component="div"
				count={count}
				page={page}
				onPageChange={onPageChange}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={onRowsPerPageChange}
				rowsPerPageOptions={[]}
				labelDisplayedRows={({ from, to, count }) => (
					<Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
						{isMobile ? `${from}-${to} of ${count}` : `Showing ${from} to ${to} of ${count} records`}
					</Typography>
				)}
				sx={{
					border: 'none',
					width: { xs: '100%', sm: 'auto' },
					'.MuiTablePagination-toolbar': {
						paddingLeft: 0,
						paddingRight: { xs: 0, sm: 2 },
						minHeight: { xs: '32px', sm: '40px' },
						justifyContent: 'center'
					},
					'.MuiTablePagination-actions': {
						marginLeft: { xs: 1, sm: 2 },
						'& .MuiIconButton-root': {
							padding: '4px',
							color: '#ec7211',
							'&.Mui-disabled': { color: '#e2e8f0' }
						}
					},
					'.MuiTablePagination-selectLabel, .MuiTablePagination-input': {
						display: 'none'
					},
					'.MuiTablePagination-displayedRows': {
						margin: 0
					}
				}}
			/>
		</Box>
	);
};

export default CustomTablePagination;
