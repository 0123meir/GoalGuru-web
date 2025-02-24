import useLocalStorage from "./useLocalStorage"; 

function useAuthTokens() {
  const accessTokenStorage = useLocalStorage<string | null>("accessToken");
  const refreshTokenStorage = useLocalStorage<string | null>("refreshToken");

  const getTokens = () => ({
    accessToken: accessTokenStorage.getItem(),
    refreshToken: refreshTokenStorage.getItem(),
  });

  const setTokens = (accessToken: string | null, refreshToken: string | null) => {
    accessTokenStorage.setItem(accessToken);
    refreshTokenStorage.setItem(refreshToken);
  };

  const clearTokens = () => {
    setTokens(null, null);
  };

  return { getTokens, setTokens, clearTokens };
}

export default useAuthTokens;
