import { useUserStore } from "@/store/useUserStore";

export const useProfilePhoto = () => {
    const {profilePhoto} = useUserStore()
    const getProfilePhoto = (offlinePhoto: File | undefined) => offlinePhoto ? URL.createObjectURL(offlinePhoto) : profilePhoto;
      return {getProfilePhoto}
}