import { useState } from "react";
import { MdSend } from "react-icons/md";

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
    <div className="flex mt-4 w-full">
      <textarea
        className="border rounded-l p-2 mb-2 flex-grow resize-none h-16 focus:border-blue-500 focus:outline-none"
        placeholder="Add a comment..."
        value={content}
        maxLength={200}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button
        className="bg-blue-500 text-white p-4 rounded-r flex items-center justify-center h-16"
        onClick={handleCommentSubmit}
      >
        <MdSend />
      </button>
    </div>
  );
};

export default CommentInput;
