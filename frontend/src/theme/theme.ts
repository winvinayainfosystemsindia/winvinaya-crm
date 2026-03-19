import { createTheme } from '@mui/material/styles';
import './smoothScroll';

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
	sectionTitle: {
		fontWeight: 700,
		fontSize: '0.9rem',
		color: '#232f3e',
		textTransform: 'uppercase' as const,
		letterSpacing: '0.05em'
	},
	awsPanel: {
		border: '1px solid #d5dbdb',
		borderRadius: '2px',
		p: 3,
		bgcolor: '#ffffff',
		boxShadow: '0 1px 1px 0 rgba(0,28,36,0.1)'
	},
	fieldLabel: {
		fontSize: '0.875rem',
		mb: 1,
		color: '#232f3e',
		fontWeight: 600,
		display: 'block'
	},
	helperBox: {
		bgcolor: '#f1faff',
		border: '1px solid #007eb9',
		borderRadius: '2px',
		p: 1.5,
		display: 'flex',
		alignItems: 'flex-start',
		gap: 1.5,
		mb: 3
	}
};

export default theme;
