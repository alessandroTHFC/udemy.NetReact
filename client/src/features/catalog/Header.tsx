import { ShoppingCart } from "@mui/icons-material";
import {
  AppBar,
  Badge,
  IconButton,
  List,
  Switch,
  Toolbar,
  Typography,
} from "@mui/material";
import ListItem from "@mui/material/ListItem";
import { Box } from "@mui/system";
import { Link, NavLink } from "react-router-dom";
import { useStoreContext } from "../../app/context/StoreContext";
import { useAppSelector } from "../../app/store/configureStore";

const midLinks = [
  { title: "catalog", path: "/catalog" },
  { title: "about", path: "/about" },
  { title: "contact", path: "/contact" },
];

const rightLinks = [
  { title: "login", path: "/login" },
  { title: "register", path: "/register" },
];

const navStyles = {
  textDecoration: "none",
  color: "inherit",
  typography: "h6",
  "&:hover": {
    color: "grey.500",
  },
  "&.active": {
    color: "text.secondary",
  },
};

interface Props {
  darkMode: boolean;
  handleThemeChange: () => void;
}

export default function Header({ darkMode, handleThemeChange }: Props) {
  const { basket } = useAppSelector((state) => state.basket);

  const itemCount = basket?.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    // ================================================================================\\
    // ================================================================================\\
    // General NavBar Elements (AppBar & ToolBar) and styling
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* ===================================================================== */}
        {/* ===================================================================== */}

        <Box display="flex" alignItems="center">
          {/* Element 1 STORE NAME and Toggle */}
          <Typography variant="h6" component={NavLink} to="/" sx={navStyles}>
            ReStore
          </Typography>

          {/*Toggle button that controls light/dark mode */}
          <Switch
            color="secondary"
            onChange={handleThemeChange}
            checked={darkMode}
          />
          {/* ===================================================================== */}
          {/* ===================================================================== */}
        </Box>

        {/* Element 2 MidLinks */}
        {/* List that loops over midLinks array to produce listItem links in 
            nav bar which route to different pages */}
        <List sx={{ display: "flex" }}>
          {midLinks.map(({ title, path }) => (
            <ListItem component={NavLink} to={path} key={path} sx={navStyles}>
              {title.toUpperCase()}
            </ListItem>
          ))}
        </List>
        {/* ===================================================================== */}
        {/* ===================================================================== */}

        <Box display="flex" alignItems="center">
          {/* Element 3 Shopping Cart Icon and RightLinks */}
          <IconButton
            component={Link}
            to="/basket"
            size="large"
            edge="start"
            color="inherit"
            sx={{ mr: 2 }}
          >
            <Badge badgeContent={itemCount} color="secondary">
              <ShoppingCart />
            </Badge>
          </IconButton>
          {/* List that loops over rightLinks array to produce listItem links in 
            nav bar which handle login and register */}
          <List sx={{ display: "flex" }}>
            {rightLinks.map(({ title, path }) => (
              <ListItem component={NavLink} to={path} key={path} sx={navStyles}>
                {title.toUpperCase()}
              </ListItem>
            ))}
          </List>
        </Box>
        {/* ===================================================================== */}
        {/* ===================================================================== */}
      </Toolbar>
    </AppBar>
  );
}
