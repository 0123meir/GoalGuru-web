import useApiRequests from "@/hooks/useApiRequests";
import { useGoalApi } from "@/hooks/useGoalApi";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

const GoalInput = () => {
  const [newGoal, setNewGoal] = useState<string>("");
  const { addGoal } = useGoalApi();
  const api = useApiRequests();

  const handleAddGoal = async () => {
    if (newGoal.trim()) {
      try {
        const response = await api.post("/goals", { name: newGoal, completed: false });
        addGoal(response.data.goal);
        setNewGoal("");
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex space-x-2 mb-4">
      <input
        type="text"
        value={newGoal}
        onChange={(e) => setNewGoal(e.target.value)}
        placeholder="New Goal"
        className="border rounded-full shadow-sm px-4 py-2 focus:outline-none bg-gray-50 flex-grow"
      />
      <button
        onClick={handleAddGoal}
        className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-full text-sm px-4 py-4 text-center"
      >
        <FaPlus />
      </button>
    </div>
  );
};

export default GoalInput;
