import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#e8b84b" },
    error: { main: "#e53935" },
    background: {
      default: "#0d0d13",
      paper: "#1a1a26",
    },
    text: {
      primary: "#f0f0f0",
      secondary: "#888899",
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
          "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
        },
      },
    },
  },
});

export default theme;
