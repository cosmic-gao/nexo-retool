import { TodoList } from "../components/TodoList";

export default function List() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Task22 List</h1>
        <p className="text-muted-foreground">View and manage all your tasks</p>
      </div>
      
      <TodoList />
    </div>
  );
}

