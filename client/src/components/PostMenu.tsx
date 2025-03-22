import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

interface PostMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const PostMenu: React.FC<PostMenuProps> = ({ onEdit, onDelete, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={menuRef}
      className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg py-1 w-40 z-10"
    >
      <button
        onClick={onEdit}
        className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
      >
        <FontAwesomeIcon icon={faPencilAlt} className="mr-3 text-blue-500 w-4" />
        Edit post
      </button>
      <button
        onClick={onDelete}
        className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
      >
        <FontAwesomeIcon icon={faTrashAlt} className="mr-3 text-red-500 w-4" />
        Delete post
      </button>
    </div>
  );
};

export default PostMenu;