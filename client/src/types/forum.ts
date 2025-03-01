export interface Post {
  id: string;
  userPhoto: string;
  userName: string;
  description: string;
  time: string;
  photos: string[];
  likes: number;
  isLikedByUser: boolean;
  comments: { user: string; text: string }[];
}