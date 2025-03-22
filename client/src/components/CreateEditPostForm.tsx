import {
  faImage,
  faPaperPlane,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent, useEffect, useState } from "react";

import { Post } from "@/types/forum";

interface CreateEditPostFormProps {
  handleSubmit: (postId: string | null, formData: FormData) => void;
  isOpen: boolean;
  onClose: () => void;
  post?: Post | null;
}

const MAX_IMAGES = 4;
const MAX_DESCRIPTION_LENGTH = 200;

const CreateEditPostForm = ({
  handleSubmit,
  isOpen,
  onClose,
  post,
}: CreateEditPostFormProps) => {
  const [images, setImages] = useState<File[]>([]);

  const [description, setDescription] = useState<string>("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [descriptionCharsLeft, setDescriptionCharsLeft] = useState<number>(
    MAX_DESCRIPTION_LENGTH
  );
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
  }>({
    show: false,
    message: "",
  });

  const isEditMode = !!post;

  // Set form data when editing a post
  useEffect(() => {
    if (post) {
      setDescription(post.description);
      setDescriptionCharsLeft(MAX_DESCRIPTION_LENGTH - post.description.length);
      if (post.imageUrls && post.imageUrls.length > 0) {
        setExistingImages(post.imageUrls);
      } else {
        setExistingImages([]);
      }
    } else {
      clearForm();
    }
  }, [post, isOpen]);

  const clearForm = () => {
    setImages([]);
    setDescription("");
    setDescriptionCharsLeft(MAX_DESCRIPTION_LENGTH);
    setExistingImages([]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages((prevImages) =>
      prevImages.filter((url) => url !== imageUrl)
    );
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      const totalImagesCount = images.length + existingImages.length;

      if (totalImagesCount + newImages.length <= MAX_IMAGES) {
        setImages((prevImages) => [...prevImages, ...newImages]);
      } else {
        const allowedImages = newImages.slice(0, MAX_IMAGES - totalImagesCount);
        setImages((prevImages) => [...prevImages, ...allowedImages]);

        // Instead of alert, set a state variable for notification
        setNotification({
          show: true,
          message: `Only ${allowedImages.length} images were added. Maximum of ${MAX_IMAGES} images allowed.`,
        });

        // Hide notification after a few seconds
        setTimeout(() => {
          setNotification({ show: false, message: "" });
        }, 5000);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      alert("Please add a description to your post.");
      return;
    }

    const formData = new FormData();
    formData.append("description", description);

    // Add new images
    if (images.length > 0) {
      images.forEach((image) => {
        formData.append(`images`, image);
      });
    }

    // If editing, add existing images and removed images
    if (isEditMode) {
      if (existingImages.length > 0) {
        formData.append("existingImages", JSON.stringify(existingImages));
      }
    }

    // Pass postId if editing, null if creating new post
    handleSubmit(post?._id || null, formData);
    clearForm();
    onClose();
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    if (newValue.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(newValue);
      setDescriptionCharsLeft(MAX_DESCRIPTION_LENGTH - newValue.length);
    }
  };

  if (!isOpen) return null;

  const totalImagesCount = images.length + existingImages.length;
  const canAddMoreImages = totalImagesCount < MAX_IMAGES;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isEditMode ? "Edit Post" : "Create New Post"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-full p-1"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="flex flex-col">
          {notification.show && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
              <p>{notification.message}</p>
            </div>
          )}
          {/* Description Textarea */}
          <div className="mb-4">
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="What's on your mind?"
              rows={4}
              required
            />
            <div className="flex justify-end text-xs text-gray-500 mt-1">
              {descriptionCharsLeft} characters left
            </div>
          </div>

          {/* Image Gallery */}
          {(existingImages.length > 0 || images.length > 0) && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {/* Existing images from the server */}
                {existingImages.map((imageUrl, index) => (
                  <div key={`existing-${index}`} className="relative">
                    <img
                      src={imageUrl}
                      alt={`existing-${index}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      aria-label="Remove image"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                      onClick={() => handleRemoveExistingImage(imageUrl)}
                    >
                      <FontAwesomeIcon icon={faTimes} size="xs" />
                    </button>
                  </div>
                ))}

                {/* Newly added images */}
                {images.map((image, index) => (
                  <div key={`new-${index}`} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`preview-${index}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      aria-label="Remove image"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <FontAwesomeIcon icon={faTimes} size="xs" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center mt-2">
            <div>
              <input
                type="file"
                accept="image/png, image/jpeg"
                multiple
                className="hidden"
                id="imageUpload"
                onChange={handleImageUpload}
                disabled={!canAddMoreImages}
              />
              <label
                htmlFor="imageUpload"
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  canAddMoreImages
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <FontAwesomeIcon icon={faImage} className="mr-2" />
                Add Images{" "}
                {totalImagesCount > 0
                  ? `(${totalImagesCount}/${MAX_IMAGES})`
                  : ""}
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
              {isEditMode ? "Save Changes" : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditPostForm;
