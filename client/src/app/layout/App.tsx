import { Container, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material";
import { useState } from "react";
import Catalog from "../../features/catalog/Catalog";
import Header from "../../features/catalog/Header";

function App() {
  //* useState to handle the changing of modes
  const [darkMode, setDarkMode] = useState(false);

  //* Palette Type uses the state variable darkMode and is the variable
  //* inside the theme variable used in the theme provider.
  //* If darkMode is set to false(default) it will choose second option(light)
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header darkMode={darkMode} handleThemeChange={handleThemeChange} />
      <Container>
        <Catalog />
      </Container>
    </ThemeProvider>
  );
}

export default App;
