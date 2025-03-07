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
    profileImage: string;
    username: string;
  };
  likesCount: number;
  isLikedByUser: boolean;
  comments: Comment[];
}

export interface newPost {
  description: string;
  images: File[];
}
