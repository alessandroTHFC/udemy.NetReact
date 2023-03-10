import { Container, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Header from "./Header";
import "react-toastify/dist/ReactToastify.css";
import LoadingComponent from "./LoadingComponent";
import { useAppDispatch } from "../store/configureStore";
import { fetchBasketAsync } from "../../features/basket/basketSlice";
import { fetchCurrentUser } from "../../features/account/accountSlice";

function App() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  const initApp = useCallback(async () => {
    try {
      await dispatch(fetchCurrentUser());
      await dispatch(fetchBasketAsync());
    } catch (error: any) {
      console.log(error);
    }
  }, [dispatch]);

  //* use effect to fetch basket on app start if there is one
  //* uses the get cookie function to get the buyerid cookie from the browser
  //* also sets the loading state to false so the loading spinner stops.
  //* setBasket functionality now being provided by React Context in StoreContext
  useEffect(() => {
    initApp().then(() => setLoading(false));
  }, [initApp]);

  //* useState to handle the changing of modes
  const [darkMode, setDarkMode] = useState(false);

  //* Palette Type uses the state variable darkMode and is the variable
  //* inside the theme variable used in the theme provider.
  //* If darkMode is set to false(default) it will choose second option
  const paletteType = darkMode ? "dark" : "light";

  //* theme uses the createTheme function which is used by the ThemeProvider component/Wrapper
  const theme = createTheme({
    palette: {
      mode: paletteType,
      background: {
        default: paletteType === "light" ? "#eaeaea" : "#121212",
      },
    },
  });

  //* This function is passed down as a prop to the header, to be accessed on toggle change.
  function handleThemeChange() {
    setDarkMode(!darkMode);
  }

  if (loading) return <LoadingComponent message="Initialising App" />;

  return (
    <ThemeProvider theme={theme}>
      {/* Toast Container allows errors messages to appear in bottom right of screen */}
      <ToastContainer position="bottom-right" hideProgressBar theme="colored" />
      <CssBaseline />
      <Header darkMode={darkMode} handleThemeChange={handleThemeChange} />
      <Container>
        {/* Outlet is feature of react router dom when routing, outlet will be swapped 
        to whatever components we are routing to */}
        <Outlet />
      </Container>
    </ThemeProvider>
  );
}

export default App;
