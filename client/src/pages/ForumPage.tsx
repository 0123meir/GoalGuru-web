import LoadingScreen from "@/components/LoadingScreen";
import useApiRequests from "@/hooks/useApiRequests";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Post } from "@/types/forum";
import { useEffect, useState } from "react";

import NewPostForm from "../components/NewPostForm";
import { Posts } from "../components/Posts";

export const ForumPage = () => {
  type Tab = "myPosts" | "Explore";
  const [activeTab, setActiveTab] = useState<Tab>("myPosts");
  const [posts, setPosts] = useState<Post[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
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
    <div>
      <div className="flex justify-center my-4 border-b-2 border-gray-300">
        <button
          className={`px-4 py-2 mx-2 rounded-t-lg border-b-4 ${
            activeTab === "myPosts"
              ? "border-blue-500 text-blue-500"
              : "border-transparent text-gray-500"
          }`}
          onClick={() => handleTabChange("myPosts")}
        >
          My Posts
        </button>
        <button
          className={`px-4 py-2 mx-2 rounded-t-lg border-b-4 ${
            activeTab === "Explore"
              ? "border-blue-500 text-blue-500"
              : "border-transparent text-gray-500"
          }`}
          onClick={() => handleTabChange("Explore")}
        >
          Explore Posts
        </button>
      </div>
      {activeTab === "myPosts" && (
        <div>
          <NewPostForm handleNewPostSubmit={handleNewPostSubmit} />
          <Posts
            posts={getOwnPosts()}
            togglePostLike={togglePostLike}
            onCommentSubmit={handleCommentSubmit}
          />
        </div>
      )}
      {activeTab === "Explore" && (
        <Posts
          posts={getFriendsPosts()}
          togglePostLike={togglePostLike}
          onCommentSubmit={handleCommentSubmit}
        />
      )}
    </div>
  );
};
