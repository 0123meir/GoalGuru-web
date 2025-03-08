import useApiRequests from "@/hooks/useApiRequests";
import useGoalStore from "@/store/useGoalStore";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

const GoalInput = () => {
  const [newGoal, setNewGoal] = useState<string>("");
  const {addGoal} = useGoalStore()
  const api = useApiRequests();

  const handleAddGoal = async () => {
    if (newGoal.trim()) {
      try {
        const response = await api.post("/goals", {name: newGoal})
        addGoal(response.data.goal._id, response.data.goal.name,[]);
        setNewGoal("");
      } catch (err) {
        console.error(err)
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
        className="flex-1 p-2 border rounded focus:outline-blue-500"
      />
      <button
        onClick={handleAddGoal}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        <FaPlus />
      </button>
    </div>
  );
};

export default GoalInput;