import { ThemeProvider } from "@mui/material";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./theme/index.scss";
import { HelmetProvider } from "react-helmet-async";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorBoundary } from "./components/error-boundary/ErrorBoundary.tsx";
import { RootFallback } from "./components/error-boundary/RootFallback.tsx";
import { routes } from "./routing/routes.tsx";
import { theme } from "./theme.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary inCaseOfError={<RootFallback />}>
      <ThemeProvider theme={theme}>
        <HelmetProvider>
          <RouterProvider router={createBrowserRouter(routes)} />
        </HelmetProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
