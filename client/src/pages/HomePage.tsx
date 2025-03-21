import GoalGenerator from "@/components/GoalGenerator";
import GoalList from "@/components/GoalList";
import Header from "@/components/Header";

export const HomePage = () => {

  return (
    <div className="flex flex-col h-screen">
      <Header rightIcon="forum"/>
      <div className="flex grow overflow-y-auto">
        <GoalList />
        <GoalGenerator />
      </div>
    </div>
  );
};
