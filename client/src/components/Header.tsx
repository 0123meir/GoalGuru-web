import { useState } from "react";
import { MdChecklist, MdEdit, MdForum, MdLogout, MdSave } from "react-icons/md";
import { useNavigate } from "react-router-dom";

import { useUserStore } from "@/store/useUserStore";

import useAuthTokens from "@/hooks/useAuthTokens";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useUserApi } from "@/hooks/useUserApi";

interface HeaderProps {
  rightIcon: "forum" | "todo";
}
const Header = ({ rightIcon }: HeaderProps) => {
  const navigate = useNavigate();
  const { clearTokens } = useAuthTokens();
  const { username, googleAuth, setUsername } = useUserStore();
  const { updateUsername } = useUserApi();
  const { getItem } = useLocalStorage("userId");
  const [isEditingUsername, setIsEditingUsername] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>(username);
  const ICONS_SIZE = 24;
  const handleLogout = () => {
    clearTokens();
    navigate("/login");
  };

  return (
    <div className="bg-blue-600 flex content-center w-full flex-row-reverse justify-between items-center sticky top-0 z-50">
      <div className="m-1">
        <button
          onClick={() =>
            rightIcon === "forum" ? navigate("/forum") : navigate("/home")
          }
          className="text-white p-2 m-2 hover:bg-blue-500 rounded-xl"
        >
          {rightIcon === "forum" ? (
            <MdForum size={ICONS_SIZE} />
          ) : (
            <MdChecklist size={ICONS_SIZE} />
          )}
        </button>
        <button
          onClick={handleLogout}
          className="text-white p-2 m-2 hover:bg-blue-500 rounded-xl"
        >
          <MdLogout size={ICONS_SIZE} />
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
            onClick={async () => {
              if (!isEditingUsername && newUsername.trim() !== "") {
                setIsEditingUsername((prev) => !prev);
              }

              if (isEditingUsername) {
                setUsername(newUsername);
                await updateUsername(getItem() as string, newUsername);
                setIsEditingUsername((prev) => !prev);
              }
            }}
            className="text-white p-2 hover:bg-blue-500 rounded-xl"
          >
            {isEditingUsername ? <MdSave  /> : <MdEdit />}
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
