import React, { useEffect, useState } from 'react';
import {
	Box,
	Paper,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	TextField,
	InputAdornment,
	Tabs,
	Tab,
	Chip
} from '@mui/material';
import {
	Search as SearchIcon,
	CloudUpload as UploadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import candidateService from '../../services/candidateService';
import type { CandidateListItem } from '../../models/candidate';

const DocumentCollectionList: React.FC = () => {
	const navigate = useNavigate();
	const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
	const [filteredCandidates, setFilteredCandidates] = useState<CandidateListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [tabValue, setTabValue] = useState(0); // 0 = Pending, 1 = Collected

	useEffect(() => {
		const fetchCandidates = async () => {
			try {
				setLoading(true);
				// Fetch profiled candidates as they contain counseling status and docs
				const data = await candidateService.getProfiled();
				// Filter for candidates who have been selected in counseling
				const selectedCandidates = data.items.filter((c: CandidateListItem) => c.counseling_status === 'selected');
				setCandidates(selectedCandidates);
				setFilteredCandidates(selectedCandidates);
			} catch (error) {
				console.error('Error fetching candidates:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchCandidates();
	}, []);

	useEffect(() => {
		let result = candidates;

		// 1. Search Filter
		if (searchTerm) {
			const lowerSearch = searchTerm.toLowerCase();
			result = result.filter(c =>
				c.name.toLowerCase().includes(lowerSearch) ||
				c.email?.toLowerCase().includes(lowerSearch) ||
				c.phone?.includes(lowerSearch)
			);
		}

		// 2. Tab Filter
		const isComplete = (c: CandidateListItem) => {
			const docs = c.documents_uploaded || [];
			const hasResume = docs.includes('resume');
			const hasDisability = docs.includes('disability_certificate');
			// Check for at least one education document
			const hasEducation = docs.some(d => ['10th_certificate', '12th_certificate', 'degree_certificate'].includes(d));

			return hasResume && hasDisability && hasEducation;
		};

		if (tabValue === 0) {
			// Pending
			result = result.filter(c => !isComplete(c));
		} else {
			// Collected
			result = result.filter(c => isComplete(c));
		}

		setFilteredCandidates(result);
	}, [candidates, searchTerm, tabValue]);

	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
	};

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	// Helper to render document status
	const renderDocumentStatus = (candidate: CandidateListItem) => {
		const docs = candidate.documents_uploaded || [];

		const collected: string[] = [];
		const pending: string[] = [];

		// Check Resume
		if (docs.includes('resume')) collected.push('Resume');
		else pending.push('Resume');

		// Check Disability
		if (docs.includes('disability_certificate')) collected.push('Disability Cert');
		else pending.push('Disability Cert');

		// Check Education (Any one is sufficient for "started" but ideally want all applicable)
		// For simple display, if ANY education doc is present, we mark Education as collected?
		// Or specific. Let's list specific education docs collected
		const eduDocs = docs.filter(d => ['10th_certificate', '12th_certificate', 'degree_certificate'].includes(d));
		if (eduDocs.length > 0) {
			// Map codes to labels
			eduDocs.forEach(d => {
				if (d === '10th_certificate') collected.push('10th');
				if (d === '12th_certificate') collected.push('12th');
				if (d === 'degree_certificate') collected.push('Degree');
			});
		} else {
			pending.push('Education Proof');
		}

		return (
			<Box>
				{collected.length > 0 && (
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
						<Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, mr: 0.5 }}>
							Collected:
						</Typography>
						{collected.map(d => (
							<Chip key={d} label={d} size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
						))}
					</Box>
				)}
				{pending.length > 0 && (
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mr: 0.5 }}>
							Pending:
						</Typography>
						{pending.map(d => (
							<Typography key={d} variant="caption" color="text.secondary" sx={{ bgcolor: '#f5f5f5', px: 0.5, borderRadius: 1 }}>
								{d}
							</Typography>
						))}
					</Box>
				)}
			</Box>
		);
	};

	return (
		<Box sx={{ p: 3 }}>
			<Box sx={{ mb: 4 }}>
				<Typography variant="h4" component="h1" sx={{ fontWeight: 300, color: '#232f3e', mb: 0.5 }}>
					Document Collection
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Assess and counsel profiled candidates
				</Typography>
			</Box>

			{/* Tabs */}
			<Paper sx={{ mb: 0, borderRadius: '4px 4px 0 0', borderBottom: '1px solid #e0e0e0' }} elevation={0}>
				<Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
					<Tab label="Pending Collection" />
					<Tab label="Collection Complete" />
				</Tabs>
			</Paper>

			<Paper sx={{ mb: 3, p: 2, borderRadius: '0 0 4px 4px' }}>
				{/* Search Bar */}
				<Box sx={{ mb: 3 }}>
					<TextField
						fullWidth
						placeholder="Search by name, email, or phone..."
						value={searchTerm}
						onChange={handleSearch}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon color="action" />
								</InputAdornment>
							),
						}}
						size="small"
						sx={{ maxWidth: 500 }}
					/>
				</Box>

				<TableContainer>
					<Table>
						<TableHead sx={{ bgcolor: '#f5f5f5' }}>
							<TableRow>
								<TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
								<TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
								<TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
								<TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Documents Status</TableCell>
								<TableCell align="right" sx={{ fontWeight: 'bold' }}>Action</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={5} align="center" sx={{ py: 3 }}>
										<Typography color="text.secondary">Loading candidates...</Typography>
									</TableCell>
								</TableRow>
							) : filteredCandidates.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} align="center" sx={{ py: 3 }}>
										<Typography color="text.secondary">No candidates found.</Typography>
									</TableCell>
								</TableRow>
							) : (
								filteredCandidates.map((candidate) => (
									<TableRow key={candidate.public_id} hover>
										<TableCell>
											<Typography variant="subtitle2">{candidate.name}</Typography>
											<Typography variant="caption" color="text.secondary">
												{candidate.email}
											</Typography>
										</TableCell>
										<TableCell>{candidate.phone}</TableCell>
										<TableCell>{candidate.city}</TableCell>
										<TableCell>
											{renderDocumentStatus(candidate)}
										</TableCell>
										<TableCell align="right">
											<Button
												variant="contained"
												size="small"
												startIcon={<UploadIcon />}
												onClick={() => navigate(`/candidates/documents/${candidate.public_id}`)}
												sx={{ textTransform: 'none' }}
											>
												Collect Documents
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>
		</Box>
	);
};

export default DocumentCollectionList;
