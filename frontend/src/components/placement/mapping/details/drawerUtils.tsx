import type { Theme } from '@mui/material';
import React from 'react';
import {
	Schedule as ScheduleIcon,
	LocalOffer as OfferIcon,
	Event as EventIcon,
	TaskAlt as SuccessIcon,
	HourglassTop as InProgressIcon,
	Handshake as HandshakeIcon,
	ThumbUp as JoinedIcon,
	ThumbDown as RejectedIcon,
	PersonSearch as SearchIcon,
} from '@mui/icons-material';

export const getDocumentPreviewUrl = (documentId: number, token: string | null): string => {
	if (!token) return '';
	const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
	return `${apiUrl}/api/v1/candidates/documents/${documentId}/download?token=${token}&disposition=inline`;
};

export const getStatusConfig = (status: string, theme: Theme) => {
	const statusKey = status.toLowerCase();

	const colors: Record<string, string> = {
		applied: theme.palette.info.main,
		shortlisted: theme.palette.success.main,
		interview_l1: theme.palette.accent.main,
		interview_l2: theme.palette.accent.main,
		technical_round: theme.palette.accent.main,
		hr_round: theme.palette.accent.main,
		offer_made: theme.palette.warning.main,
		offered: theme.palette.warning.main,
		offer_accepted: theme.palette.success.main,
		offer_rejected: theme.palette.error.main,
		joined: theme.palette.success.main,
		not_joined: theme.palette.error.main,
		dropped: theme.palette.text.secondary,
		rejected: theme.palette.error.main,
		on_hold: theme.palette.warning.main,
	};

	const icons: Record<string, React.ReactNode> = {
		applied: <SearchIcon sx={{ fontSize: 14 }} />,
		shortlisted: <SuccessIcon sx={{ fontSize: 14 }} />,
		interview_l1: <ScheduleIcon sx={{ fontSize: 14 }} />,
		interview_l2: <ScheduleIcon sx={{ fontSize: 14 }} />,
		technical_round: <EventIcon sx={{ fontSize: 14 }} />,
		hr_round: <HandshakeIcon sx={{ fontSize: 14 }} />,
		offer_made: <OfferIcon sx={{ fontSize: 14 }} />,
		offered: <OfferIcon sx={{ fontSize: 14 }} />,
		offer_accepted: <SuccessIcon sx={{ fontSize: 14 }} />,
		offer_rejected: <RejectedIcon sx={{ fontSize: 14 }} />,
		joined: <JoinedIcon sx={{ fontSize: 14 }} />,
		not_joined: <RejectedIcon sx={{ fontSize: 14 }} />,
		dropped: <InProgressIcon sx={{ fontSize: 14 }} />,
		rejected: <RejectedIcon sx={{ fontSize: 14 }} />,
		on_hold: <InProgressIcon sx={{ fontSize: 14 }} />,
	};

	return {
		color: colors[statusKey] || theme.palette.text.secondary,
		icon: icons[statusKey] || <InProgressIcon sx={{ fontSize: 14 }} />
	};
};

export const formatDateIST = (dateStr: string) => {
	if (!dateStr) return '-';
	const date = new Date(dateStr);
	return new Intl.DateTimeFormat('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		timeZone: 'Asia/Kolkata'
	}).format(date).replace(/ /g, '-');
};

export const formatTimeIST = (dateStr: string) => {
	if (!dateStr) return '-';
	const date = new Date(dateStr);
	return new Intl.DateTimeFormat('en-IN', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
		timeZone: 'Asia/Kolkata'
	}).format(date).toUpperCase();
};
