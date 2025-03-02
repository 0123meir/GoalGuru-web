export interface Post {
  _id: string;
  userPhoto: string;
  userName: string;
  description: string;
  publishTime: string;
  photos: string[];
  likesCount: number;
  isLikedByUser: boolean;
  comments: Comment[];
}

interface Comment {
  _id: string;
  content: string;
  commentorId: string;
  postId: string;
}