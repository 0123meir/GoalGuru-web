import { useNavigate } from "react-router-dom";
import { MdForum, MdLogout } from "react-icons/md";

import useAuthTokens from "@/hooks/useAuthTokens";

import GoalGenerator from "@/components/GoalGenerator";
import GoalList from "@/components/GoalList";

export const HomePage = () => {
  const navigate = useNavigate();
  const { clearTokens } = useAuthTokens();

  const handleLogout = () => {
    clearTokens();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-screen">
<div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 flex align-middle w-full flex-row-reverse">
      <button onClick={handleLogout} className="text-white p-2 m-2 hover:bg-blue-500 rounded-xl">
        <MdLogout/>
      </button>
      <button
        onClick={() => navigate("/forum")}
        className="text-white p-2 m-2 hover:bg-blue-500 rounded-xl"
      >
        <MdForum/>
      </button>
  </div>
      <div className="flex grow overflow-y-auto">
        <GoalList />
        <GoalGenerator />
      </div>
    </div>
  );
};
