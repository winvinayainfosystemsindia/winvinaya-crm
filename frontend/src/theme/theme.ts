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
		h6: {
			fontWeight: 700,
		},
		button: {
			textTransform: 'none',
			fontWeight: 700,
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
				body: {
					scrollbarColor: "#6b7a90 #f2f3f3",
					"&::-webkit-scrollbar, & *::-webkit-scrollbar": {
						backgroundColor: "#f2f3f3",
						width: '8px',
						height: '8px',
					},
					"&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
						borderRadius: 8,
						backgroundColor: "#6b7a90",
						minHeight: 24,
						border: "2px solid #f2f3f3",
					},
				},
			},
		},
	},
});

export default theme;
