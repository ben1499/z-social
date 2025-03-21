import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "./routes.jsx";
import SnackbarProvider from "react-simple-snackbar";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SnackbarProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
    </SnackbarProvider>
  </StrictMode>
);
