import {
  faImage,
  faPaperPlane,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent, useState } from "react";

interface NewPostFormProps {
  handleNewPostSubmit: (newPost: FormData) => void;
  isOpen: boolean;
  onClose: () => void;
}
const MAX_IMAGES = 4;

const NewPostForm: React.FC<NewPostFormProps> = ({
  handleNewPostSubmit,
  isOpen,
  onClose,
}) => {
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState<string>("");

  const clearForm = () => {
    setImages([]);
    setDescription("");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      if (images.length + newImages.length <= MAX_IMAGES) {
        setImages((prevImages) => [...prevImages, ...newImages]);
      } else {
        const allowedImages = newImages.slice(0, MAX_IMAGES - images.length);
        setImages((prevImages) => [...prevImages, ...allowedImages]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("description", description);
    if (images.length > 0) {
      images.forEach((image) => {
        formData.append(`images`, image);
      });
    }

    handleNewPostSubmit(formData);
    clearForm();
    onClose();
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Post</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <div className="w-full">
            <div className="flex flex-wrap mt-2">
              {images &&
                Array.from(images).map((image, index) => (
                  <div key={index} className="relative m-1">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`preview-${index}`}
                      className="w-24 h-24 object-cover rounded-lg"
                      style={{ aspectRatio: "1 / 1" }}
                    />
                    <button
                      className="absolute top-0 right-0 text-white p-1"
                      onClick={() => handleRemoveImage(index)}
                    >
                      X
                    </button>
                  </div>
                ))}
            </div>
            <div className="relative flex">
              <textarea
                className="w-full p-4 border border-gray-300 rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="What's on your mind?"
                rows={4}
                maxLength={200}
                required
              />
            </div>

            <div className="flex mt-4 justify-end space-x-4">
              <input
                type="file"
                accept="image/png, image/jpeg"
                multiple
                className="hidden"
                id="imageUpload"
                onChange={handleImageUpload}
                disabled={!!images && images.length >= MAX_IMAGES}
              />
              <label
                htmlFor="imageUpload"
                className={`flex items-center h-10 p-2 bg-gray-200 text-gray-600 rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer ${
                  images && images.length >= MAX_IMAGES
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <FontAwesomeIcon icon={faImage} className="mr-2" />
                Add Images
              </label>
              <button
                type="submit"
                className="flex items-center h-10 p-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                Publish Post
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPostForm;
