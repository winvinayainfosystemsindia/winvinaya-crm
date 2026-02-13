import React from 'react';
import {
	Box,
	Typography,
	FormControl,
	Select,
	MenuItem,
	TablePagination,
	useTheme
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

	return (
		<Box sx={{
			display: 'flex',
			flexDirection: { xs: 'column', sm: 'row' },
			justifyContent: 'space-between',
			alignItems: 'center',
			p: 2,
			gap: 2,
			borderTop: '1px solid #d5dbdb',
			bgcolor: '#fafafa'
		}}>
			<Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2 }}>
				<Typography variant="body2" color="text.secondary">
					Rows per page:
				</Typography>
				<FormControl size="small">
					<Select
						value={rowsPerPage}
						onChange={(e) => onRowsPerPageSelectChange(parseInt(String(e.target.value), 10))}
						sx={{
							height: '32px',
							'& .MuiOutlinedInput-notchedOutline': {
								borderColor: '#d5dbdb',
							},
							'&:hover .MuiOutlinedInput-notchedOutline': {
								borderColor: theme.palette.primary.main,
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
				sx={{
					border: 'none',
					'.MuiTablePagination-toolbar': {
						paddingLeft: 0,
						paddingRight: 0,
						minHeight: '40px'
					},
					'.MuiTablePagination-actions': {
						marginLeft: { xs: 0, sm: 2 }
					}
				}}
			/>
		</Box>
	);
};

export default CustomTablePagination;
