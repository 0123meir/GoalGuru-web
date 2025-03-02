import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

interface NewPostFormProps {
  newPost: string;
  handleNewPostChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleNewPostSubmit: () => void;
}

const NewPostForm: React.FC<NewPostFormProps> = ({ newPost, handleNewPostChange, handleNewPostSubmit }) => {
  return (
    <div className="flex flex-col items-center my-4">
      <div className="w-full max-w-lg">
        <div className="relative">
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            value={newPost}
            onChange={handleNewPostChange}
            placeholder="What's on your mind?"
            rows={4}
            maxLength={200} // Set maximum text amount
          />
          <div className="flex justify-around mt-2">
            <button
              className="flex items-center p-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handleNewPostSubmit}
            >
              <FontAwesomeIcon icon={faImage} className="mr-2" />
              Add Images
            </button>
            <button
              className="flex items-center p-2 bg-gray-200 text-gray-600 rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={handleNewPostSubmit}
            >
              <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
              Publish Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPostForm;