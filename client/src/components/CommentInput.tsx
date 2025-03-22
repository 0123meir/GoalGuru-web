import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

interface CommentInputProps {
  onSubmit: (content: string) => void;
}

const CommentInput = ({ onSubmit }: CommentInputProps) => {
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit(comment);
      setComment("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 bg-white border border-gray-300 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="submit"
        disabled={!comment.trim()}
        className={`ml-2 p-2 rounded-full focus:outline-none ${
          comment.trim()
            ? "text-blue-500 hover:bg-blue-50"
            : "text-gray-400 cursor-not-allowed"
        }`}
      >
        <FontAwesomeIcon icon={faPaperPlane} size="sm" />
      </button>
    </form>
  );
};

export default CommentInput;
