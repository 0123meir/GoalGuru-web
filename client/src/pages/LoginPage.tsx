import { APIError } from "@/types/api";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleCredentialResponse } from "@react-oauth/google";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const serverId = import.meta.env.VITE_SERVER_URL;

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    const endpoint = isLogin
      ? `${serverId}/auth/login`
      : `${serverId}/auth/register`;

    const payload = isLogin
      ? { email, password }
      : { username, email, password };

    try {
      const response = await axios.post(endpoint, payload);
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
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

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-4">
            {isLogin ? "Login" : "Register"}
          </h2>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded"
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </form>

          <div className="text-center mt-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
            />
          </div>

          <p className="text-center mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500 underline ml-1"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};
