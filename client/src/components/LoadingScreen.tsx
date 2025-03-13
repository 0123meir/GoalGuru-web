interface LoadingScreenProps {
  text: string;
}

const LoadingScreen = ({ text }: LoadingScreenProps) => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 mb-4"></div>
        <h2 className="text-xl font-semibold">Loading...</h2>
        <p className="text-gray-500">{text}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
