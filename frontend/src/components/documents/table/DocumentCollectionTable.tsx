import React from 'react';
import {
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Button,
	InputAdornment,
	Typography,
	useTheme,
	Tooltip,
	Chip,
	TableSortLabel,
	alpha
} from '@mui/material';
import { Search, CloudUpload as UploadIcon, Accessible, VerifiedUser } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { CandidateListItem } from '../../../models/candidate';
import CustomTablePagination from '../../common/CustomTablePagination';
import { useDocumentPage } from '../hooks/useDocumentPage';

interface DocumentCollectionTableProps {
	type: 'not_collected' | 'pending' | 'collected';
}

/**
 * DocumentCollectionTable - Standardized data table for document collection workflows.
 * Optimized for high-throughput tracking of candidate documentation status.
 */
const DocumentCollectionTable: React.FC<DocumentCollectionTableProps> = ({ type }) => {
	const theme = useTheme();
	const navigate = useNavigate();
	
	const {
		candidates,
		loading,
		totalCount,
		searchTerm,
		page,
		rowsPerPage,
		order,
		orderBy,
		handleSearch,
		handleChangePage,
		handleChangeRowsPerPage,
		handleRequestSort,
		setRowsPerPage
	} = useDocumentPage(type);

	// Helper to render document status chips with theme alignment
	const renderStatusChips = (candidate: CandidateListItem) => {
		const docs = candidate.documents_uploaded || [];
		const collected: string[] = [];
		const pending: string[] = [];

		if (docs.includes('resume')) collected.push('Resume'); else pending.push('Resume');
		if (candidate.is_disabled) {
			if (docs.includes('disability_certificate')) collected.push('Disability'); else pending.push('Disability');
		}
		if (docs.includes('10th_certificate')) collected.push('10th'); else pending.push('10th');
		if (docs.includes('12th_certificate')) collected.push('12th'); else pending.push('12th');
		if (docs.includes('degree_certificate')) collected.push('Degree'); else pending.push('Degree');
		if (docs.includes('pan_card')) collected.push('PAN'); else pending.push('PAN');
		if (docs.includes('aadhar_card')) collected.push('Aadhar'); else pending.push('Aadhar');

		return (
			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
				{collected.map(d => (
					<Chip 
						key={d} 
						label={d} 
						size="small" 
						color="success" 
						variant="outlined" 
						sx={{ height: 18, fontSize: '0.6rem', borderRadius: 0.5, fontWeight: 700 }} 
					/>
				))}
				{pending.map(d => (
					<Chip 
						key={d} 
						label={d} 
						size="small" 
						variant="outlined" 
						sx={{ 
							height: 18, 
							fontSize: '0.6rem', 
							borderRadius: 0.5,
							color: 'text.secondary', 
							borderColor: 'divider',
							bgcolor: alpha(theme.palette.text.secondary, 0.04)
						}} 
					/>
				))}
			</Box>
		);
	};

	return (
		<Paper elevation={0} variant="outlined" sx={{ borderRadius: 0.5, overflow: 'hidden' }}>
			{/* Header with Search */}
			<Box sx={{
				p: 2,
				display: 'flex',
				flexDirection: { xs: 'column', sm: 'row' },
				justifyContent: 'space-between',
				alignItems: { xs: 'stretch', sm: 'center' },
				borderBottom: '1px solid',
				borderColor: 'divider',
				bgcolor: alpha(theme.palette.primary.main, 0.02)
			}}>
				<TextField
					placeholder={`Search candidates by name or email...`}
					value={searchTerm}
					onChange={handleSearch}
					size="small"
					fullWidth
					sx={{
						maxWidth: { xs: '100%', sm: '350px' },
						'& .MuiOutlinedInput-root': {
							bgcolor: 'background.paper',
							borderRadius: 0.5
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

			<TableContainer>
				<Table sx={{ minWidth: 650 }}>
					<TableHead>
						<TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
							<TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
								<TableSortLabel
									active={orderBy === 'name'}
									direction={orderBy === 'name' ? order : 'asc'}
									onClick={() => handleRequestSort('name')}
								>
									Candidate Identity
								</TableSortLabel>
							</TableCell>
							<TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', display: { xs: 'none', md: 'table-cell' } }}>
								Contact Details
							</TableCell>
							<TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', display: { xs: 'none', md: 'table-cell' } }}>
								Location
							</TableCell>
							<TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
								Document Status
							</TableCell>
							<TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
								Workflow Action
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={5} align="center" sx={{ py: 6 }}>
									<Box sx={{ opacity: 0.5 }}>
										<Typography variant="body2">Synchronizing candidate data...</Typography>
									</Box>
								</TableCell>
							</TableRow>
						) : candidates.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} align="center" sx={{ py: 6 }}>
									<Typography variant="body2" color="text.secondary">
										No candidates found in the "{type.replace('_', ' ')}" collection.
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							candidates.map((candidate) => (
								<TableRow key={candidate.public_id} hover>
									<TableCell>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<Box>
												<Typography variant="body2" sx={{ fontWeight: 600 }}>
													{candidate.name}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													{candidate.email}
												</Typography>
											</Box>
											{candidate.is_disabled && (
												<Tooltip title="Person with Disability">
													<Accessible color="primary" sx={{ fontSize: 16 }} />
												</Tooltip>
											)}
											<Tooltip title="Verified Profile">
												<VerifiedUser sx={{ color: 'success.main', fontSize: 16 }} />
											</Tooltip>
										</Box>
									</TableCell>
									<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
										<Typography variant="body2" color="text.secondary">{candidate.phone}</Typography>
									</TableCell>
									<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
										<Typography variant="body2" color="text.secondary">
											{candidate.city}, {candidate.state}
										</Typography>
									</TableCell>
									<TableCell>
										{renderStatusChips(candidate)}
									</TableCell>
									<TableCell align="right">
										<Button
											variant="contained"
											size="small"
											startIcon={<UploadIcon />}
											onClick={() => navigate(`/candidates/documents/${candidate.public_id}`)}
											sx={{
												textTransform: 'none',
												borderRadius: 0.5,
												fontWeight: 700,
												boxShadow: 'none',
												'&:hover': { boxShadow: 'none' }
											}}
										>
											Collect
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<CustomTablePagination
				count={totalCount}
				page={page}
				rowsPerPage={rowsPerPage}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				onRowsPerPageSelectChange={setRowsPerPage}
			/>
		</Paper>
	);
};

export default DocumentCollectionTable;
