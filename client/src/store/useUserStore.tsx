import { create } from "zustand";
import DefaultProfilePhoto from '../assets/default-user.png'
interface UserState {
  username: string;
  setUsername: (name: string) => void;
  googleAuth: boolean;
  setGoogleAuth: (value: boolean) => void;
  profilePhoto: string;
  setProfilePhoto: (value: string) => void;
}

export const useUserStore = create<UserState>((set) => {
  const storedUsername = localStorage.getItem("username") || "";
  const storedGoogleAuth = localStorage.getItem("googleAuth") === "true";
  const profilePhoto = localStorage.getItem("profilePhoto") || DefaultProfilePhoto;

  return {
    username: storedUsername,
    setUsername: (name) => {
      localStorage.setItem("username", name);
      set({ username: name });
    },
    googleAuth: storedGoogleAuth,
    setGoogleAuth: (value) => {
      localStorage.setItem("googleAuth", String(value));
      set({ googleAuth: value });
    },
    profilePhoto: profilePhoto,
    setProfilePhoto: (value) => {
      localStorage.setItem("profilePhoto", String(value));
      set({profilePhoto: value})
    }
  };
});
