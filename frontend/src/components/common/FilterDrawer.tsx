import React from 'react';
import {
	Drawer,
	Box,
	Typography,
	IconButton,
	Button,
	Chip,
	Divider,
	Checkbox,
	FormControlLabel,
	Radio,
	RadioGroup
} from '@mui/material';
import { Close, FilterAlt } from '@mui/icons-material';

// Types for filter configuration
export interface FilterOption {
	value: string;
	label: string;
}

export interface FilterField {
	key: string;
	label: string;
	type: 'multi-select' | 'single-select';
	options: FilterOption[];
}

interface FilterDrawerProps {
	open: boolean;
	onClose: () => void;
	fields: FilterField[];
	activeFilters: Record<string, any>;
	onFilterChange: (key: string, value: any) => void;
	onClearFilters: () => void;
	onApplyFilters: () => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
	open,
	onClose,
	fields,
	activeFilters,
	onFilterChange,
	onClearFilters,
	onApplyFilters
}) => {
	// Calculate active filter count
	const activeFilterCount = fields.reduce((count, field) => {
		const value = activeFilters[field.key];
		if (field.type === 'multi-select') {
			return count + (Array.isArray(value) ? value.length : 0);
		} else {
			return count + (value ? 1 : 0);
		}
	}, 0);

	const handleMultiSelectChange = (key: string, value: string) => {
		const current = activeFilters[key] || [];
		const newValues = current.includes(value)
			? current.filter((item: string) => item !== value)
			: [...current, value];
		onFilterChange(key, newValues);
	};

	const handleSingleSelectChange = (key: string, value: string) => {
		onFilterChange(key, value);
	};

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: {
					width: { xs: '100%', sm: 400 },
					bgcolor: '#fafafa'
				}
			}}
		>
			{/* Header */}
			<Box sx={{
				p: 2.5,
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				bgcolor: 'white',
				borderBottom: '1px solid #d5dbdb'
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<FilterAlt sx={{ color: 'primary.main' }} />
					<Typography variant="h6" fontWeight="600">Filters</Typography>
					{activeFilterCount > 0 && (
						<Chip
							label={`${activeFilterCount} active`}
							size="small"
							color="primary"
							sx={{ height: 24, fontSize: '0.75rem' }}
						/>
					)}
				</Box>
				<IconButton onClick={onClose} size="small">
					<Close />
				</IconButton>
			</Box>

			{/* Filter Content */}
			<Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
				{fields.map((field, index) => (
					<Box
						key={field.key}
						sx={{
							mb: index === fields.length - 1 ? 0 : 3,
							bgcolor: 'white',
							p: 2,
							borderRadius: 1,
							border: '1px solid #d5dbdb'
						}}
					>
						<Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1.5, color: 'text.primary' }}>
							{field.label}
						</Typography>

						{field.type === 'multi-select' ? (
							field.options.length > 0 ? (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 200, overflow: 'auto' }}>
									{field.options.map((option) => (
										<FormControlLabel
											key={option.value}
											control={
												<Checkbox
													size="small"
													checked={(activeFilters[field.key] || []).includes(option.value)}
													onChange={() => handleMultiSelectChange(field.key, option.value)}
												/>
											}
											label={option.label}
										/>
									))}
								</Box>
							) : (
								<Typography variant="body2" color="text.secondary">No options available</Typography>
							)
						) : (
							<RadioGroup
								value={activeFilters[field.key] || ''}
								onChange={(e) => handleSingleSelectChange(field.key, e.target.value)}
							>
								<FormControlLabel value="" control={<Radio size="small" />} label="All" />
								{field.options.map((option) => (
									<FormControlLabel
										key={option.value}
										value={option.value}
										control={<Radio size="small" />}
										label={option.label}
									/>
								))}
							</RadioGroup>
						)}
					</Box>
				))}
			</Box>

			{/* Footer with Apply & Clear buttons */}
			<Divider />
			<Box sx={{ p: 2.5, bgcolor: 'white', borderTop: '1px solid #d5dbdb', display: 'flex', gap: 2 }}>
				<Button
					variant="outlined"
					fullWidth
					onClick={onClearFilters}
					sx={{
						borderColor: '#d5dbdb',
						color: 'text.secondary',
						textTransform: 'none',
						fontWeight: 600,
						'&:hover': {
							borderColor: '#aab7b8',
							bgcolor: '#f5f8fa'
						}
					}}
				>
					Clear All
				</Button>
				<Button
					variant="contained"
					fullWidth
					onClick={onApplyFilters}
					sx={{
						bgcolor: '#ec7211',
						color: 'white',
						textTransform: 'none',
						fontWeight: 600,
						'&:hover': {
							bgcolor: '#eb5f07'
						}
					}}
				>
					Apply Filters
				</Button>
			</Box>
		</Drawer>
	);
};

export default FilterDrawer;
