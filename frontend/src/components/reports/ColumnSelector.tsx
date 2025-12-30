import React from 'react';
import {
	Box,
	Typography,
	Divider,
	MenuItem,
	FormControlLabel,
	Checkbox,
	Menu,
	Button
} from '@mui/material';
import { ViewColumn as ColumnIcon } from '@mui/icons-material';

interface Column {
	id: string;
	label: string;
}

interface ColumnSelectorProps {
	anchorEl: HTMLElement | null;
	onClose: () => void;
	onOpen: (event: React.MouseEvent<HTMLElement>) => void;
	columns: Column[];
	visibleColumns: string[];
	onToggleColumn: (columnId: string) => void;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
	anchorEl,
	onClose,
	onOpen,
	columns,
	visibleColumns,
	onToggleColumn
}) => {
	return (
		<Box>
			<Button
				variant="outlined"
				startIcon={<ColumnIcon />}
				onClick={onOpen}
				size="small"
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
				Configure Columns
			</Button>
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={onClose}
				PaperProps={{
					sx: {
						width: 280,
						maxHeight: 480,
						boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
						border: '1px solid #eaeded',
						overflowY: 'auto',
						'overscrollBehavior': 'contain'
					}
				}}
			>
				<Box sx={{ px: 2, py: 1.5 }}>
					<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1c1e' }}>
						Select Columns
					</Typography>
					<Typography variant="caption" color="text.secondary">
						Choose which columns to show in the table.
					</Typography>
				</Box>
				<Divider />
				<Box sx={{ py: 1 }}>
					{columns.map(col => (
						<MenuItem
							key={col.id}
							onClick={() => onToggleColumn(col.id)}
							sx={{
								py: 0.5,
								'&:hover': { backgroundColor: '#f2f3f3' }
							}}
						>
							<FormControlLabel
								control={
									<Checkbox
										size="small"
										checked={visibleColumns.includes(col.id)}
										sx={{
											color: '#d5dbdb',
											'&.Mui-checked': { color: '#ff9900' }
										}}
									/>
								}
								label={
									<Typography variant="body2" sx={{ color: '#545b64', fontSize: '0.875rem' }}>
										{col.label}
									</Typography>
								}
								sx={{ m: 0, width: '100%' }}
							/>
						</MenuItem>
					))}
				</Box>
			</Menu>
		</Box>
	);
};

export default ColumnSelector;
