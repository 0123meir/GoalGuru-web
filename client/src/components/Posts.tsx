import { Post } from "@/types/forum";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

interface PostsProps {
  posts: Post[];
  togglePostLike: (postId: string) => void;
}

export const Posts = ({ posts, togglePostLike }: PostsProps) => {
  const getUserPhoto = (post: Post): string | undefined =>
    post.userPhoto ?? "../assets/default-user.png";

  if (posts.length === 0)
    return (
      <div className="flex flex-col items-center bg-gray-100 p-4">
          No way! seems like you don't have any posts yet, why not create one?
      </div>
    );

  return (
    <div className="flex flex-col items-center bg-gray-100 p-4">
      {posts?.map((post) => (
        <div
          key={post._id}
          className="w-3/4 bg-white rounded-lg shadow-md p-4 mb-4 "
        >
          <div className="flex items-center mb-4">
            <img
              src={getUserPhoto(post)}
              alt="User"
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <div className="font-bold">{post.userName}</div>
              <div className="text-gray-500 text-sm">{post.publishTime}</div>
            </div>
          </div>
          <div className="mb-4">{post.description}</div>
          <hr className="my-2" />
          {post.photos && (
            <div className="w-full flex justify-center mb-4">
              <div className="w-1/2">
                <Carousel showThumbs={false} infiniteLoop useKeyboardArrows>
                  {post.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="flex justify-center bg-gray-100"
                    >
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
          )}
          <div className="flex items-center text-gray-700 mb-4">
            <svg
              className={
                post.isLikedByUser
                  ? "w-6 h-6 text-red-500 mr-2"
                  : "w-6 h-6 text-gray-700 mr-2"
              }
              onClick={() => {
                togglePostLike(post._id);
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
            Likes: {post.likesCount}
          </div>
          <hr className="my-2" />
          <div className="flex flex-col"></div>
          {post.comments.map((comment, index) => (
            <div key={index} className="mb-2">
              <span className="font-bold">{comment.commentorId}:</span>{" "}
              {comment.content}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
