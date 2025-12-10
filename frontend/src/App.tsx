import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { store } from './store/store';
import AppRouter from './router/AppRouter';
import SmoothScroll from "./components/layout/SmoothScroll";

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
          <SmoothScroll>
            <AuthProvider>
              <AppRouter />
            </AuthProvider>
          </SmoothScroll>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
