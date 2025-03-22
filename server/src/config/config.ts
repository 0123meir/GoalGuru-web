import path from "path";

export const postImagesDirectory = path.join(
  __dirname,
  "../../../images_storage/post_images"
);

export const profileImagesDirectory = path.join(
  __dirname,
  "../../../images_storage/profile_images"
);

export const serverUrl = process.env.SERVER_URL || "https://localhost:5000";
export const formatProfileImage = (profileImage: string) =>{
  const normalizedPath = profileImage.replace(/\\/g, "/");
  return profileImage.includes('google') ? profileImage : `${serverUrl}/profile_images/${path.basename(normalizedPath)}`
}
export const formatPostImage = (image: string) =>
{
  const normalizedPath = image.replace(/\\/g, "/");
  return `${serverUrl}/images/${path.basename(normalizedPath)}`;
}
