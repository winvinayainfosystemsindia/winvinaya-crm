import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { store } from './store/store';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import SmoothScroll from "./components/layout/SmoothScroll";
import AuthInitializer from './components/auth/AuthInitializer';
import ChatWidget from './components/chat/ChatWidget';
import UpdateDetector from './components/common/UpdateDetector';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
          <UpdateDetector />
          <Router>
            <SmoothScroll>
              <AuthProvider>
                <AuthInitializer>
                  <AppRouter />
                </AuthInitializer>
              </AuthProvider>
            </SmoothScroll>
            <ChatWidget />
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
