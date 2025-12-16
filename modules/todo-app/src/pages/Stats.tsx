import { TodoStats } from "../components/TodoStats";

export default function Stats() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistics</h1>
        <p className="text-muted-foreground">Track your productivity</p>
      </div>
      
      <TodoStats />
    </div>
  );
}

