import { useSnackbar, type VariantType } from 'notistack';
import { useCallback } from 'react';

const useToast = () => {
	const { enqueueSnackbar } = useSnackbar();

	const showToast = useCallback((message: string, variant: VariantType = 'default') => {
		enqueueSnackbar(message, {
			variant,
			anchorOrigin: {
				vertical: 'bottom',
				horizontal: 'right',
			}
		});
	}, [enqueueSnackbar]);

	return {
		showToast,
		success: (message: string) => showToast(message, 'success'),
		error: (message: string) => showToast(message, 'error'),
		info: (message: string) => showToast(message, 'info'),
		warning: (message: string) => showToast(message, 'warning'),
	};
};

export default useToast;
