import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "./routes";
import SnackbarProvider from "react-simple-snackbar";
import { ThemeProvider } from "./contexts/ThemeContext";

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <SnackbarProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
    </SnackbarProvider>
  </StrictMode>
);
