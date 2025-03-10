import { useState } from "react";
import { MdEdit, MdForum, MdLogout, MdSave } from "react-icons/md";
import { useNavigate } from "react-router-dom";

import { useUserStore } from "@/store/useUserStore";

import useAuthTokens from "@/hooks/useAuthTokens";

import GoalGenerator from "@/components/GoalGenerator";
import GoalList from "@/components/GoalList";

export const HomePage = () => {
  const navigate = useNavigate();
  const { clearTokens } = useAuthTokens();
  const { username, googleAuth, setUsername } = useUserStore();

  const [isEditingUsername, setIsEditingUsername] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>(username);
  const handleLogout = () => {
    clearTokens();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 flex content-center w-full flex-row-reverse justify-between items-center">
        <div className="m-1">
          <button
            onClick={handleLogout}
            className="text-white p-2 m-2 hover:bg-blue-500 rounded-xl"
          >
            <MdLogout />
          </button>
          <button
            onClick={() => navigate("/forum")}
            className="text-white p-2 m-2 hover:bg-blue-500 rounded-xl"
          >
            <MdForum />
          </button>
        </div>

        {!googleAuth && (
          <div className="flex content-center justify-self-start">
            {isEditingUsername ? (
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="text-white m-2 p-2 pl-4 border-none focus:outline-none bg-blue-500 rounded-full"
              />
            ) : (
              <div className="mx-4 content-center text-white">{`Hello ${username}!`}</div>
            )}
            <button
              onClick={() => {
                if (!isEditingUsername && newUsername.trim() !== "") {
                  setIsEditingUsername((prev) => !prev);
                }

                if (isEditingUsername) {
                  setUsername(newUsername);
                  setIsEditingUsername((prev) => !prev);
                }
              }}
              className="text-white p-2 m-2 hover:bg-blue-500 rounded-xl"
            >
              {isEditingUsername ? <MdSave /> : <MdEdit />}
            </button>
          </div>
        )}
      </div>
      <div className="flex grow overflow-y-auto">
        <GoalList />
        <GoalGenerator />
      </div>
    </div>
  );
};
