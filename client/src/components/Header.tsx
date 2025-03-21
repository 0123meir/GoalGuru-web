import { ChangeEvent, useRef, useState } from "react";
import { MdChecklist, MdEdit, MdForum, MdLogout, MdSave } from "react-icons/md";
import { useNavigate } from "react-router-dom";

import { useUserStore } from "@/store/useUserStore";

import useAuthTokens from "@/hooks/useAuthTokens";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useUserApi } from "@/hooks/useUserApi";
import { useProfilePhoto } from "@/hooks/useProfilePhoto";
import { MdUpload as UploadIcon, MdCancel as CancelIcon} from "react-icons/md";

interface HeaderProps {
  rightIcon: "forum" | "todo";
}
const Header = ({ rightIcon }: HeaderProps) => {
  const navigate = useNavigate();
  const { clearTokens } = useAuthTokens();
  const { username, googleAuth, setUsername } = useUserStore();
  const { updateUser } = useUserApi();
  const { getItem } = useLocalStorage("userId");
  const [isEditingUsername, setIsEditingUsername] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>(username);
  const ICONS_SIZE = 24;
  const handleLogout = () => {
    clearTokens();
    navigate("/login");
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {getProfilePhoto} = useProfilePhoto()

  const [image, setImage] = useState<File>();

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0])
    }
  }

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
        <div className="flex content-center justify-self-start items-center ml-1">

          {isEditingUsername ? (<>
            <div className="relative w-12 h-12">
            <img
              src={getProfilePhoto(image)}
              alt="User"
              className="w-12 h-12 rounded-full"
            />
            <input
                type="file"
                accept="image/png, image/jpeg"
                className="hidden"
                id="imageUpload"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
            <UploadIcon onClick={()=>fileInputRef.current?.click()} className="absolute top-0 left-0 w-12 h-12 text-white bg-white/20 hover:bg-white/50 p-1 rounded-full" />
            </div>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="text-white m-2 p-2 pl-4 border-none focus:outline-none bg-blue-500 rounded-full"
              />
              </>
          ) : (
            <>
            <img
              src={getProfilePhoto(image)}
              alt={"User"}
              className="w-12 h-12 rounded-full"
            />
            <div className="mx-4 content-center text-white">{`Hello ${username}!`}</div>
            </>
          )}
          <button
            onClick={async () => {
              if (!isEditingUsername && newUsername.trim() !== "") {
                setIsEditingUsername((prev) => !prev);
              }

              if (isEditingUsername) {
                setUsername(newUsername);
                await updateUser(getItem() as string, newUsername, image);
                setIsEditingUsername((prev) => !prev);
              }
            }}
            className="text-white p-2 hover:bg-blue-500 rounded-xl"
          >
            {isEditingUsername ? <MdSave  /> : <MdEdit />}
          </button>
          {isEditingUsername && <button
            onClick={() => {
              setIsEditingUsername((prev) => !prev);
            }}
            className="text-white p-2 hover:bg-blue-500 rounded-xl"
          >
            {<CancelIcon/>}
          </button>}
        </div>
      )}
    </div>
  );
};

export default Header;
