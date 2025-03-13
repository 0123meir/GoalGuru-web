import ChatBotIcon from "@/assets/ChatBotIcon";

import { useState } from "react";
import { IoSend as SendIcon } from "react-icons/io5";

import useGoalStore from "@/store/useGoalStore";

import useApiRequests from "@/hooks/useApiRequests";

import { StepDTO } from "@/types/dtos";

const GoalGenerator = () => {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const { addGoal } = useGoalStore();
  const api = useApiRequests();

  const isChatEmpty = chat.length === 0;

  const generateGoal = async (query: string) => {
    if (query.trim() === "") return;
    setLoading(true);

    setChat((prev) => [...prev, { role: "user", text: query }]);

    try {
      const postsRes = await api.post("/guru/", {
        prompt: query,
        history: chat.map((msg) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.text,
        })),
      });

      const aiResponse = postsRes.data.message;

      setChat((prev) => [...prev, { role: "ai", text: aiResponse }]);

      addGoal(
        postsRes.data._id,
        postsRes.data.name,
        postsRes.data.steps.map((s: StepDTO) => ({ ...s, id: s._id }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  const handleSubmit = () => {
    generateGoal(query);
    setQuery("");
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg w-full justify-end mx-auto flex flex-col gap-3">
      <div className="flex flex-col gap-2 overflow-y-auto p-2 grow justify-end">
        {!isChatEmpty ? (
          chat.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg max-w-xs ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white self-end"
                  : "bg-gray-200 text-black self-start"
              }`}
            >
              {msg.text}
            </div>
          ))
        ) : (
          <div className="h-full w-full content-center items-center justify-center justify-items-center">
            <div className="mb-5">
              <ChatBotIcon />
            </div>{" "}
            <span>Let me help you achieve your goals!</span>
          </div>
        )}
        {loading && (
          <div className="self-start text-gray-500">The Guru is typing...</div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          onChange={(e) => setQuery(e.target.value)}
          value={query}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
          className="border rounded-full shadow-sm px-4 py-2 focus:outline-none bg-gray-50 flex-grow"
          placeholder="Ask AI to generate a goal..."
        />
        <button
          type="button"
          disabled={query.trim() === ""}
          className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-full text-sm px-4 py-4 text-center"
          onClick={() => {
            handleSubmit();
          }}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

export default GoalGenerator;
