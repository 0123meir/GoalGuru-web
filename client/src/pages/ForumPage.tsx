import useAuthTokens from "@/hooks/useAuthTokens";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Post } from "@/types/forum";
import axios from "axios";
import { useEffect, useState } from "react";

import { Posts } from "../components/Posts";

export const ForumPage = () => {
  const [activeTab, setActiveTab] = useState<"myPosts" | "friendsPosts">(
    "myPosts"
  );
  const [posts, setPosts] = useState<Post[] | undefined>(undefined);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const { getTokens } = useAuthTokens();
  const { getItem } = useLocalStorage("userId");

  useEffect(() => {
    const serverId = import.meta.env.VITE_SERVER_URL;
    const userId = getItem();
    const fetchPosts = async () => {
      try {
        const tokens = getTokens();
        const postsRes = await axios.get(
          `${serverId}/posts/poster?id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          }
        );
        const PostslikedByUserRes = await axios.get(
          `${serverId}/users/likedByUser?id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          }
        );

        setPosts(postsRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleTabChange = (tab: "myPosts" | "friendsPosts") => {
    setActiveTab(tab);
  };

  const togglePostLike = (postId: string) => {
    const updatedPosts = posts?.map((post) => {
      const postToUpdate = posts.find((post) => post.id === postId);
      if (!postToUpdate) {
        return post;
      }

      if (postToUpdate.isLikedByUser) {
        return { ...post, likes: post.likes - 1, isLikedByUser: false };
      } else {
        return { ...post, likes: post.likes + 1, isLikedByUser: true };
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
    return posts ? posts?.filter((post) => post.id !== getItem()) : [];
  }

  function getOwnPosts() {
    return posts ? posts?.filter((post) => post.id === getItem()) : [];
  }

  return (
    <div>
      <div>
        <button onClick={() => handleTabChange("myPosts")}>My Posts</button>
        <button onClick={() => handleTabChange("friendsPosts")}>
          Friends' Posts
        </button>
      </div>
      {activeTab === "myPosts" && (
        <div>
          <div>
            <h2>Create New Post</h2>
            <textarea value={newPost} onChange={handleNewPostChange} />
            <button onClick={handleNewPostSubmit}>Submit</button>
          </div>
          <Posts posts={getOwnPosts()} togglePostLike={togglePostLike} />
        </div>
      )}
      {activeTab === "friendsPosts" && (
        <Posts posts={getFriendsPosts()} togglePostLike={togglePostLike} />
      )}
    </div>
  );
};
