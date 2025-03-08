import useApiRequests from "@/hooks/useApiRequests";
import useGoalStore from "@/store/useGoalStore";
import { StepDTO } from "@/types/dtos";
import { useState } from "react";

const GoalGenerator = () => {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState(false)
  const {addGoal} = useGoalStore()
  const api = useApiRequests();

  const generateGoal = async (query: string) => {
    setLoading(true);
    try {
      const postsRes = await api.post("/guru/",{prompt: query});
      addGoal(postsRes.data._id, postsRes.data.name,postsRes.data.steps.map((s: StepDTO) => ({...s, id: s._id})));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }
   return (
    <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-xl mx-auto">
      <input type="text" onChange={(e) => setQuery(e.target.value)} value={query} className="bg-slate-500"/>
      <button onClick={()=>generateGoal(query)}>Generate Goal!</button>
      {loading &&<div>loading...</div>}
    </div>
  );
};

export default GoalGenerator;
