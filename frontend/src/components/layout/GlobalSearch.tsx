import React, { useState, useRef, useEffect } from 'react';
import {
	Box,
	InputBase,
	Paper,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	ListItemIcon,
	Typography,
	alpha,
	useTheme,
	styled,
	CircularProgress
} from '@mui/material';
import {
	Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearchActions, CandidatesIcon, UserIcon, CounselingIcon, ProjectIcon } from '../../hooks/useSearchActions';
import type { SearchAction } from '../../hooks/useSearchActions';
import { candidateService } from '../../services/candidateService';
import userService from '../../services/userService';
import { x0paService } from '../../services/x0paService';
import dsrProjectService from '../../services/dsrProjectService';

const SearchContainer = styled('div')(({ theme }) => ({
	position: 'relative',
	borderRadius: 4,
	backgroundColor: alpha('#ffffff', 0.15),
	'&:hover': {
		backgroundColor: alpha('#ffffff', 0.25),
	},
	marginRight: theme.spacing(2),
	marginLeft: 0,
	width: '100%',
	maxWidth: '450px',
	[theme.breakpoints.up('sm')]: {
		marginLeft: theme.spacing(3),
		width: 'auto',
		minWidth: '400px',
	},
	fontFamily: '"Amazon Ember", "Helvetica Neue", "Helvetica", "Arial", sans-serif',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
	padding: theme.spacing(0, 2),
	height: '100%',
	position: 'absolute',
	pointerEvents: 'none',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	color: '#ffffff',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
	color: '#ffffff',
	width: '100%',
	'& .MuiInputBase-input': {
		padding: theme.spacing(1, 1, 1, 0),
		// vertical padding + font size from searchIcon
		paddingLeft: `calc(1em + ${theme.spacing(4)})`,
		transition: theme.transitions.create('width'),
		width: '100%',
		fontSize: '0.875rem',
		'&::placeholder': {
			color: alpha('#ffffff', 0.7),
			opacity: 1,
		},
	},
}));

const ShortcutHint = styled('div')(({ theme }) => ({
	position: 'absolute',
	right: '8px',
	top: '50%',
	transform: 'translateY(-50%)',
	padding: '2px 6px',
	borderRadius: '4px',
	backgroundColor: alpha('#ffffff', 0.1),
	border: `1px solid ${alpha('#ffffff', 0.2)}`,
	color: alpha('#ffffff', 0.6),
	fontSize: '0.7rem',
	fontWeight: 700,
	pointerEvents: 'none',
	display: 'flex',
	alignItems: 'center',
	gap: '2px',
	[theme.breakpoints.down('sm')]: {
		display: 'none',
	},
}));

