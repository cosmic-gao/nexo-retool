import { useState } from "react"
import { Button, Input } from "@nexoc/react-runtime"
import { Plus, CheckCircle2, Circle, Trash2, ListTodo } from "lucide-react"

interface Todo {
  id: number
  text: string
  completed: boolean
}

export function Home() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "完成项目文档", completed: true },
    { id: 2, text: "代码审查", completed: false },
    { id: 3, text: "部署到生产环境", completed: false },
  ])
  const [newTodo, setNewTodo] = useState("")

  const completedCount = todos.filter(t => t.completed).length
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0

  const addTodo = () => {
    if (!newTodo.trim()) return
    setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }])
    setNewTodo("")
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(t => t.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Todo App</h1>
          <p className="text-muted-foreground">
            管理你的任务，提高工作效率
          </p>
        </div>
        <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-sm font-medium">
          {completedCount}/{todos.length} 已完成
        </span>
      </div>

      {/* Progress */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-medium mb-2">完成进度</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Add Todo */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <ListTodo className="h-5 w-5" />
          <h3 className="font-semibold">添加新任务</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          输入任务描述，按回车或点击添加按钮
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="输入任务..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            className="flex-1"
          />
          <Button onClick={addTodo}>
            <Plus className="h-4 w-4 mr-2" />
            添加
          </Button>
        </div>
      </div>

      {/* Todo List */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="font-semibold mb-2">任务列表</h3>
        <p className="text-sm text-muted-foreground mb-4">
          点击任务标记完成，点击删除按钮移除任务
        </p>
        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无任务</p>
              <p className="text-sm">添加你的第一个任务开始吧！</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => toggleTodo(todo.id)}
              >
                <div className={`h-5 w-5 rounded border flex items-center justify-center ${
                  todo.completed ? 'bg-primary border-primary' : 'border-input'
                }`}>
                  {todo.completed && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
                </div>
                <span
                  className={`flex-1 ${
                    todo.completed
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {todo.text}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteTodo(todo.id)
                  }}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
