import React from 'react';
import {
	Box,
	Typography,
	Divider,
	MenuItem,
	FormControlLabel,
	Checkbox,
	Menu,
	Button,
	useTheme,
	useMediaQuery
} from '@mui/material';
import { ViewColumn as ColumnIcon, SelectAll as SelectAllIcon, Deselect as DeselectIcon } from '@mui/icons-material';
import { GROUP_LABELS, GROUP_ORDER } from '../../reports/constants';

interface Column {
	id: string;
	label: string;
	group?: string;
}

interface ColumnSelectorProps {
	anchorEl: HTMLElement | null;
	onClose: () => void;
	onOpen: (event: React.MouseEvent<HTMLElement>) => void;
	columns: Column[];
	visibleColumns: string[];
	onToggleColumn: (columnId: string) => void;
	onSelectAll?: () => void;
	onDeselectAll?: () => void;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
	anchorEl,
	onClose,
	onOpen,
	columns,
	visibleColumns,
	onToggleColumn,
	onSelectAll,
	onDeselectAll
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const isAllSelected = columns.length > 0 && visibleColumns.length === columns.length;

	return (
		<Box sx={{ width: isMobile ? '100%' : 'auto' }}>
			<Button
				variant="outlined"
				startIcon={<ColumnIcon />}
				onClick={onOpen}
				size="small"
				sx={{
					height: 36,
					width: isMobile ? '100%' : 'auto',
					borderColor: theme.palette.divider,
					color: theme.palette.text.primary,
					textTransform: 'none',
					fontSize: theme.typography.body2.fontSize,
					fontWeight: 500,
					'&:hover': { 
						borderColor: theme.palette.primary.light, 
						backgroundColor: theme.palette.action.hover 
					}
				}}
			>
				Configure Columns ({visibleColumns.length}/{columns.length})
			</Button>
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={onClose}
				PaperProps={{
					sx: {
						width: 320,
						maxHeight: 540,
						boxShadow: theme.shadows[3],
						border: `1px solid ${theme.palette.divider}`,
						overflowY: 'auto',
						'overscrollBehavior': 'contain'
					}
				}}
			>
				<Box sx={{ px: 2, py: 1.5 }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
						<Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
							Select Columns
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
							{visibleColumns.length} selected
						</Typography>
					</Box>
					<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
						Choose which columns to show in the table.
					</Typography>
					<Box sx={{ display: 'flex', gap: 1 }}>
						<Button
							size="small"
							variant="outlined"
							startIcon={<SelectAllIcon fontSize="small" />}
							onClick={onSelectAll}
							disabled={isAllSelected}
							sx={{
								fontSize: '0.75rem',
								py: 0.25,
								px: 1,
								textTransform: 'none',
								flex: 1,
								fontWeight: 600
							}}
						>
							Select All
						</Button>
						<Button
							size="small"
							variant="outlined"
							startIcon={<DeselectIcon fontSize="small" />}
							onClick={onDeselectAll}
							disabled={visibleColumns.length === 0}
							sx={{
								fontSize: '0.75rem',
								py: 0.25,
								px: 1,
								textTransform: 'none',
								flex: 1,
								fontWeight: 600
							}}
						>
							Deselect All
						</Button>
					</Box>
				</Box>
				<Divider />
				<Box sx={{ py: 1 }}>
					{GROUP_ORDER.map(group => {
						const groupCols = columns.filter(c => (c as any).group === group);
						if (groupCols.length === 0) return null;

						const groupLabel = GROUP_LABELS[group] || group;
						const groupSelectedCount = groupCols.filter(c => visibleColumns.includes(c.id)).length;

						return (
							<React.Fragment key={group}>
								<Box sx={{ px: 2, py: 1, bgcolor: theme.palette.action.hover, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
										{groupLabel}
									</Typography>
									<Typography variant="caption" sx={{ fontSize: '0.65rem', color: theme.palette.text.secondary }}>
										{groupSelectedCount}/{groupCols.length}
									</Typography>
								</Box>
								{groupCols.map(col => (
									<MenuItem
										key={col.id}
										onClick={() => onToggleColumn(col.id)}
										sx={{
											py: 0.5,
											'&:hover': { backgroundColor: theme.palette.action.hover }
										}}
									>
										<FormControlLabel
											control={
												<Checkbox
													size="small"
													checked={visibleColumns.includes(col.id)}
													sx={{
														color: theme.palette.divider,
														'&.Mui-checked': { color: theme.palette.primary.main }
													}}
												/>
											}
											label={
												<Typography variant="body2" sx={{ color: theme.palette.text.primary, fontSize: theme.typography.body2.fontSize }}>
													{col.label}
												</Typography>
											}
											sx={{ m: 0, width: '100%' }}
										/>
									</MenuItem>
								))}
								<Divider />
							</React.Fragment>
						);
					})}
				</Box>
			</Menu>
		</Box>
	);
};

export default ColumnSelector;
