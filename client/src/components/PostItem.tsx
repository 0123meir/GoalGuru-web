import defaultUserImage from "@/assets/default-user.png";
import {
  faComment,
  faHeart as regularHeart,
} from "@fortawesome/free-regular-svg-icons";
import {
  faEllipsisV,
  faHeart as solidHeart,
} from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow } from "date-fns";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

import { Post } from "@/types/forum";

import CommentInput from "./CommentInput";
import PostMenu from "./PostMenu";

interface PostItemProps {
  post: Post;
  togglePostLike: (postId: string) => void;
  onCommentSubmit: (postId: string, content: string) => void;
  onDeletePost?: (postId: string) => void;
  onEditPost?: (post: Post) => void;
  currentUserId: string;
}

const PostItem = ({
  post,
  togglePostLike,
  onCommentSubmit,
  onDeletePost,
  onEditPost,
  currentUserId,
}: PostItemProps) => {
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const formatPublishTime = (publishTime: Date): string => {
    return formatDistanceToNow(new Date(publishTime), { addSuffix: true });
  };

  const getProfilePhoto = () => {
    return !post.poster.profileImage || post.poster.profileImage === ""
      ? defaultUserImage
      : post.poster.profileImage;
  };

  const isPostOwner = post.poster._id === currentUserId;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <img
            src={getProfilePhoto() || defaultUserImage}
            alt={""}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="ml-3">
            <div className="font-medium">{post.poster.username}</div>
            <div className="text-xs text-gray-500">
              {formatPublishTime(new Date(post.publishTime))}
            </div>
          </div>
        </div>

        {isPostOwner && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full"
            >
              <FontAwesomeIcon icon={faEllipsisV} size="1x" />
            </button>

            {menuOpen && (
              <PostMenu
                onEdit={() => {
                  if (onEditPost) onEditPost(post);
                  setMenuOpen(false);
                }}
                onDelete={() => {
                  if (onDeletePost) onDeletePost(post._id);
                  setMenuOpen(false);
                }}
                onClose={() => setMenuOpen(false)}
              />
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="px-4 py-2">
        <p className="text-gray-800">{post.description}</p>
      </div>

      {/* Images Grid */}
      {post.imageUrls && post.imageUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-2 p-4">
          {post.imageUrls.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post image ${index + 1}`}
              className="object-cover w-full h-40 rounded-md cursor-pointer hover:opacity-75 transition-opacity"
              onClick={() => setLightboxImage(image)}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Lightbox"
            className="max-w-full max-h-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white text-2xl"
          >
            ✕
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center space-x-6">
        <button
          onClick={() => togglePostLike(post._id)}
          className="flex items-center text-sm font-medium focus:outline-none"
        >
          <FontAwesomeIcon
            icon={post.isLikedByUser ? solidHeart : regularHeart}
            className={`mr-2 ${
              post.isLikedByUser ? "text-red-500" : "text-gray-500"
            }`}
            size="lg"
          />
          <span className="text-gray-700">{post.likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center text-gray-500 hover:text-gray-700 text-sm font-medium focus:outline-none"
        >
          <FontAwesomeIcon icon={faComment} className="mr-2" size="lg" />
          <span>{post.comments.length}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          {post.comments.length > 0 ? (
            <div className="space-y-3 mb-3">
              {post.comments.map((comment, index) => (
                <div key={index} className="flex">
                  <span className="font-medium mr-2">{comment.username}</span>
                  <p className="text-gray-800">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-3">No comments yet</p>
          )}
          <CommentInput
            onSubmit={(content) => onCommentSubmit(post._id, content)}
          />
        </div>
      )}
    </div>
  );
};

export default PostItem;
