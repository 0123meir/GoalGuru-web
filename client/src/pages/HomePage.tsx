import useApiRequests from "@/hooks/useApiRequests";
import useAuthTokens from "@/hooks/useAuthTokens";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const HomePage = () => {
  const navigate = useNavigate();
  const { clearTokens } = useAuthTokens();

  const handleLogout = () => {
    clearTokens();
    navigate("/login");
  };

  const api = useApiRequests();

  const fetchUserData = async () => {
    try {
      const response = await api.get("/posts");
      console.log(response.data);
    } catch (error) {
      console.error("API request failed:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl">Welcome to Home</h1>
      <button onClick={handleLogout} className="mt-4 bg-red-500 text-white p-2">
        Logout
      </button>
    </div>
  );
};
