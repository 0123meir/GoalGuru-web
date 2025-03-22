import { useUserStore } from "@/store/useUserStore";
import defaultUserImage from '@/assets/default-user.png'
export const useProfilePhoto = () => {
    const {userProfileImage} = useUserStore()
    const getProfilePhoto = (offlinePhoto: File | undefined) => (offlinePhoto ? URL.createObjectURL(offlinePhoto) : userProfileImage) ?? defaultUserImage;
      return {getProfilePhoto}
}