const GlobalSearch: React.FC = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const actions = useSearchActions();
	const [query, setQuery] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const resultsRef = useRef<HTMLDivElement>(null);

	const [dynamicResults, setDynamicResults] = useState<SearchAction[]>([]);
	const [loading, setLoading] = useState(false);

	const navigationResults = query.trim() === ''
		? []
		: actions.filter(action =>
			action.title.toLowerCase().includes(query.toLowerCase()) ||
			action.category.toLowerCase().includes(query.toLowerCase())
		);

	const filteredResults = [...navigationResults, ...dynamicResults];

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (!isOpen) setIsOpen(true);
			setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1));
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setSelectedIndex(prev => Math.max(prev - 1, 0));
		} else if (e.key === 'Enter') {
			if (selectedIndex >= 0 && selectedIndex < filteredResults.length) {
				handleSelect(filteredResults[selectedIndex]);
			}
		} else if (e.key === 'Escape') {
			setIsOpen(false);
			setSelectedIndex(-1);
			inputRef.current?.blur();
		}
	};

	const handleSelect = (action: SearchAction) => {
		navigate(action.path);
		setQuery('');
		setIsOpen(false);
		setSelectedIndex(-1);
		inputRef.current?.blur();
	};

	// Async search effect
	useEffect(() => {
		const fetchDynamicResults = async () => {
			if (query.trim().length < 2) {
				setDynamicResults([]);
				return;
			}

			setLoading(true);
			try {
				const [candidateData, userData, jobData, projectData] = await Promise.all([
					candidateService.getAll(0, 5, query),
					userService.search(query, 0, 5),
					x0paService.getJobs({ searchKey: query, limit: 5 })
						.catch(() => ({ jobs: [] })),
					dsrProjectService.getProjects(0, 5, false, query)
						.catch(() => ({ items: [] }))
				]);

				const candidateActions: SearchAction[] = candidateData.items.map(c => ({
					id: `candidate-${c.public_id}`,
					title: c.name,
					path: `/candidates/${c.public_id}`,
					category: 'Candidate',
					icon: CandidatesIcon
				}));

				const userActions: SearchAction[] = userData.map(u => ({
					id: `user-${u.id}`,
					title: u.full_name || u.username,
					path: `/users`,
					category: 'User',
					icon: UserIcon
				}));

				const jobActions: SearchAction[] = (jobData.jobs || []).map((j: any) => ({
					id: `job-${j.jobId}`,
					title: j.jobName,
					path: `/candidates/counseling`,
					category: 'Job Role',
					icon: CounselingIcon
				}));

				const projectActions: SearchAction[] = (projectData.items || []).map((p: any) => ({
					id: `project-${p.public_id}`,
					title: p.name,
					path: `/projects`, // Linking to projects list as detail might be complex
					category: 'Project',
					icon: ProjectIcon
				}));

				setDynamicResults([...candidateActions, ...userActions, ...jobActions, ...projectActions]);
			} catch (error) {
				console.error('Global search error:', error);
				setDynamicResults([]);
			} finally {
				setLoading(false);
			}
		};

		const timer = setTimeout(() => {
			if (isOpen) {
				fetchDynamicResults();
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [query, isOpen]);

	// Focus shortcut Alt+S
	useEffect(() => {
		const handleGlobalKeyDown = (e: KeyboardEvent) => {
			if (e.altKey && e.key === 's') {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};
		window.addEventListener('keydown', handleGlobalKeyDown);
		return () => window.removeEventListener('keydown', handleGlobalKeyDown);
	}, []);

	// Reset scroll for results list
	useEffect(() => {
		if (selectedIndex >= 0 && resultsRef.current) {
			const selectedItem = resultsRef.current.children[1]?.children[selectedIndex] as HTMLElement; // children[1] is the List
			if (selectedItem) {
				selectedItem.scrollIntoView({ block: 'nearest' });
			}
		}
	}, [selectedIndex]);

	// Close results on click outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (resultsRef.current && !resultsRef.current.contains(e.target as Node) &&
				inputRef.current && !inputRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const resultsId = 'global-search-results';

	return (
		<Box
			sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}
			role="combobox"
			aria-expanded={isOpen && filteredResults.length > 0}
			aria-haspopup="listbox"
			aria-controls={resultsId}
		>
			<SearchContainer>
				<SearchIconWrapper>
					<SearchIcon fontSize="small" />
				</SearchIconWrapper>
				<StyledInputBase
					placeholder="Search services, features, candidates [Alt+S]"
					inputRef={inputRef}
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setIsOpen(true);
						setSelectedIndex(0);
					}}
					onFocus={() => {
						if (query.trim() !== '') setIsOpen(true);
					}}
					onKeyDown={handleKeyDown}
					endAdornment={loading ? (
						<CircularProgress size={16} sx={{ color: alpha('#ffffff', 0.7), mr: 2 }} />
					) : null}
					inputProps={{
						'aria-label': 'Search for services, features, candidates or users',
						'aria-autocomplete': 'list',
						'aria-controls': resultsId,
						'aria-activedescendant': selectedIndex >= 0 ? `search-option-${selectedIndex}` : undefined
					}}
				/>
				<ShortcutHint aria-hidden="true">
					<Typography variant="inherit" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>Alt</Typography>
					<Typography variant="inherit" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>+</Typography>
					<Typography variant="inherit" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>S</Typography>
				</ShortcutHint>

				{isOpen && filteredResults.length > 0 && (
					<Paper
						ref={resultsRef}
						id={resultsId}
						role="listbox"
						elevation={4}
						sx={{
							position: 'absolute',
							top: 'calc(100% + 8px)',
							left: 0,
							right: 0,
							maxHeight: '400px',
							overflowY: 'auto',
							zIndex: 1400,
							backgroundColor: '#ffffff',
							borderRadius: '4px',
							border: `1px solid ${theme.palette.divider}`,
						}}
					>
						<Box sx={{ px: 2, py: 1, backgroundColor: '#f1f3f3', borderBottom: `1px solid ${theme.palette.divider}` }}>
							<Typography variant="caption" sx={{ fontWeight: 700, color: '#545b64', textTransform: 'uppercase' }}>
								Results ({filteredResults.length})
							</Typography>
						</Box>
						<List sx={{ py: 0 }}>
							{['General', 'Admin', 'Candidates', 'Projects', 'Training', 'Candidate', 'User', 'Job Role', 'Project'].map((cat) => {
								const catResults = filteredResults.filter(r => r.category === cat);
								if (catResults.length === 0) return null;

								return (
									<React.Fragment key={cat}>
										<Box sx={{ px: 2, py: 0.5, backgroundColor: '#f9f9f9', borderBottom: `1px solid ${theme.palette.divider}`, borderTop: cat !== 'General' ? `1px solid ${theme.palette.divider}` : 'none' }}>
											<Typography variant="caption" sx={{ fontWeight: 700, color: '#879596', textTransform: 'uppercase', fontSize: '0.65rem' }}>
												{cat === 'Candidate' || cat === 'User' || cat === 'Job Role' || cat === 'Project' ? `${cat}s` : cat}
											</Typography>
										</Box>
										{catResults.map((action) => {
											const resultIndex = filteredResults.indexOf(action);
											const Icon = action.icon;
											return (
												<ListItem key={action.id} disablePadding role="option" aria-selected={selectedIndex === resultIndex} id={`search-option-${resultIndex}`}>
													<ListItemButton
														selected={selectedIndex === resultIndex}
														onClick={() => handleSelect(action)}
														sx={{
															py: 0.75,
															'&.Mui-selected': {
																backgroundColor: alpha(theme.palette.primary.main, 0.08),
																'&:hover': {
																	backgroundColor: alpha(theme.palette.primary.main, 0.12),
																},
															},
														}}
													>
														<ListItemIcon sx={{ minWidth: 36, color: theme.palette.text.secondary }}>
															<Icon sx={{ fontSize: '1.2rem' }} />
														</ListItemIcon>
														<ListItemText
															primary={action.title}
															secondary={cat === 'Candidate' || cat === 'User' ? action.id.split('-')[1] : action.category}
															primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 500, color: '#232f3e' }}
															secondaryTypographyProps={{ fontSize: '0.7rem', color: '#545b64' }}
														/>
													</ListItemButton>
												</ListItem>
											);
										})}
									</React.Fragment>
								);
							})}
						</List>
					</Paper>
				)}
			</SearchContainer>
		</Box>
	);
};

export default GlobalSearch;
