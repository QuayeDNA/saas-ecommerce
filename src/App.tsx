import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
import { ThemeProvider } from "./design-system";
import { ToastProvider } from "./design-system/components/toast";
import "./App.css";
import "./design-system/theme.css";
import { AppProvider } from "./providers/app-provider";

function App() {
  const routeElement = useRoutes(routes);

  return (
    <ThemeProvider initialTheme="default">
      <ToastProvider>
        <AppProvider>{routeElement}</AppProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
