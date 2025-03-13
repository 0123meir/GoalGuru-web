import { useUserStore } from "@/store/useUserStore";

import useApiRequest from "@/hooks/useApiRequests";

export const useUserApi = () => {
  const { setUsername } = useUserStore();
  const api = useApiRequest();

  const updateUsername = async (id: string, username: string) => {
    try {
      const response = await api.put(`/users/${id}`, {
        username: username,
      });

      console.log(response.data);

      setUsername(response.data.username);
    } catch (error) {
      console.error("Failed to update step", error);
    }
  };

  return { updateUsername };
};
