import GoalGenerator from "@/components/GoalGenerator";
import GoalList from "@/components/GoalList";
import useApiRequests from "@/hooks/useApiRequests";
import useAuthTokens from "@/hooks/useAuthTokens";
import { useNavigate } from "react-router-dom";

export const HomePage = () => {
  const navigate = useNavigate();
  const { clearTokens } = useAuthTokens();

  const handleLogout = () => {
    clearTokens();
    navigate("/login");
  };

  return (
    <div className="flex h-screen">
      <GoalList/>
      <GoalGenerator/>
      <div className="grow">
      <h1 className="text-3xl">Welcome to Home</h1>
      <button onClick={() => navigate("/forum") } className="mt-4 bg-red-500 text-white p-2" >Forum</button>
      <button onClick={handleLogout} className="mt-4 bg-red-500 text-white p-2">
        Logout
      </button>
      </div>
    </div>
  );
};
