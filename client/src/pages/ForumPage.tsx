import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import useApiRequests from "@/hooks/useApiRequests";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import { Post } from "@/types/forum";
import CreateEditPostForm from "../components/CreateEditPostForm";
import PostList from "../components/PostList";
import PostTabs from "../components/PostTabs";
import CreatePostButton from "../components/CreatePostButton";

export const ForumPage = () => {
  type Tab = "myPosts" | "Explore";
  const [activeTab, setActiveTab] = useState<Tab>("myPosts");
  const [posts, setPosts] = useState<Post[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const { userId, username, userProfileImage } = useUserStore();
  const api = useApiRequests();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsRes = await api.get("/posts/");
        setPosts(postsRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchPosts();
  }, [username, userProfileImage]);

  const togglePostLike = async (postId: string) => {
    const post = posts?.find((post) => post._id === postId);
    if (!post) return;

    const isLikedByUser = !post.isLikedByUser;
    const updatedPosts = posts?.map((post) =>
      post._id === postId
        ? {
            ...post,
            isLikedByUser,
            likesCount: isLikedByUser
              ? post.likesCount + 1
              : post.likesCount - 1,
          }
        : post
    );

    try {
      if (isLikedByUser) {
        await api.post("/likes", { postId });
      } else {
        await api.delete(`/likes/${postId}`);
      }
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Failed to toggle like for post with id:", postId, error);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prevPosts) => prevPosts?.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("Failed to delete post with id:", postId, error);
    }
  };

  const handlePostSubmit = async (
    postId: string | null,
    formData: FormData
  ) => {
    try {
      if (postId) {
        // Update existing post
        const res = await api.put(`/posts/${postId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log(res.data);
        
        // Update the post in the state
        setPosts((prevPosts) =>
          prevPosts?.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  description: res.data.post.description,
                  imageUrls: res.data.post.imageUrls,
                }
              : post
          )
        );
      } else {
        // Create new post
        const res = await api.post("/posts", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const newPost: Post = {
          ...res.data.post,
          comments: [],
          isLikedByUser: false,
          likesCount: 0,
          poster: {
            _id: userId,
            profileImage: userProfileImage,
            username,
          },
        };
        setPosts((prevPosts) => [newPost, ...(prevPosts || [])]);
      }

      // Reset the editing state
      setEditingPost(null);
    } catch (error) {
      console.error("Error submitting post:", error);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const handleCommentSubmit = async (postId: string, content: string) => {
    try {
      const response = await api.post("/comments/", { content, postId });
      const updatedPosts = posts?.map((post) =>
        post._id === postId
          ? {
              ...post,
              comments: [...post.comments, response.data.comment],
            }
          : post
      );
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const getFriendsPosts = () =>
    posts ? posts.filter((post) => post.poster._id !== userId) : [];

  const getOwnPosts = () =>
    posts ? posts.filter((post) => post.poster._id === userId) : [];

  if (loading) {
    return <LoadingScreen text="Please wait while we search for posts." />;
  }
  
  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <Header rightIcon={"todo"} />
      
      <CreateEditPostForm
        handleSubmit={handlePostSubmit}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        post={editingPost}
      />
      
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto w-full relative">
          <PostTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <CreatePostButton onClick={() => setIsModalOpen(true)} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-4 pb-20">
        {activeTab === "myPosts" && (
          <PostList
            posts={getOwnPosts()}
            togglePostLike={togglePostLike}
            onCommentSubmit={handleCommentSubmit}
            onDeletePost={deletePost}
            onEditPost={handleEditPost}
            currentUserId={userId}
          />
        )}
        {activeTab === "Explore" && (
          <PostList
            posts={getFriendsPosts()}
            togglePostLike={togglePostLike}
            onCommentSubmit={handleCommentSubmit}
            currentUserId={userId}
          />
        )}
      </div>
    </div>
  );
};