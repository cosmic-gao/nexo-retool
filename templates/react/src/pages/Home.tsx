import { useState } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2,
  ListTodo
} from "lucide-react"

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
        <Badge variant="secondary" className="text-sm">
          {completedCount}/{todos.length} 已完成
        </Badge>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">完成进度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={progress} className="flex-1" />
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Add Todo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            添加新任务
          </CardTitle>
          <CardDescription>
            输入任务描述，按回车或点击添加按钮
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Todo List */}
      <Card>
        <CardHeader>
          <CardTitle>任务列表</CardTitle>
          <CardDescription>
            点击复选框标记完成，点击删除按钮移除任务
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                  />
                  <span
                    className={`flex-1 ${
                      todo.completed
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {todo.text}
                  </span>
                  {todo.completed && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTodo(todo.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
