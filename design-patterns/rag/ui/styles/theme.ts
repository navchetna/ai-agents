import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#E4D96F',
    },
    secondary: {
      main: '#C0C0C0',
    },
    background: {
      default: '#F0F0F0',
    },
  },
  typography: {
    fontFamily: 'Aptos, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
})

export default theme

