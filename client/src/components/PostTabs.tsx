type Tab = "myPosts" | "Explore";

interface PostTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const PostTabs = ({ activeTab, onTabChange }: PostTabsProps) => {
  return (
    <div className="flex justify-center py-4 border-b border-gray-200 bg-white">
      <div className="flex space-x-8">
        <button
          className={`px-3 py-2 font-medium text-sm transition-colors ${
            activeTab === "Explore"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => onTabChange("Explore")}
        >
          Explore Posts
        </button>
        <button
          className={`px-3 py-2 font-medium text-sm transition-colors ${
            activeTab === "myPosts"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => onTabChange("myPosts")}
        >
          My Posts
        </button>
      </div>
    </div>
  );
};

export default PostTabs;
