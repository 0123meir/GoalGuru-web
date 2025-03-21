import AppLogo from "@/assets/AppLogo";
import SplashIcon from "@/assets/SplashIcon";
import axios from "axios";

import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleCredentialResponse } from "@react-oauth/google";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useUserStore } from "@/store/useUserStore";

import useAuthTokens from "@/hooks/useAuthTokens";
import useLocalStorage from "@/hooks/useLocalStorage";

import { APIError } from "@/types/api";

export const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const { setItem } = useLocalStorage("userId");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const serverId = import.meta.env.VITE_SERVER_URL;
  const { setUsername, setGoogleAuth, setProfilePhoto } = useUserStore();

  const navigate = useNavigate();
  const { setTokens } = useAuthTokens();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    const endpoint = isLogin
      ? `${serverId}/auth/login`
      : `${serverId}/auth/register`;

    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await axios.post(endpoint, payload);
      setTokens(response.data.accessToken, response.data.refreshToken);
      setItem(response.data.id);
      setUsername(response.data.username);
      setGoogleAuth(false);
      setProfilePhoto(response.data.profileImage)

      navigate("/home");
    } catch (err) {
      const error = err as APIError;
      setError(error.response?.data.error || "An error occurred");
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: GoogleCredentialResponse
  ) => {
    try {
      const response = await axios.post(`${serverId}/auth/google`, {
        token: credentialResponse.credential,
      });

      setTokens(response.data.accessToken, response.data.refreshToken);
      setUsername(response.data.username);
      setGoogleAuth(true);

      navigate("/home");
    } catch (err) {
      const error = err as APIError;
      setError(error.response?.data.error || "Google login failed");
    }
  };

  const handleGoogleFailure = () => {
    setError("Google login failed");
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="flex items-center justify-evenly min-h-screen flex-row-reverse bg-blue-50">
        <div className="flex flex-col items-center">
          <SplashIcon />
        </div>
        <div className="w-full max-w-xl p-6 bg-blue-100 rounded-lg shadow-md">
          <AppLogo />
          <h2 className="text-2xl font-bold text-center mb-4">
            {isLogin ? "Login" : "Register"}
          </h2>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 pl-4 border rounded-full"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 pl-4 border rounded-full"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded-full"
              >
                {isLogin ? "Login" : "Register"}
              </button>

              <div className="text-center rounded-full" dir="rtl">
                <GoogleLogin
                  shape="circle"
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                />
              </div>
            </div>
          </form>

          <p className="text-center mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500 underline ml-1 rounded-full"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};
