import { useRoutes } from 'react-router-dom';
import { routes } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './design-system';
import { ToastProvider } from './design-system/components/toast';
import './App.css';
import './design-system/theme.css';

function App() {
  const routeElement = useRoutes(routes);

  return (
    <ThemeProvider initialTheme="default">
      <ToastProvider>
        <AuthProvider>
          {routeElement}
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
