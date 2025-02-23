import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/LoginPage";
import Home from "./pages/HomePage";


function App() {
  const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    return localStorage.getItem("accessToken") ? children : <Navigate to="/login" />;
  };
  
 
  return (
    <Router>
 <Routes>
    <Route path="/" element={<Navigate to="/login" />} />
    <Route path="/login" element={<Login />} />
    <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
  </Routes>
    </Router>
  );
}

export default App;