export interface Comment {
  content: string;
  username: string;
  profileImage?: string;
}
export interface Post {
  _id: string;
  description: string;
  publishTime: Date;
  imageUrls: string[];
  poster: {
    _id: string;
    profileImage: string;
    username: string;
  };
  likesCount: number;
  isLikedByUser: boolean;
  comments: Comment[];
}
export interface PostDBEntity {
  _id: string;
  description: string;
  publishTime: Date;
  imageUrls: string[];
}
export interface newPost {
  description: string;
  images: File[];
}
