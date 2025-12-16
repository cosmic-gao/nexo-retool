import { TodoList } from "../components/TodoList";
import { TodoStats } from "../components/TodoStats";

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Todo App</h1>
        <p className="text-muted-foreground">Manage your tasks efficiently</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Recent Tasks</h2>
          <TodoList limit={5} />
        </div>
        <div>
          <h2 className="mb-4 text-lg font-semibold">Overview</h2>
          <TodoStats />
        </div>
      </div>
    </div>
  );
}

