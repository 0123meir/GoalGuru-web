import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV, faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart, faComment } from "@fortawesome/free-regular-svg-icons";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Post } from "@/types/forum";
import defaultUserImage from "@/assets/default-user.png";
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

const PostItem: React.FC<PostItemProps> = ({
  post,
  togglePostLike,
  onCommentSubmit,
  onDeletePost,
  onEditPost,
  currentUserId
}) => {
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
            src={getProfilePhoto()}
            alt={post.poster.username}
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
              <FontAwesomeIcon icon={faEllipsisV} size="sm" />
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
      
      {/* Images */}
      {post.imageUrls && post.imageUrls.length > 0 && (
        <div className="mt-2">
          <Carousel 
            showThumbs={false} 
            showStatus={false} 
            infiniteLoop 
            useKeyboardArrows
            showIndicators={post.imageUrls.length > 1}
            className="post-carousel"
          >
            {post.imageUrls.map((image, index) => (
              <div key={index} className="carousel-slide">
                <img
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="object-contain max-h-80 w-full"
                />
              </div>
            ))}
          </Carousel>
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
            className={`mr-2 ${post.isLikedByUser ? 'text-red-500' : 'text-gray-500'}`}
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
          
          <CommentInput onSubmit={(content) => onCommentSubmit(post._id, content)} />
        </div>
      )}
    </div>
  );
};

export default PostItem;