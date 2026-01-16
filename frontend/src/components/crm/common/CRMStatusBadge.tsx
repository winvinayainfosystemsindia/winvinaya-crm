import React from 'react';
import { Box, Typography } from '@mui/material';

export type BadgeType = 'lead' | 'deal' | 'task' | 'company' | 'generic';

interface CRMStatusBadgeProps {
	label: string;
	status: string;
	type?: BadgeType;
}

const getStatusStyles = (status: string, type: BadgeType) => {
	const s = status.toLowerCase();

	// Default colors (AWS style)
	const colors: Record<string, { bg: string; text: string; border: string }> = {
		// Success / Positive
		positive: { bg: '#f1faff', text: '#007eb9', border: '#007eb9' },
		success: { bg: '#edfaef', text: '#1d8102', border: '#1d8102' },
		// Warning / Neutral
		warning: { bg: '#fff9e6', text: '#8d6605', border: '#ff9900' },
		// Error / Negative
		negative: { bg: '#fdf3f1', text: '#d13212', border: '#d13212' },
		// Default / Gray
		default: { bg: '#f2f3f3', text: '#545b64', border: '#545b64' },
	};

	if (type === 'lead') {
		if (['qualified', 'converted'].includes(s)) return colors.success;
		if (['contacted', 'negatiation', 'proposal_sent'].includes(s)) return colors.positive;
		if (['new', 'nurturing'].includes(s)) return colors.warning;
		if (['lost'].includes(s)) return colors.negative;
	}

	if (type === 'deal') {
		if (['closed_won'].includes(s)) return colors.success;
		if (['proposal', 'negotiation', 'discovery', 'qualification'].includes(s)) return colors.positive;
		if (['on_hold'].includes(s)) return colors.warning;
		if (['closed_lost'].includes(s)) return colors.negative;
	}

	if (type === 'task') {
		if (['completed'].includes(s)) return colors.success;
		if (['in_progress'].includes(s)) return colors.positive;
		if (['pending', 'deferred'].includes(s)) return colors.warning;
		if (['cancelled'].includes(s)) return colors.negative;
	}

	if (['active', 'client', 'partner'].includes(s)) return colors.success;
	if (['prospect'].includes(s)) return colors.positive;
	if (['inactive'].includes(s)) return colors.negative;

	return colors.default;
};

const CRMStatusBadge: React.FC<CRMStatusBadgeProps> = ({ label, status, type = 'generic' }) => {
	const styles = getStatusStyles(status, type);

	return (
		<Box
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				px: 1.5,
				py: 0.25,
				borderRadius: '12px',
				bgcolor: styles.bg,
				border: `1px solid ${styles.border}`,
				color: styles.text,
			}}
		>
			<Typography
				variant="caption"
				sx={{
					fontWeight: 700,
					textTransform: 'uppercase',
					fontSize: '0.65rem',
					letterSpacing: '0.04em'
				}}
			>
				{label}
			</Typography>
		</Box>
	);
};

export default CRMStatusBadge;
