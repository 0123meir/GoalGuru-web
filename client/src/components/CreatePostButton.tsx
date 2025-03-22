import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface CreatePostButtonProps {
  onClick: () => void;
}

const CreatePostButton = ({ onClick }: CreatePostButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      aria-label="Create new post"
    >
      <span className="m-2">New Post</span>
      <FontAwesomeIcon icon={faPlus} className="text-lg" />
    </button>
  );
};

export default CreatePostButton;
