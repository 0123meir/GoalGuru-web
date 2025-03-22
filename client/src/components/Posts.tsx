import React, { useState } from "react";
import { Post } from "@/types/forum";
import PostList from "./PostList";
import CreatePostButton from "./CreatePostButton";
import CreateEditPostForm from "./CreateEditPostForm";
import PostTabs from "./PostTabs";

type Tab = "myPosts" | "Explore";

interface PostsPageProps {
  myPosts: Post[];
  explorePosts: Post[];
  togglePostLike: (postId: string) => void;
  onCommentSubmit: (postId: string, content: string) => void;
  onDeletePost: (postId: string) => void;
  onCreatePost: (formData: FormData) => void;
  onEditPost: (postId: string, formData: FormData) => void;
  currentUserId: string;
}

const PostsPage: React.FC<PostsPageProps> = ({
  myPosts,
  explorePosts,
  togglePostLike,
  onCommentSubmit,
  onDeletePost,
  onCreatePost,
  onEditPost,
  currentUserId
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("myPosts");
  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };
  
  const handleOpenCreateModal = () => {
    setSelectedPost(null);
    setIsCreateEditModalOpen(true);
  };
  
  const handleOpenEditModal = (post: Post) => {
    setSelectedPost(post);
    setIsCreateEditModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsCreateEditModalOpen(false);
    setSelectedPost(null);
  };
  
  const handleSubmitPost = (postId: string | null, formData: FormData) => {
    if (postId) {
      onEditPost(postId, formData);
    } else {
      onCreatePost(formData);
    }
  };
  
  const displayPosts = activeTab === "myPosts" ? myPosts : explorePosts;
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header Tabs */}
      <header className="sticky top-0 z-10">
        <PostTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto relative pb-16">
          <PostList
            posts={displayPosts}
            togglePostLike={togglePostLike}
            onCommentSubmit={onCommentSubmit}
            onDeletePost={activeTab === "myPosts" ? onDeletePost : undefined}
            onEditPost={activeTab === "myPosts" ? handleOpenEditModal : undefined}
            currentUserId={currentUserId}
          />
          
          {/* Create Post Button (only show on My Posts tab) */}
          {activeTab === "myPosts" && (
            <div className="sticky bottom-4 flex justify-end">
              <CreatePostButton onClick={handleOpenCreateModal} />
            </div>
          )}
        </div>
      </main>
      
      {/* Create/Edit Post Modal */}
      <CreateEditPostForm
        isOpen={isCreateEditModalOpen}
        onClose={handleCloseModal}
        handleSubmit={handleSubmitPost}
        post={selectedPost}
      />
    </div>
  );
};

export default PostsPage;