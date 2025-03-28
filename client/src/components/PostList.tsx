import { Post } from "@/types/forum";

import EmptyPostsState from "./EmptyPostsState";
import PostItem from "./PostItem";

interface PostListProps {
  posts: Post[];
  togglePostLike: (postId: string) => void;
  onCommentSubmit: (postId: string, content: string) => void;
  onDeletePost?: (postId: string) => void;
  onEditPost?: (post: Post) => void;
  currentUserId: string;
}

const PostList = ({
  posts,
  togglePostLike,
  onCommentSubmit,
  onDeletePost,
  onEditPost,
  currentUserId,
}: PostListProps) => {
  if (posts.length === 0) {
    return <EmptyPostsState />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 space-y-6">
      {posts.map((post) => (
        <PostItem
          key={post._id}
          post={post}
          togglePostLike={togglePostLike}
          onCommentSubmit={onCommentSubmit}
          onDeletePost={onDeletePost}
          onEditPost={onEditPost}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};

export default PostList;
