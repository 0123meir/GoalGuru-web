import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl">Welcome to Home</h1>
      <button onClick={handleLogout} className="mt-4 bg-red-500 text-white p-2">
        Logout
      </button>
    </div>
  );
};

export default Home;
