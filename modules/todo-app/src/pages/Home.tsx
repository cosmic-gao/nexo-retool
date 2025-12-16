import { TodoList } from "../components/TodoList";

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Todo App22</h1>
        <p className="text-muted-foreground">Manage your tasks</p>
      </div>
      
      <TodoList />
    </div>
  );
}
