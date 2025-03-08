import { useState } from "react";

interface CommentInputProps {
  onSubmit: (content: string) => void;
}

const CommentInput = ({ onSubmit }: CommentInputProps) => {
  const [content, setContent] = useState("");

  const handleCommentSubmit = () => {
    onSubmit(content);
    setContent("");
  };

  return (
    <div className="flex flex-col mt-4">
      <textarea
        className="border rounded p-2 mb-2"
        placeholder="Add a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white rounded p-2"
        onClick={handleCommentSubmit}
      >
        Submit
      </button>
    </div>
  );
};

export default CommentInput;
