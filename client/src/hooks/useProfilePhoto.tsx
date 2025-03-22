import defaultUserImage from "@/assets/default-user.png";

import { useUserStore } from "@/store/useUserStore";

export const useProfilePhoto = () => {
  const { userProfileImage } = useUserStore();
  const getProfilePhoto = (offlinePhoto: File | undefined) =>
    (offlinePhoto ? URL.createObjectURL(offlinePhoto) : userProfileImage) ??
    defaultUserImage;
  return { getProfilePhoto };
};
