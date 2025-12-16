import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
    variant: "default" as const,
    className: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  },
  "in-progress": {
    label: "进行中",
    icon: Clock,
    variant: "secondary" as const,
    className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  },
  pending: {
    label: "待处理",
    icon: AlertCircle,
    variant: "outline" as const,
    className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
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

      <Card>
        <CardHeader>
          <CardTitle>所有任务</CardTitle>
          <CardDescription>
            共 {tasks.length} 个任务，{tasks.filter(t => t.status === "completed").length} 个已完成
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">任务ID</TableHead>
                <TableHead>标题</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead>截止日期</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const status = statusConfig[task.status as keyof typeof statusConfig]
                const priority = priorityConfig[task.priority as keyof typeof priorityConfig]
                const StatusIcon = status.icon

                return (
                  <TableRow key={task.id}>
                    <TableCell className="font-mono text-sm">
                      {task.id}
                    </TableCell>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      <Badge className={status.className}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={priority.className}>
                        {priority.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {task.dueDate}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
