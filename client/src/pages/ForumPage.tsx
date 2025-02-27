import { useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

interface Post {
  id: number;
  userPhoto: string;
  userName: string;
  description: string;
  time: string;
  photos: string[];
  likes: number;
  comments: { user: string; text: string }[];
}

const mockData: Post[] = [
  {
    id: 1,
    userPhoto:
      "https://plus.unsplash.com/premium_photo-1683121366070-5ceb7e007a97?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    userName: "John Doe",
    description: "This is a sample post description.",
    time: "2 hours ago",
    photos: [
      "https://cdn.outsideonline.com/wp-content/uploads/2023/03/Funny_Dog_H.jpg?crop=16:9&width=960&enable=upscale&quality=100",
      "https://i.natgeofe.com/n/5d00b0cc-ab95-4522-ad13-7c65b7589e6b/NationalGeographic_748483.jpg?w=1436&h=958",
      "https://i.natgeofe.com/n/5d00b0cc-ab95-4522-ad13-7c65b7589e6b/NationalGeographic_748483.jpg?w=1436&h=958",
      "https://i.natgeofe.com/n/5d00b0cc-ab95-4522-ad13-7c65b7589e6b/NationalGeographic_748483.jpg?w=1436&h=958",
    ],
    likes: 10,
    comments: [
      { user: "Jane Smith", text: "Nice post!" },
      { user: "Alice Johnson", text: "Thanks for sharing!" },
    ],
  },
  {
    id: 2,
    userPhoto:
      "https://plus.unsplash.com/premium_photo-1683121366070-5ceb7e007a97?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    userName: "John Doe",
    description: "This is a sample post description.",
    time: "2 hours ago",
    photos: [
      "https://cdn.outsideonline.com/wp-content/uploads/2023/03/Funny_Dog_H.jpg?crop=16:9&width=960&enable=upscale&quality=100",
      "https://i.natgeofe.com/n/5d00b0cc-ab95-4522-ad13-7c65b7589e6b/NationalGeographic_748483.jpg?w=1436&h=958",
    ],
    likes: 10,
    comments: [
      { user: "Jane Smith", text: "Nice post!" },
      { user: "Alice Johnson", text: "Thanks for sharing!" },
    ],
  },
  {
    id: 3,
    userPhoto:
      "https://plus.unsplash.com/premium_photo-1683121366070-5ceb7e007a97?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    userName: "John Doe",
    description: "This is a sample post description.",
    time: "2 hours ago",
    photos: [
      "https://cdn.outsideonline.com/wp-content/uploads/2023/03/Funny_Dog_H.jpg?crop=16:9&width=960&enable=upscale&quality=100",
      "https://i.natgeofe.com/n/5d00b0cc-ab95-4522-ad13-7c65b7589e6b/NationalGeographic_748483.jpg?w=1436&h=958",
    ],
    likes: 10,
    comments: [
      { user: "Jane Smith", text: "Nice post!" },
      { user: "Alice Johnson", text: "Thanks for sharing!" },
    ],
  },
  {
    id: 4,
    userPhoto:
      "https://plus.unsplash.com/premium_photo-1683121366070-5ceb7e007a97?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    userName: "John Doe",
    description: "This is a sample post description.",
    time: "2 hours ago",
    photos: [
      "https://cdn.outsideonline.com/wp-content/uploads/2023/03/Funny_Dog_H.jpg?crop=16:9&width=960&enable=upscale&quality=100",
      "https://i.natgeofe.com/n/5d00b0cc-ab95-4522-ad13-7c65b7589e6b/NationalGeographic_748483.jpg?w=1436&h=958",
    ],
    likes: 1,
    comments: [
      { user: "Jane Smith", text: "Nice post!" },
      { user: "Alice Johnson", text: "Thanks for sharing!" },
    ],
  },
  // Add more mock posts here
];

export const ForumPage = () => {
  const [posts, setPosts] = useState<Post[]>(mockData);
  const [likedPosts, setLikedPosts] = useState([{ postId: 1, liked: true }]);

  const togglePostLike = (postId: number) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        if (likedPosts.find((likedPost) => likedPost.postId === postId)) {
          setLikedPosts(
            likedPosts.filter((likedPost) => likedPost.postId !== postId)
          );
          return { ...post, likes: post.likes - 1 };
        } else {
          setLikedPosts([...likedPosts, { postId: postId, liked: true }]);
          return { ...post, likes: post.likes + 1 };
        }
      }
      return post;
    });

    setPosts(updatedPosts);    
  };

  const isPostLikedByUser = (postId: number) => {
    return likedPosts.find((likedPost) => likedPost.postId === postId);
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 p-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="w-3/4 bg-white rounded-lg shadow-md p-4 mb-4 "
        >
          <div className="flex items-center mb-4">
            <img
              src={post.userPhoto}
              alt="User"
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <div className="font-bold">{post.userName}</div>
              <div className="text-gray-500 text-sm">{post.time}</div>
            </div>
          </div>
          <hr className="my-2" />
          <div className="mb-4">{post.description}</div>
          <div className="w-full flex justify-center mb-4">
            <div className="w-1/2">
              <Carousel showThumbs={false} infiniteLoop useKeyboardArrows>
                {post.photos.map((photo, index) => (
                  <div key={index} className="flex justify-center bg-gray-100">
                    <img
                      src={photo}
                      alt="Post"
                      className="object-contain h-64 w-full rounded-lg"
                    />
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
          <div className="flex items-center text-gray-700 mb-4">
            <svg
              className={
                isPostLikedByUser(post.id)
                  ? "w-6 h-6 text-red-500 mr-2"
                  : "w-6 h-6 text-gray-700 mr-2"
              }
              onClick={() => {
                togglePostLike(post.id);
              }}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            Likes: {post.likes}
          </div>
          <hr className="my-2" />
          <div className="flex flex-col">
            {post.comments.map((comment, index) => (
              <div key={index} className="mb-2">
                <span className="font-bold">{comment.user}:</span>{" "}
                {comment.text}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
