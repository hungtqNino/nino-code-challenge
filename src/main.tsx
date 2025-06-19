import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "@/assets/styles/global-styles";
import "@/index.css";
import App from "@/app";

const theme = {
  colors: {
    primary: "#1e3a8a",
    secondary: "#1e40af",
  },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <App />
    </ThemeProvider>
  </StrictMode>
);
