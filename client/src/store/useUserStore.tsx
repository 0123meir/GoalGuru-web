import { create } from "zustand";

import DefaultProfilePhoto from "../assets/default-user.png";

interface UserState {
  userId: string;
  setUserId: (id: string) => void;
  username: string;
  setUsername: (name: string) => void;
  googleAuth: boolean;
  setGoogleAuth: (value: boolean) => void;
  userProfileImage: string;
  setUserProfileImage: (value: string) => void;
}

export const useUserStore = create<UserState>((set) => {
  const storeduserId = localStorage.getItem("userId") || "";
  const storedUsername = localStorage.getItem("username") || "";
  const storedGoogleAuth = localStorage.getItem("googleAuth") === "true";
  const storedProfileImage =
    localStorage.getItem("profilePhoto") || DefaultProfilePhoto;

  return {
    username: storedUsername,
    userId: storeduserId,
    setUserId: (id) => {
      localStorage.setItem("userId", id);
      set({ userId: id });
    },
    setUsername: (name) => {
      localStorage.setItem("username", name);
      set({ username: name });
    },
    googleAuth: storedGoogleAuth,
    setGoogleAuth: (value) => {
      localStorage.setItem("googleAuth", String(value));
      set({ googleAuth: value });
    },
    userProfileImage: storedProfileImage,
    setUserProfileImage: (value) => {
      localStorage.setItem("profilePhoto", String(value));
      set({ userProfileImage: value });
    },
  };
});
