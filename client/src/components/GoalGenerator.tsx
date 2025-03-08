import useApiRequests from "@/hooks/useApiRequests";
import useGoalStore from "@/store/useGoalStore";
import { StepDTO } from "@/types/dtos";
import { useState } from "react";
import { IoSend as SendIcon } from "react-icons/io5";

const GoalGenerator = () => {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { addGoal } = useGoalStore();
  const api = useApiRequests();

  const generateGoal = async (query: string) => {
    setLoading(true);
    if (query.trim() === "") return;
    try {
      const postsRes = await api.post("/guru/", { prompt: query });
      addGoal(
        postsRes.data._id,
        postsRes.data.name,
        postsRes.data.steps.map((s: StepDTO) => ({ ...s, id: s._id }))
      );
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg w-full mx-auto flex flex-col-reverse">
      <div className="flex gap-2">

      <input
        type="text"
        onChange={(e) => setQuery(e.target.value)}
        value={query}
        className="border rounded-full shadow-sm px-4 py-2 focus:outline-none bg-gray-50 flex-grow"
        />
        <button type="button" disabled={query.trim() === ""} className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-full text-sm px-4 py-4 text-center" onClick={() => generateGoal(query)}><SendIcon/></button></div>
      {loading && <div>loading...</div>}
    </div>
  );
};

export default GoalGenerator;
