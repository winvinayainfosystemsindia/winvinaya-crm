import React from 'react';
import { Card, CardContent, Typography, Box, Link, Popover, useTheme } from '@mui/material';

interface CandidateStatCardProps {
	total: number;
	male: number;
	female: number;
	others: number;
}

const CandidateStatCard: React.FC<CandidateStatCardProps> = ({ total, male, female, others }) => {
	const theme = useTheme();
	const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

	const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);

	return (
		<Card
			sx={{
				height: '100%',
				border: '1px solid #d5dbdb',
				boxShadow: 'none',
				borderRadius: 0, // AWS often uses sharp corners or very small radius
				'&:hover': {
					borderColor: theme.palette.primary.main,
				}
			}}
		>
			<CardContent sx={{ position: 'relative', p: 2 }}>
				<Typography
					variant="subtitle2"
					color="textSecondary"
					sx={{ fontWeight: 'bold', fontSize: '0.9rem', mb: 1 }}
				>
					Candidates Registered
				</Typography>

				<Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
					<Typography variant="h3" component="div" sx={{ fontWeight: 300, color: theme.palette.secondary.main }}>
						{(total || 0).toLocaleString()}
					</Typography>
				</Box>

				<Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
					<Link
						component="button"
						variant="body2"
						onClick={handlePopoverOpen}
						sx={{
							display: 'flex',
							alignItems: 'center',
							fontWeight: 'bold',
							color: theme.palette.primary.main,
							textDecoration: 'none',
							'&:hover': {
								textDecoration: 'underline'
							}
						}}
					>
						View Summary
					</Link>
				</Box>

				<Popover
					id="candidate-summary-popover"
					open={open}
					anchorEl={anchorEl}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'left',
					}}
					onClose={handlePopoverClose}
					PaperProps={{
						sx: {
							border: '1px solid #d5dbdb',
							boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
							borderRadius: 0,
							p: 2,
							minWidth: 200
						}
					}}
				>
					<Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold', color: theme.palette.secondary.main }}>
						Gender Distribution
					</Typography>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
						<Typography variant="body2" color="textSecondary">Male</Typography>
						<Typography variant="body2" fontWeight="bold">{male}</Typography>
					</Box>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
						<Typography variant="body2" color="textSecondary">Female</Typography>
						<Typography variant="body2" fontWeight="bold">{female}</Typography>
					</Box>
					<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
						<Typography variant="body2" color="textSecondary" sx={others > 0 ? { fontWeight: 'bold', color: theme.palette.primary.main } : {}}>
							Others
						</Typography>
						<Typography variant="body2" fontWeight="bold" sx={others > 0 ? { color: theme.palette.primary.main } : {}}>{others}</Typography>
					</Box>
				</Popover>
			</CardContent>
		</Card>
	);
};

export default CandidateStatCard;
