import { createTheme } from '@mui/material/styles';

const theme = createTheme({
	palette: {
		primary: {
			main: '#ec7211', // AWS Orange-ish
		},
		secondary: {
			main: '#232f3e', // AWS Dark Blue
		},
		background: {
			default: '#f2f3f3', // Light gray background
			paper: '#ffffff',
		},
		text: {
			primary: '#16191f',
			secondary: '#545b64',
		}
	},
	typography: {
		fontFamily: '"Amazon Ember", "Helvetica Neue", "Helvetica", "Arial", sans-serif',
		h4: {
			fontWeight: 300,
			fontSize: '1.75rem',
			'@media (min-width:600px)': {
				fontSize: '2.125rem',
			},
		},
		h5: {
			fontWeight: 700,
			fontSize: '1.25rem',
			'@media (min-width:600px)': {
				fontSize: '1.5rem',
			},
		},
		h6: {
			fontWeight: 700,
			fontSize: '1rem',
			'@media (min-width:600px)': {
				fontSize: '1.25rem',
			},
		},
		button: {
			textTransform: 'none',
			fontWeight: 700,
		},
		body1: {
			fontSize: '0.875rem',
			'@media (min-width:600px)': {
				fontSize: '1rem',
			},
		},
		body2: {
			fontSize: '0.75rem',
			'@media (min-width:600px)': {
				fontSize: '0.875rem',
			},
		},
	},
	spacing: 8, // Basline 8px spacing
	breakpoints: {
		values: {
			xs: 0,
			sm: 600,
			md: 960,
			lg: 1280,
			xl: 1920,
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 2, // Slightly more squared
				},
				containedPrimary: {
					'&:hover': {
						backgroundColor: '#eb5f07',
					}
				}
			},
			defaultProps: {
				disableElevation: true,
			}
		},
		MuiAppBar: {
			defaultProps: {
				elevation: 0,
			}
		},
		MuiDrawer: {
			styleOverrides: {
				paper: {
					backgroundColor: '#f2f3f3',
					borderRight: '1px solid #d5dbdb',
				}
			}
		},
		MuiCssBaseline: {
			styleOverrides: {
				html: {
					scrollBehavior: 'smooth',
				},
				body: {
					"&, & *": {
						scrollbarColor: "#d5dbdb transparent",
						scrollbarWidth: 'thin',
					},
					"&::-webkit-scrollbar, & *::-webkit-scrollbar": {
						width: '4px',
						height: '4px',
					},
					"&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track": {
						background: 'transparent',
					},
					"&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
						background: '#d5dbdb',
						borderRadius: '10px',
					},
					"&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
						background: '#aab7b7',
					},
				},
			},
		},
	},
});

// Extend the theme with custom AWS console styles
export const awsStyles = {
	sectionTitle: (theme: any) => ({
		fontWeight: 700,
		fontSize: '0.875rem',
		color: theme.palette.text.secondary,
		mb: 1.5,
		textTransform: 'uppercase' as const,
		letterSpacing: '0.05em'
	}),
	awsPanel: (theme: any) => ({
		border: `1px solid ${theme.palette.divider}`,
		borderRadius: '2px',
		p: 3,
		bgcolor: theme.palette.background.paper,
		boxShadow: 'none'
	})
};

export default theme;
