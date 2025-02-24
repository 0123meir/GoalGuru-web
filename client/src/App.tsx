import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { isValidToken } from "./utils/auth";
import useAuthTokens from "./hooks/useAuthTokens";

const App = () => {

  const {getTokens} = useAuthTokens()
  const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    return getTokens().accessToken ? (
      children
    ) : (
      <Navigate to="/login" />
    );
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isValidToken(getTokens().accessToken) ? (
              <Navigate to="/home" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
