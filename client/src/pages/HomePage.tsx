import GoalGenerator from "@/components/GoalGenerator";
import GoalList from "@/components/GoalList";
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
    <div className="flex flex-col h-screen">
      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700">
        <button
          onClick={() => navigate("/forum")}
          className="mt-4 text-white p-2"
        >
          Forum
        </button>
        <button
          onClick={handleLogout}
          className="mt-4 text-white p-2"
          >
          Logout
        </button>
      </div>
    <div className="flex grow">
      <GoalList />
      <GoalGenerator />
    </div>
          </div>
  );
};
