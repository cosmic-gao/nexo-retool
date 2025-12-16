import { useState } from "react";
import { TodoList } from "./components/TodoList";
import { TodoStats } from "./components/TodoStats";

export type View = "list" | "stats";

export default function App() {
  const [view, setView] = useState<View>("list");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!window.__NEXO_PLATFORM__ && (
        <nav className="border-b border-border bg-card">
          <div className="container mx-auto flex h-14 items-center gap-4 px-4">
            <h1 className="text-lg font-semibold">Todo App</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setView("list")}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  view === "list"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                Task List
              </button>
              <button
                onClick={() => setView("stats")}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  view === "stats"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                Stats
              </button>
            </div>
          </div>
        </nav>
      )}

      <main className="container mx-auto px-4 py-8">
        {view === "list" ? <TodoList /> : <TodoStats />}
      </main>
    </div>
  );
}
