import useAuthTokens from "@/hooks/useAuthTokens";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Post } from "@/types/forum";
import axios from "axios";
import { useEffect, useState } from "react";

import NewPostForm from "../components/NewPostForm";
import { Posts } from "../components/Posts";

export const ForumPage = () => {
  type Tab = "myPosts" | "Explore";
  const [activeTab, setActiveTab] = useState<Tab>("myPosts");
  const [posts, setPosts] = useState<Post[] | undefined>(undefined);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const { getTokens } = useAuthTokens();
  const { getItem } = useLocalStorage("userId");
  const userId = getItem();

  useEffect(() => {
    const serverId = import.meta.env.VITE_SERVER_URL;
    const fetchPosts = async () => {
      try {
        const tokens = getTokens();
        const postsRes = await axios.get(`${serverId}/posts/`, {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });

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

  const togglePostLike = (postId: string) => {
    const updatedPosts = posts?.map((post) => {
      const postToUpdate = posts.find((post) => post._id === postId);
      if (!postToUpdate) {
        return post;
      }

      if (postToUpdate.isLikedByUser) {
        return { ...post, likes: post.likesCount - 1, isLikedByUser: false };
      } else {
        return { ...post, likes: post.likesCount + 1, isLikedByUser: true };
      }
    });

    setPosts(updatedPosts);
  };
  const handleNewPostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewPost(e.target.value);
  };

  const handleNewPostSubmit = () => {
    // Handle new post submission logic here
    console.log("New post submitted:", newPost);
    setNewPost("");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  function getFriendsPosts() {
    return posts ? posts?.filter((post) => post._id !== userId) : [];
  }

  function getOwnPosts() {
    return posts ? posts?.filter((post) => post._id === userId) : [];
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
          <NewPostForm
            newPost={newPost}
            handleNewPostChange={handleNewPostChange}
            handleNewPostSubmit={handleNewPostSubmit}
          />
          <Posts posts={getOwnPosts()} togglePostLike={togglePostLike} />
        </div>
      )}
      {activeTab === "Explore" && (
        <Posts posts={getFriendsPosts()} togglePostLike={togglePostLike} />
      )}
    </div>
  );
};
