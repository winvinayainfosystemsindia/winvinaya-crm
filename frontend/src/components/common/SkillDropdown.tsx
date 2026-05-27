import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
	Autocomplete, 
	TextField, 
	CircularProgress, 
	ListSubheader, 
	Box, 
	useTheme, 
	alpha 
} from '@mui/material';
import {
	Storage as DbIcon,
	AutoAwesome as SparklesIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '../../store/store';
import { fetchAggregatedSkills, createSkill } from '../../store/slices/skillSlice';
import aiService from '../../services/aiService';
import useToast from '../../hooks/useToast';

interface SkillDropdownProps {
	value: any;
	onChange: (value: any) => void;
	multiple?: boolean;
	disabled?: boolean;
	label?: string;
	placeholder?: string;
	error?: boolean;
	helperText?: string;
	size?: 'small' | 'medium';
	renderTags?: (value: string[], getTagProps: any) => React.ReactNode;
}

const LOCAL_RECOMMENDATIONS: Record<string, string[]> = {
	"fastapi": ["Python", "Pydantic", "SQLAlchemy", "Uvicorn", "PostgreSQL", "REST API"],
	"fast api": ["Python", "Pydantic", "SQLAlchemy", "Uvicorn", "PostgreSQL", "REST API"],
	"excel": ["MS Excel", "Data Analysis", "VBA", "Power BI", "SQL", "Spreadsheets"],
	"ms excel": ["MS Excel", "Data Analysis", "VBA", "Power BI", "SQL", "Spreadsheets"],
	"agile": ["Scrum", "Jira", "Sprint Planning", "Kanban", "Product Backlog", "Project Management"],
	"agile me": ["Scrum", "Jira", "Sprint Planning", "Kanban", "Product Backlog", "Project Management"],
	"react": ["Redux", "TypeScript", "JavaScript", "HTML5", "CSS3", "Vite"],
	"reactjs": ["Redux", "TypeScript", "JavaScript", "HTML5", "CSS3", "Vite"],
	"microservices": ["Docker", "Kubernetes", "API Gateway", "Kafka", "gRPC", "Docker Compose"],
	"microservices architechtu": ["Docker", "Kubernetes", "API Gateway", "Kafka", "gRPC", "Docker Compose"],
	"python": ["Django", "Flask", "FastAPI", "Pandas", "NumPy", "SQLAlchemy"],
	"javascript": ["TypeScript", "React", "Node.js", "HTML5", "CSS3", "Next.js"],
	"typescript": ["React", "Node.js", "Angular", "NestJS", "JavaScript", "ES6+"],
	"docker": ["Kubernetes", "Docker Compose", "CI/CD", "AWS", "DevOps", "Nginx"],
	"kubernetes": ["Docker", "Helm", "AWS EKS", "DevOps", "Terraform", "CI/CD"]
};

/**
 * SkillDropdown Component
 * ======================
 * A premium, reusable dropdown component designed with glassmorphism aesthetics.
 * Divides selection options into two styled sections:
 * 1. "Database Skills" (aggregated existing skills from the db skills table)
 * 2. "AI Recommendations" (dynamic, debounced suggestions fetched from the AI service)
 */
const SkillDropdown: React.FC<SkillDropdownProps> = ({
	value,
	onChange,
	multiple = false,
	disabled = false,
	label = 'Competency / Skill Area',
	placeholder = 'Search or enter skill...',
	error = false,
	helperText = '',
	size = 'small',
	renderTags
}) => {
	const theme = useTheme();
	const toast = useToast();
	const dispatch = useDispatch<AppDispatch>();
	const { aggregatedSkills: masterSkills } = useSelector((state: RootState) => state.skills);

	const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
	const [loadingAi, setLoadingAi] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const timeoutRef = useRef<any>(null);

	// Ensure master skills are loaded on mount
	useEffect(() => {
		if (masterSkills.length === 0) {
			dispatch(fetchAggregatedSkills());
		}
	}, [dispatch, masterSkills.length]);

	// Fetch debounced AI recommendations when search query changes
	useEffect(() => {
		const query = searchQuery.trim();
		if (!query) {
			setAiRecommendations([]);
			return;
		}

		// Instantly set any local recommendations for immediate visual feedback!
		const cleanQuery = query.toLowerCase();
		let initialSuggestions: string[] = [];
		for (const [key, val] of Object.entries(LOCAL_RECOMMENDATIONS)) {
			if (key.includes(cleanQuery) || cleanQuery.includes(key)) {
				val.forEach((v) => {
					if (!initialSuggestions.includes(v)) {
						initialSuggestions.push(v);
					}
				});
			}
		}

		// Deduplicate and set instant recommendations
		const instantFiltered = initialSuggestions.filter(
			(rec) => !masterSkills.some((db) => db.toLowerCase() === rec.toLowerCase())
		);
		setAiRecommendations(instantFiltered);

		setLoadingAi(true);

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(async () => {
			try {
				const recommendations = await aiService.getSkillRecommendations([query]);
				// Combine local recommendations with any new AI recommendations from server
				const combined = Array.from(new Set([...instantFiltered, ...(recommendations || [])]));
				// Deduplicate suggestions already in the database
				const filtered = combined.filter(
					(rec) => !masterSkills.some((db) => db.toLowerCase() === rec.toLowerCase())
				);
				setAiRecommendations(filtered);
			} catch (error) {
				console.error('Failed to fetch AI skill recommendations', error);
			} finally {
				setLoadingAi(false);
			}
		}, 600); // 600ms debounce window for responsive feel

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [searchQuery, masterSkills]);

	// Build the unified list of grouped options
	const options = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) {
			return masterSkills;
		}

		const matchingDbSkills = masterSkills.filter((skill) =>
			skill.toLowerCase().includes(query)
		);

		return [...matchingDbSkills, ...aiRecommendations];
	}, [masterSkills, searchQuery, aiRecommendations]);

	return (
		<Autocomplete
			multiple={multiple}
			freeSolo
			filterOptions={(x) => x}
			options={options}
			value={value}
			onChange={(_, newValue) => {
				if (multiple) {
					const valuesArray = (newValue as string[]) || [];
					const lastValue = valuesArray[valuesArray.length - 1]?.trim();
					if (lastValue && !masterSkills.some((s) => s.toLowerCase() === lastValue.toLowerCase())) {
						dispatch(createSkill({ name: lastValue }))
							.unwrap()
							.then((res: any) => {
								toast.success(`Skill "${res.name}" successfully created in database!`);
							})
							.catch((err: any) => {
								toast.error(err || `Failed to create skill "${lastValue}"`);
							});
					}
					onChange(valuesArray);
				} else {
					const trimmedValue = (newValue as string || '').trim();
					if (trimmedValue && !masterSkills.some((s) => s.toLowerCase() === trimmedValue.toLowerCase())) {
						dispatch(createSkill({ name: trimmedValue }))
							.unwrap()
							.then((res: any) => {
								toast.success(`Skill "${res.name}" successfully created in database!`);
							})
							.catch((err: any) => {
								toast.error(err || `Failed to create skill "${trimmedValue}"`);
							});
					}
					onChange(newValue || '');
				}
			}}
			onInputChange={(_, newInputValue, reason) => {
				if (reason === 'input' || reason === 'clear') {
					setSearchQuery(newInputValue || '');
					if (!multiple) {
						onChange(newInputValue || '');
					}
				}
			}}
			renderTags={renderTags}
			groupBy={(option) => masterSkills.includes(option) ? 'Database Skills' : 'AI Recommendations'}
			disabled={disabled}
			loading={loadingAi}
			renderInput={(params) => (
				<TextField
					{...params}
					label={label}
					placeholder={placeholder}
					fullWidth
					size={size}
					error={error}
					helperText={helperText}
					InputLabelProps={{ shrink: true, sx: { fontWeight: 600 } }}
					sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
					InputProps={{
						...params.InputProps,
						endAdornment: (
							<React.Fragment>
								{loadingAi ? <CircularProgress color="inherit" size={16} /> : null}
								{params.InputProps.endAdornment}
							</React.Fragment>
						),
					}}
				/>
			)}
			renderGroup={(params) => (
				<Box key={params.key}>
					<ListSubheader
						sx={{
							fontWeight: 800,
							fontSize: '0.72rem',
							textTransform: 'uppercase',
							letterSpacing: '0.07em',
							color: params.group === 'Database Skills' ? 'primary.main' : 'secondary.main',
							bgcolor: alpha(theme.palette.background.paper, 0.95),
							py: 0.75,
							display: 'flex',
							alignItems: 'center',
							gap: 1,
							borderBottom: '1px solid',
							borderColor: 'divider',
							backdropFilter: 'blur(8px)',
						}}
					>
						{params.group === 'Database Skills' ? <DbIcon sx={{ fontSize: 14 }} /> : <SparklesIcon sx={{ fontSize: 14 }} />}
						{params.group}
					</ListSubheader>
					{params.children}
				</Box>
			)}
		/>
	);
};

export default SkillDropdown;
