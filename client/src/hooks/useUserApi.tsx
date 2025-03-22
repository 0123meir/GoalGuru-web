import { useUserStore } from "@/store/useUserStore";

import useApiRequest from "@/hooks/useApiRequests";

export const useUserApi = () => {
  const { setUsername, setUserProfileImage } = useUserStore();
  const api = useApiRequest();

  const updateUser = async (
    id: string,
    username: string,
    file: File | undefined = undefined
  ) => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      if (file) {
        formData.append("profileImage", file);
      }

      const response = await api.put(`/users/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUsername(response.data.username);
      setUserProfileImage(response.data.profileImage);
    } catch (error) {
      console.error("Failed to update step", error);
    }
  };

  return { updateUser };
};
