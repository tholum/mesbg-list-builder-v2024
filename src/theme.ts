import { createTheme } from "@mui/material";

export const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 800, // adjusted from the default 900
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    info: {
      main: "#17a2b8",
      light: "#36cee6",
      dark: "#0f6674",
      contrastText: "#FFF",
    },
  },
});
