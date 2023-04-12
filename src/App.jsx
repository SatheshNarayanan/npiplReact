import logo from "./logo.svg";
import "./App.css";
import LoginPage from "./Pages/LoginPage/LoginPage";
import ApplicaitonContextProvider from "./contexts/ApplicaitonContext";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./Pages/Dashboard/Dashboard";
import ButtonAppBar from "./Components/AppBar";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { green, purple } from '@mui/material/colors';


const theme = createTheme({
  palette: {
    primary: {
      main: "#ED9CAD",
    },
    secondary: {
      main: green[500],
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/Dashboard",
    element: <ButtonAppBar children={<Dashboard />} />,
  },
]);

function App() {
  return (
    <ThemeProvider theme={theme}>

    <ApplicaitonContextProvider>
      <RouterProvider router={router} />
    </ApplicaitonContextProvider>
    </ThemeProvider>

  );
}

export default App;
