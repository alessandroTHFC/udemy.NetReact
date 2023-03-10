import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/configureStore";

function RequireAuth() {
  const { user } = useAppSelector((state) => state.account);

  //* COMMENT: Redirect user back to where they came from.
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return <Outlet />;
}

export default RequireAuth;
