import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#8c1d40',
      dark: '#701831',
      light: '#a84466',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FFC627',
      dark: '#e6b000',
      light: '#ffd54f',
      contrastText: '#000000',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#f57c00',
    },
    error: {
      main: '#c62828',
    },
    background: {
      default: '#FAFAFA',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        outlinedPrimary: {
          borderColor: '#8c1d40',
          color: '#8c1d40',
        },
      },
    },
  },
});

export default theme;
