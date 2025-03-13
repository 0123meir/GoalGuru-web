import { create } from "zustand";

interface UserState {
  username: string;
  setUsername: (name: string) => void;
  googleAuth: boolean;
  setGoogleAuth: (value: boolean) => void;
}

export const useUserStore = create<UserState>((set) => {
  const storedUsername = localStorage.getItem("username") || "";
  const storedGoogleAuth = localStorage.getItem("googleAuth") === "true";

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
  };
});
