import { useEffect, useState } from "react";

import useApiRequests from "@/hooks/useApiRequests";
import useLocalStorage from "@/hooks/useLocalStorage";

import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";

import { Post } from "@/types/forum";

import NewPostForm from "../components/NewPostForm";
import { Posts } from "../components/Posts";

export const ForumPage = () => {
  type Tab = "myPosts" | "Explore";
  const [activeTab, setActiveTab] = useState<Tab>("myPosts");
  const [posts, setPosts] = useState<Post[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getItem } = useLocalStorage("userId");
  const userId = getItem();
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
  }, []);
  
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

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
        await likePost(postId);
      } else {
        await unlikePost(postId);
      }
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Failed to toggle like for post with id:", postId, error);
    }
  };

  const likePost = async (postId: string) => {
    try {
      await api.post("/likes", { postId });
    } catch (error) {
      console.error(error);
      throw new Error("Failed to like post");
    }
  };

  const unlikePost = async (postId: string) => {
    try {
      await api.delete(`/likes/${postId}`);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to unlike post");
    }
  };

  const handleNewPostSubmit = async (formData: FormData) => {
    try {
      const response = await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newPost = {
        ...response.data.post,
        publishDate: new Date(response.data.post.publishDate),
      };
      setPosts((prevPosts) => [newPost, ...(prevPosts || [])]);
    } catch (error) {
      console.error("Error submitting new post:", error);
    }
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

  if (loading) {
    return <LoadingScreen text="Please wait while we search for posts." />;
  }

  function getFriendsPosts() {
    return posts ? posts?.filter((post) => post._id !== userId) : [];
  }

  function getOwnPosts() {
    return posts ? posts?.filter((post) => post.poster._id === userId) : [];
  }

  return (
    <>
      <Header rightIcon={"todo"}/>
      <NewPostForm
        handleNewPostSubmit={handleNewPostSubmit}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="flex flex-col bg-gray-100 min-h-screen">
        <div className="flex my-4 border-b-2 border-gray-300 w-full items-center justify-center top-0 bg-gray-100 z-10">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-t-lg border-b-4 ${
                activeTab === "myPosts"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => handleTabChange("myPosts")}
            >
              My Posts
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg border-b-4 ${
                activeTab === "Explore"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => handleTabChange("Explore")}
            >
              Explore Posts
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute ml-4 left-0 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          >
            Create New Post
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "myPosts" && (
            <Posts
              posts={getOwnPosts()}
              togglePostLike={togglePostLike}
              onCommentSubmit={handleCommentSubmit}
            />
          )}
          {activeTab === "Explore" && (
            <Posts
              posts={getFriendsPosts()}
              togglePostLike={togglePostLike}
              onCommentSubmit={handleCommentSubmit}
            />
          )}
        </div>
      </div>
    </>
  );
};
