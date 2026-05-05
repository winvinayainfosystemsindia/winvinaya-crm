import type { ReactNode } from 'react';

export type DialogSeverity = 'info' | 'success' | 'warning' | 'error' | 'primary';

export interface BaseDialogProps {
	open: boolean;
	onClose: () => void;
	title: string;
	subtitle?: string;
	children: ReactNode;
	actions?: ReactNode;
	maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	fullWidth?: boolean;
	loading?: boolean;
	showCloseButton?: boolean;
}

export interface ConfirmationDialogProps extends Omit<BaseDialogProps, 'children' | 'actions'> {
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void | Promise<void>;
	severity?: DialogSeverity;
	icon?: ReactNode;
	children?: ReactNode;
}

export interface ImportDialogProps extends Omit<BaseDialogProps, 'children' | 'actions' | 'title'> {
	onImport: (file: File) => void | Promise<void>;
	acceptedFiles?: string;
	templateUrl?: string;
	onDownloadTemplate?: () => void | Promise<void>;
	title?: string;
}

export interface ExportDialogProps extends Omit<BaseDialogProps, 'children' | 'actions' | 'title'> {
	onExport: (format: 'excel' | 'csv') => void | Promise<void>;
	title?: string;
	recordCount?: number;
}
