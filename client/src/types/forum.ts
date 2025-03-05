export interface Post {
  _id: string;
  userPhoto: string;
  userName: string;
  description: string;
  publishTime: string;
  images: string[];
  likesCount: number;
  isLikedByUser: boolean;
  comments: Comment[];
}
export interface newPost {
  description: string;
  images: File[];
}

interface Comment {
  _id: string;
  content: string;
  commentorId: string;
  postId: string;
}
