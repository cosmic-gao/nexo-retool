import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@nexoc/react-runtime"
import { MoreHorizontal, CheckCircle2, Clock, AlertCircle } from "lucide-react"

const tasks = [
  {
    id: "TASK-001",
    title: "完成用户认证模块",
    status: "completed",
    priority: "high",
    dueDate: "2024-01-15",
  },
  {
    id: "TASK-002",
    title: "设计数据库架构",
    status: "in-progress",
    priority: "high",
    dueDate: "2024-01-20",
  },
  {
    id: "TASK-003",
    title: "编写 API 文档",
    status: "pending",
    priority: "medium",
    dueDate: "2024-01-25",
  },
  {
    id: "TASK-004",
    title: "单元测试覆盖",
    status: "pending",
    priority: "low",
    dueDate: "2024-01-30",
  },
  {
    id: "TASK-005",
    title: "性能优化",
    status: "in-progress",
    priority: "medium",
    dueDate: "2024-02-01",
  },
]

const statusConfig = {
  completed: {
    label: "已完成",
    icon: CheckCircle2,
    className: "bg-green-500/10 text-green-500",
  },
  "in-progress": {
    label: "进行中",
    icon: Clock,
    className: "bg-blue-500/10 text-blue-500",
  },
  pending: {
    label: "待处理",
    icon: AlertCircle,
    className: "bg-yellow-500/10 text-yellow-500",
  },
}

const priorityConfig = {
  high: { label: "高", className: "bg-red-500/10 text-red-500" },
  medium: { label: "中", className: "bg-yellow-500/10 text-yellow-500" },
  low: { label: "低", className: "bg-green-500/10 text-green-500" },
}

export function List() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">任务列表</h1>
        <p className="text-muted-foreground">
          查看和管理所有任务
        </p>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="p-6 border-b">
          <h3 className="font-semibold">所有任务</h3>
          <p className="text-sm text-muted-foreground">
            共 {tasks.length} 个任务，{tasks.filter(t => t.status === "completed").length} 个已完成
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">任务ID</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">标题</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">状态</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">优先级</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">截止日期</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[50px]"></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const status = statusConfig[task.status as keyof typeof statusConfig]
                const priority = priorityConfig[task.priority as keyof typeof priorityConfig]
                const StatusIcon = status.icon

                return (
                  <tr key={task.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-4 align-middle font-mono text-sm">
                      {task.id}
                    </td>
                    <td className="p-4 align-middle font-medium">{task.title}</td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${status.className}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${priority.className}`}>
                        {priority.label}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {task.dueDate}
                    </td>
                    <td className="p-4 align-middle">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>查看详情</DropdownMenuItem>
                          <DropdownMenuItem>编辑任务</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            删除任务
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
