import EmptyPostsIcon from "@/assets/EmptyPosts";

const EmptyPostsState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-40 h-40 mb-6">
        <EmptyPostsIcon />
      </div>
      <h3 className="text-xl font-medium text-gray-800 mb-2">No posts yet</h3>
      <p className="text-gray-600 max-w-md">
        Looks like there aren't any posts here yet. Why not create one to get
        started?
      </p>
    </div>
  );
};

export default EmptyPostsState;
