import { AppBar, Switch, Toolbar, Typography } from "@mui/material";

interface Props {
  darkMode: boolean;
  handleThemeChange: () => void;
}

export default function Header({ darkMode, handleThemeChange }: Props) {
  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar>
        <Typography variant="h6">ReStore</Typography>
        <Switch
          color="secondary"
          onChange={handleThemeChange}
          checked={darkMode}
        />
      </Toolbar>
    </AppBar>
  );
}
