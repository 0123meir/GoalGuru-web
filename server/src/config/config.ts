import path from "path";

export const postImagesDirectory = path.join(
  __dirname,
  "../../images_storage/post_images"
);

export const profileImagesDirectory = path.join(
  __dirname,
  "../../images_storage/profile_images"
);

export const serverUrl = process.env.SERVER_URL || "https://localhost:5000";
export const formatProfileImage = (profileImage: string) =>
  `${serverUrl}/profile_images/${path.basename(profileImage)}`
export const formatPostImage = (image: string) =>
  `${serverUrl}/images/${path.basename(image)}`;
