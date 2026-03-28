import React, { useState } from 'react';
import {
	Paper,
	Box,
	CircularProgress,
	Typography,
	Tabs,
	Tab,
	Divider,
	Stack,
	Chip
} from '@mui/material';
import { type CandidateMatchResult } from '../../../../services/placementMappingService';
import CandidateMatchTable from './CandidateMatchTable';
import CustomTablePagination from '../../../common/CustomTablePagination';

interface Props {
	matches: CandidateMatchResult[];
	loading: boolean;
	onMapClick: (candidate: CandidateMatchResult) => void;
	onUnmapClick: (candidate: CandidateMatchResult) => void;
}

const CandidateMatchResults = ({ matches, loading, onMapClick, onUnmapClick }: Props) => {
	const [tabIndex, setTabIndex] = useState(0);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const allSuggested = matches.filter((c: CandidateMatchResult) => !c.is_already_mapped && c.match_score >= 40);
	const allMapped = matches.filter((c: CandidateMatchResult) => c.is_already_mapped);
	const allNotSuggested = matches.filter((c: CandidateMatchResult) => !c.is_already_mapped && c.match_score < 40);

	const getCurrentList = () => {
		switch (tabIndex) {
			case 1: return allMapped;
			case 2: return allNotSuggested;
			default: return allSuggested;
		}
	};

	const currentList = getCurrentList();
	const paginatedCandidates = currentList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	const handlePageChange = (_: unknown, newPage: number) => setPage(newPage);
	const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};
	const handleRowsPerPageSelect = (count: number) => {
		setRowsPerPage(count);
		setPage(0);
	};

	const renderTabLabel = (label: string, count: number, active: boolean) => (
		<Stack direction="row" spacing={1} alignItems="center">
			<Typography variant="inherit" sx={{ fontWeight: active ? 700 : 500 }}>{label}</Typography>
			<Chip
				label={count}
				size="small"
				sx={{
					height: 18,
					minWidth: 18,
					fontSize: '0.65rem',
					fontWeight: 600,
					borderRadius: '10px',
					bgcolor: active ? 'primary.main' : '#eaeded',
					color: active ? 'white' : 'text.secondary',
					border: 'none',
					'& .MuiChip-label': { px: 0.8 },
					transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
				}}
			/>
		</Stack>
	);

	return (
		<Paper
			variant="outlined"
			sx={{
				borderRadius: '2px',
				borderColor: 'divider',
				bgcolor: 'background.paper',
				minHeight: 550,
				display: 'flex',
				flexDirection: 'column',
				boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
			}}
		>
			{loading ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
					<CircularProgress size={40} sx={{ color: 'primary.main', mb: 2 }} />
					<Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Analyzing candidate pool and calculating affinity scores...</Typography>
				</Box>
			) : (
				<>
					<Box sx={{ px: 2, borderBottom: (t: any) => `1px solid ${t.palette.divider}`, bgcolor: '#fcfcfc' }}>
						<Tabs
							value={tabIndex}
							onChange={(_, v) => {
								setTabIndex(v);
								setPage(0);
							}}
							sx={{
								minHeight: 52,
								'& .MuiTabs-indicator': { bgcolor: 'primary.main', height: 3, borderRadius: '3px 3px 0 0' },
								'& .MuiTab-root': {
									textTransform: 'none',
									fontWeight: 600,
									fontSize: '0.875rem',
									color: 'text.secondary',
									minHeight: 52,
									px: 2,
									'&.Mui-selected': { color: 'primary.main' }
								}
							}}
						>
							<Tab label={renderTabLabel('High Affinity', allSuggested.length, tabIndex === 0)} />
							<Tab label={renderTabLabel('Already Mapped', allMapped.length, tabIndex === 1)} />
							<Tab label={renderTabLabel('Lower Affinity', allNotSuggested.length, tabIndex === 2)} />
						</Tabs>
					</Box>

					<Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'white' }}>
						<CandidateMatchTable
							candidates={paginatedCandidates}
							onMapClick={onMapClick}
							onUnmapClick={onUnmapClick}
							emptyMsg={
								tabIndex === 0 ? "No candidates found with >40% affinity for this specification." :
									tabIndex === 1 ? "No candidates have been mapped to this resource." :
										"No candidates found in the low affinity threshold."
							}
						/>
					</Box>

					<Box sx={{ bgcolor: 'background.paper', borderTop: (t: any) => `1px solid ${t.palette.divider}` }}>
						<CustomTablePagination
							count={currentList.length}
							page={page}
							rowsPerPage={rowsPerPage}
							onPageChange={handlePageChange}
							onRowsPerPageChange={handleRowsPerPageChange}
							onRowsPerPageSelectChange={handleRowsPerPageSelect}
						/>
						<Divider sx={{ mx: 2, opacity: 0.5 }} />
						<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, pt: 1.5, bgcolor: '#fcfcfc' }}>
							<Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
								<Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main', display: 'inline-block' }} />
								Algorithm output: affinity based ranking for current specifications.
							</Typography>
							<Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
								Category: {currentList.length} results | Total Pool: {matches.length}
							</Typography>
						</Stack>
					</Box>
				</>
			)}
		</Paper>
	);
};

export default CandidateMatchResults;
