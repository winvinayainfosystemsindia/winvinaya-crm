import { createTheme } from '@mui/material/styles';
import './smoothScroll';

declare module '@mui/material/styles' {
	interface TypographyVariants {
		awsSectionTitle: React.CSSProperties;
		awsFieldLabel: React.CSSProperties;
	}
	interface TypographyVariantsOptions {
		awsSectionTitle?: React.CSSProperties;
		awsFieldLabel?: React.CSSProperties;
	}
}

declare module '@mui/material/Typography' {
	interface TypographyPropsVariantOverrides {
		awsSectionTitle: true;
		awsFieldLabel: true;
	}
}

const theme = createTheme({
	palette: {
		primary: {
			main: '#004de6', // Enterprise Blue
			light: '#4d88ff',
			dark: '#0033cc',
		},
		secondary: {
			main: '#0f172a', // Deep Slate / Navy
		},
		background: {
			default: '#f8fafc', // Modern split background
			paper: '#ffffff',
		},
		text: {
			primary: '#1e293b',
			secondary: '#64748b',
		},
		success: {
			main: '#10b981',
		},
		warning: {
			main: '#f59e0b',
		},
		error: {
			main: '#ef4444',
		},
		info: {
			main: '#3b82f6',
		}
	},
	typography: {
		fontFamily: '"Inter", "Inter UI", "Helvetica Neue", "Helvetica", "Arial", sans-serif',
		h4: {
			fontWeight: 700,
			letterSpacing: '-0.02em',
			fontSize: '1.75rem',
		},
		h5: {
			fontWeight: 700,
			letterSpacing: '-0.01em',
			fontSize: '1.5rem',
		},
		h6: {
			fontWeight: 700,
			fontSize: '1.125rem',
		},
		button: {
			textTransform: 'none',
			fontWeight: 600,
		},
		body1: {
			fontSize: '0.9375rem',
			lineHeight: 1.6,
		},
		body2: {
			fontSize: '0.875rem',
			lineHeight: 1.57,
		},
		awsSectionTitle: {
			fontWeight: 700,
			fontSize: '0.95rem',
			color: '#0f172a',
			textTransform: 'none', // Removed All-Caps for enterprise feel
			letterSpacing: '0',
			display: 'block'
		},
		awsFieldLabel: {
			fontSize: '0.8125rem',
			marginBottom: '6px',
			color: '#475569',
			fontWeight: 600,
			textTransform: 'uppercase', // Small caps labels are more professional
			letterSpacing: '0.05em',
			display: 'block'
		}
	},
	spacing: 8,
	shape: {
		borderRadius: 6, // Softer, more modern corners
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 6,
					padding: '8px 16px',
					boxShadow: 'none',
					'&:hover': {
						boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
					}
				},
				containedPrimary: {
					backgroundColor: '#004de6',
				}
			},
			defaultProps: {
				disableElevation: false,
			}
		},
		MuiAppBar: {
			defaultProps: {
				elevation: 0,
			},
			styleOverrides: {
				root: {
					borderBottom: '1px solid #e2e8f0',
				}
			}
		},
		MuiChip: {
			styleOverrides: {
				root: {
					borderRadius: 4,
					fontWeight: 600,
					fontSize: '0.75rem',
					height: '24px',
				},
				outlined: {
					borderColor: '#e2e8f0',
					backgroundColor: '#f8fafc',
				}
			}
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: 'none',
				},
				elevation1: {
					boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
				}
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
