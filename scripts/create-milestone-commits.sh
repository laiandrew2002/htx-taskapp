#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BACKUP="$ROOT/.git-milestone-backup"
if [ ! -d "$BACKUP" ]; then
mkdir -p "$BACKUP"

cp "$ROOT/docker-compose.yml" "$BACKUP/docker-compose.yml"
cp "$ROOT/.env.example" "$BACKUP/.env.example"
cp "$ROOT/backend/package.json" "$BACKUP/backend-package.json"
cp "$ROOT/backend/.env.example" "$BACKUP/backend-env.example"
cp "$ROOT/backend/docker-entrypoint.sh" "$BACKUP/docker-entrypoint.sh"
cp "$ROOT/backend/src/app.ts" "$BACKUP/app.ts"
cp "$ROOT/backend/src/config/env.ts" "$BACKUP/env.ts"
cp "$ROOT/frontend/src/pages/TaskListPage.tsx" "$BACKUP/TaskListPage.final"
cp "$ROOT/frontend/src/pages/TaskCreatePage.tsx" "$BACKUP/TaskCreatePage.final"
cp "$ROOT/backend/src/routes/task.routes.ts" "$BACKUP/task.routes.final"
cp "$ROOT/backend/src/controllers/task.controller.ts" "$BACKUP/task.controller.final"
cp "$ROOT/backend/src/validators/task.validator.ts" "$BACKUP/task.validator.final"
cp "$ROOT/backend/src/services/task.service.ts" "$BACKUP/task.service.final"
cp "$ROOT/backend/src/repositories/task.repository.ts" "$BACKUP/task.repository.final"
cp "$ROOT/backend/src/types/task.types.ts" "$BACKUP/task.types.final"
cp "$ROOT/backend/src/utils/taskTree.ts" "$BACKUP/taskTree.final"
cp "$ROOT/backend/src/repositories/skill.repository.ts" "$BACKUP/skill.repository.final"
fi

git init 2>/dev/null || true

if git rev-parse HEAD >/dev/null 2>&1; then
  echo "Existing repository detected; skipping M1 commit."
  SKIP_M1=1
else
  SKIP_M1=0
fi

# --- M1: Infrastructure & Database Foundation ---
if [ "$SKIP_M1" -eq 0 ]; then
cat > docker-compose.yml <<'EOF'
services:
  postgres:
    image: postgres:16-alpine
    container_name: htx-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-taskapp}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-taskapp_secret}
      POSTGRES_DB: ${POSTGRES_DB:-taskapp}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-taskapp} -d ${POSTGRES_DB:-taskapp}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: htx-backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-taskapp}:${POSTGRES_PASSWORD:-taskapp_secret}@postgres:5432/${POSTGRES_DB:-taskapp}
      PORT: 3000
      NODE_ENV: production
      CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost:5173}
      GEMINI_API_KEY: ${GEMINI_API_KEY:-}
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

volumes:
  postgres_data:
EOF

cat > .env.example <<'EOF'
# PostgreSQL
POSTGRES_USER=taskapp
POSTGRES_PASSWORD=taskapp_secret
POSTGRES_DB=taskapp

# Backend
DATABASE_URL=postgresql://taskapp:taskapp_secret@localhost:5432/taskapp
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
GEMINI_API_KEY=

# Frontend (used at build time)
VITE_API_BASE_URL=http://localhost:3000/api
EOF

cat > backend/.env.example <<'EOF'
DATABASE_URL=postgresql://taskapp:taskapp_secret@localhost:5432/taskapp
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
GEMINI_API_KEY=
EOF

node -e "
const fs=require('fs');
const pkg=JSON.parse(fs.readFileSync('backend/package.json','utf8'));
delete pkg.dependencies['@google/generative-ai'];
fs.writeFileSync('backend/package.json', JSON.stringify(pkg,null,2)+'\n');
"

cat > backend/docker-entrypoint.sh <<'EOF'
#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts
fi

exec "$@"
EOF

cat > backend/src/config/env.ts <<'EOF'
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  GEMINI_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${formatted}`);
  }

  return result.data;
}

export const env = parseEnv();
EOF

cat > backend/src/app.ts <<'EOF'
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorMiddleware } from "./middleware/error.middleware";
import { sendSuccess } from "./utils/apiResponse";
import type { HealthResponse } from "./types/api.types";

export function createApp(): express.Application {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    const data: HealthResponse = {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
    return sendSuccess(res, data);
  });

  app.use(errorMiddleware);

  return app;
}
EOF

git add .gitignore .env.example docker-compose.yml \
  backend/package.json backend/package-lock.json backend/tsconfig.json \
  backend/Dockerfile backend/docker-entrypoint.sh backend/.env.example \
  backend/prisma/ \
  backend/src/index.ts backend/src/app.ts \
  backend/src/config/ \
  backend/src/middleware/error.middleware.ts \
  backend/src/types/api.types.ts \
  backend/src/utils/errors.ts backend/src/utils/apiResponse.ts backend/src/utils/asyncHandler.ts

git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
chore: initialize infrastructure and database foundation

Add Docker Compose, Prisma schema with migrations and seed data, and a
backend skeleton with health check and centralized error handling.
EOF
)"

fi

# --- M2: Read APIs ---
cp "$BACKUP/app.ts" backend/src/app.ts

cat > backend/src/routes/task.routes.ts <<'EOF'
import { Router } from "express";
import { getTaskById, listTasks } from "../controllers/task.controller";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import { listTasksQuerySchema } from "../validators/task.validator";

const taskRouter = Router();

taskRouter.get("/", validate({ query: listTasksQuerySchema }), listTasks);

taskRouter.get(
  "/:id",
  validate({ params: idParamSchema, query: listTasksQuerySchema }),
  getTaskById,
);

export default taskRouter;
EOF

cat > backend/src/controllers/task.controller.ts <<'EOF'
import type { Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import type { ValidatedRequest } from "../types/express.types";
import { taskService } from "../services/task.service";
import type { IdParam } from "../validators/common.validator";
import type { ListTasksQuery } from "../validators/task.validator";

export const listTasks = asyncHandler(
  async (req: ValidatedRequest<unknown, ListTasksQuery>, res: Response) => {
    const tasks = await taskService.listTasks(req.validated.query ?? {});
    sendSuccess(res, tasks);
  },
);

export const getTaskById = asyncHandler(
  async (req: ValidatedRequest<IdParam>, res: Response) => {
    const { id } = req.validated.params as IdParam;
    const task = await taskService.getTaskById(id);
    sendSuccess(res, task);
  },
);
EOF

cat > backend/src/validators/task.validator.ts <<'EOF'
import { z } from "zod";

export const listTasksQuerySchema = z
  .object({
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  })
  .strict();

export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
EOF

cat > backend/src/services/task.service.ts <<'EOF'
import { NotFoundError } from "../utils/errors";
import type { TaskDTO } from "../types/task.types";
import type { ListTasksQuery } from "../validators/task.validator";
import { taskRepository } from "../repositories/task.repository";

export class TaskService {
  constructor(private readonly repository = taskRepository) {}

  async listTasks(query: ListTasksQuery): Promise<TaskDTO[]> {
    return this.repository.findRootTasks(query.status);
  }

  async getTaskById(id: number): Promise<TaskDTO> {
    const task = await this.repository.findTaskTreeById(id);

    if (!task) {
      throw new NotFoundError(`Task with id ${id} not found`);
    }

    return task;
  }
}

export const taskService = new TaskService();
EOF

cat > backend/src/repositories/task.repository.ts <<'EOF'
import type { TaskStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { TaskDTO } from "../types/task.types";
import {
  buildTaskSubtree,
  buildTaskTree,
  taskInclude,
  type TaskWithRelations,
} from "../utils/taskMapper";

export class TaskRepository {
  async findAllWithRelations(status?: TaskStatus): Promise<TaskWithRelations[]> {
    return prisma.task.findMany({
      where: status ? { status } : undefined,
      include: taskInclude,
      orderBy: { id: "asc" },
    });
  }

  async findByIdWithRelations(id: number): Promise<TaskWithRelations | null> {
    return prisma.task.findUnique({
      where: { id },
      include: taskInclude,
    });
  }

  async findRootTasks(status?: TaskStatus): Promise<TaskDTO[]> {
    const tasks = await this.findAllWithRelations(status);
    return buildTaskTree(tasks, null);
  }

  async findTaskTreeById(id: number): Promise<TaskDTO | null> {
    const tasks = await this.findAllWithRelations();
    return buildTaskSubtree(tasks, id);
  }
}

export const taskRepository = new TaskRepository();
EOF

cat > backend/src/types/task.types.ts <<'EOF'
import type { DeveloperDTO } from "./developer.types";
import type { SkillDTO } from "./skill.types";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface TaskDTO {
  id: number;
  title: string;
  status: TaskStatus;
  skills: SkillDTO[];
  assignedDeveloper: DeveloperDTO | null;
  subtasks: TaskDTO[];
  createdAt: string;
  updatedAt: string;
}
EOF

git add backend/src/routes/ \
  backend/src/controllers/ \
  backend/src/services/developer.service.ts \
  backend/src/services/skill.service.ts \
  backend/src/services/task.service.ts \
  backend/src/repositories/ \
  backend/src/validators/ \
  backend/src/middleware/notFound.middleware.ts \
  backend/src/middleware/validate.middleware.ts \
  backend/src/types/developer.types.ts \
  backend/src/types/skill.types.ts \
  backend/src/types/task.types.ts \
  backend/src/types/express.types.ts \
  backend/src/utils/taskMapper.ts \
  backend/src/app.ts

git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
feat(backend): add read APIs for tasks, developers, and skills

Implement layered GET endpoints with Zod validation, consistent response
envelopes, and nested task tree serialization.
EOF
)"

# --- M3: Task Creation ---
cp "$BACKUP/task.routes.final" backend/src/routes/task.routes.ts
cp "$BACKUP/task.controller.final" backend/src/controllers/task.controller.ts
cp "$BACKUP/task.validator.final" backend/src/validators/task.validator.ts
cp "$BACKUP/task.types.final" backend/src/types/task.types.ts
cp "$BACKUP/taskTree.final" backend/src/utils/taskTree.ts
cp "$BACKUP/task.repository.final" backend/src/repositories/task.repository.ts

cat > backend/src/services/task.service.ts <<'EOF'
import { NotFoundError } from "../utils/errors";
import type { CreateTaskInput, TaskDTO } from "../types/task.types";
import type { ListTasksQuery } from "../validators/task.validator";
import { taskRepository } from "../repositories/task.repository";
import { skillRepository } from "../repositories/skill.repository";
import { collectSkillIds } from "../utils/taskTree";

export class TaskService {
  constructor(
    private readonly repository = taskRepository,
    private readonly skills = skillRepository,
  ) {}

  async listTasks(query: ListTasksQuery): Promise<TaskDTO[]> {
    return this.repository.findRootTasks(query.status);
  }

  async getTaskById(id: number): Promise<TaskDTO> {
    const task = await this.repository.findTaskTreeById(id);

    if (!task) {
      throw new NotFoundError(`Task with id ${id} not found`);
    }

    return task;
  }

  async createTask(input: CreateTaskInput): Promise<TaskDTO> {
    await this.validateSkillIds(input);
    return this.repository.createTaskTree(input);
  }

  private async validateSkillIds(input: CreateTaskInput): Promise<void> {
    const skillIds = collectSkillIds(input);

    if (skillIds.length === 0) {
      return;
    }

    const skills = await this.skills.findByIds(skillIds);
    const foundIds = new Set(skills.map((skill) => skill.id));
    const missingIds = skillIds.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new NotFoundError(`Skill not found: ${missingIds.join(", ")}`);
    }
  }
}

export const taskService = new TaskService();
EOF

# M3-era create route only (no PATCH yet)
cat > backend/src/routes/task.routes.ts <<'EOF'
import { Router } from "express";
import { createTask, getTaskById, listTasks } from "../controllers/task.controller";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import { createTaskBodySchema, listTasksQuerySchema } from "../validators/task.validator";

const taskRouter = Router();

taskRouter.get("/", validate({ query: listTasksQuerySchema }), listTasks);

taskRouter.post("/", validate({ body: createTaskBodySchema }), createTask);

taskRouter.get(
  "/:id",
  validate({ params: idParamSchema, query: listTasksQuerySchema }),
  getTaskById,
);

export default taskRouter;
EOF

cat > backend/src/controllers/task.controller.ts <<'EOF'
import type { Response } from "express";
import { sendCreated, sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import type { ValidatedRequest } from "../types/express.types";
import { taskService } from "../services/task.service";
import type { IdParam } from "../validators/common.validator";
import type { CreateTaskBody, ListTasksQuery } from "../validators/task.validator";

export const listTasks = asyncHandler(
  async (req: ValidatedRequest<unknown, ListTasksQuery>, res: Response) => {
    const tasks = await taskService.listTasks(req.validated.query ?? {});
    sendSuccess(res, tasks);
  },
);

export const getTaskById = asyncHandler(
  async (req: ValidatedRequest<IdParam>, res: Response) => {
    const { id } = req.validated.params as IdParam;
    const task = await taskService.getTaskById(id);
    sendSuccess(res, task);
  },
);

export const createTask = asyncHandler(
  async (req: ValidatedRequest<unknown, unknown, CreateTaskBody>, res: Response) => {
    const body = req.validated.body as CreateTaskBody;
    const task = await taskService.createTask(body);
    sendCreated(res, task);
  },
);
EOF

cat > backend/src/validators/task.validator.ts <<'EOF'
import { z } from "zod";
import type { CreateTaskInput } from "../types/task.types";

export const listTasksQuerySchema = z
  .object({
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  })
  .strict();

export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

export const createTaskBodySchema: z.ZodType<CreateTaskInput> = z.lazy(() =>
  z.object({
    title: z.string().trim().min(1, "Title is required"),
    skillIds: z.array(z.coerce.number().int().positive()).optional(),
    subtasks: z.array(createTaskBodySchema).optional(),
  }),
);

export type CreateTaskBody = z.infer<typeof createTaskBodySchema>;
EOF

cat > backend/src/types/task.types.ts <<'EOF'
import type { DeveloperDTO } from "./developer.types";
import type { SkillDTO } from "./skill.types";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface TaskDTO {
  id: number;
  title: string;
  status: TaskStatus;
  skills: SkillDTO[];
  assignedDeveloper: DeveloperDTO | null;
  subtasks: TaskDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  skillIds?: number[];
  subtasks?: CreateTaskInput[];
}
EOF

git add backend/src/utils/taskTree.ts \
  backend/src/validators/task.validator.ts \
  backend/src/repositories/task.repository.ts \
  backend/src/services/task.service.ts \
  backend/src/controllers/task.controller.ts \
  backend/src/routes/task.routes.ts \
  backend/src/types/task.types.ts

git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
feat(backend): implement nested task creation

Add POST /tasks with recursive subtask support, skill validation, and
transactional tree inserts.
EOF
)"

# --- M4: Business Rules ---
cp "$BACKUP/task.routes.final" backend/src/routes/task.routes.ts
cp "$BACKUP/task.controller.final" backend/src/controllers/task.controller.ts
cp "$BACKUP/task.validator.final" backend/src/validators/task.validator.ts
cp "$BACKUP/task.types.final" backend/src/types/task.types.ts
cp "$BACKUP/taskTree.final" backend/src/utils/taskTree.ts
cp "$BACKUP/task.repository.final" backend/src/repositories/task.repository.ts

cat > backend/src/services/task.service.ts <<'EOF'
import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from "../utils/errors";
import type { CreateTaskInput, TaskDTO, UpdateTaskInput } from "../types/task.types";
import type { ListTasksQuery } from "../validators/task.validator";
import { taskRepository } from "../repositories/task.repository";
import { skillRepository } from "../repositories/skill.repository";
import { developerRepository } from "../repositories/developer.repository";
import {
  collectSkillIds,
  developerHasRequiredSkills,
  findDescendants,
} from "../utils/taskTree";

export class TaskService {
  constructor(
    private readonly repository = taskRepository,
    private readonly skills = skillRepository,
    private readonly developers = developerRepository,
  ) {}

  async listTasks(query: ListTasksQuery): Promise<TaskDTO[]> {
    return this.repository.findRootTasks(query.status);
  }

  async getTaskById(id: number): Promise<TaskDTO> {
    const task = await this.repository.findTaskTreeById(id);

    if (!task) {
      throw new NotFoundError(`Task with id ${id} not found`);
    }

    return task;
  }

  async createTask(input: CreateTaskInput): Promise<TaskDTO> {
    await this.validateSkillIds(input);
    return this.repository.createTaskTree(input);
  }

  async updateTask(id: number, input: UpdateTaskInput): Promise<TaskDTO> {
    const task = await this.repository.findByIdWithRelations(id);

    if (!task) {
      throw new NotFoundError(`Task with id ${id} not found`);
    }

    if (input.status === "DONE") {
      await this.ensureAllDescendantsDone(id);
    }

    if (input.assignedDeveloperId !== undefined) {
      await this.validateAssignment(task.skills, input.assignedDeveloperId);
    }

    await this.repository.update(id, input);

    const updatedTask = await this.repository.findTaskTreeById(id);

    if (!updatedTask) {
      throw new Error(`Failed to load updated task with id ${id}`);
    }

    return updatedTask;
  }

  private async validateSkillIds(input: CreateTaskInput): Promise<void> {
    const skillIds = collectSkillIds(input);

    if (skillIds.length === 0) {
      return;
    }

    const skills = await this.skills.findByIds(skillIds);
    const foundIds = new Set(skills.map((skill) => skill.id));
    const missingIds = skillIds.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new NotFoundError(`Skill not found: ${missingIds.join(", ")}`);
    }
  }

  private async ensureAllDescendantsDone(taskId: number): Promise<void> {
    const allTasks = await this.repository.findAllWithRelations();
    const descendants = findDescendants(taskId, allTasks);
    const incomplete = descendants.filter((descendant) => descendant.status !== "DONE");

    if (incomplete.length > 0) {
      const incompleteIds = incomplete.map((descendant) => descendant.id).join(", ");
      throw new ConflictError(
        `Cannot mark task as DONE until all subtasks are DONE. Incomplete subtask ids: ${incompleteIds}`,
      );
    }
  }

  private async validateAssignment(
    taskSkills: { skill: { id: number; name: string } }[],
    assignedDeveloperId: number | null,
  ): Promise<void> {
    if (assignedDeveloperId === null) {
      return;
    }

    const developer = await this.developers.findById(assignedDeveloperId);

    if (!developer) {
      throw new NotFoundError(`Developer with id ${assignedDeveloperId} not found`);
    }

    const requiredSkillIds = taskSkills.map((entry) => entry.skill.id);
    const developerSkillIds = developer.skills.map((skill) => skill.id);

    if (!developerHasRequiredSkills(requiredSkillIds, developerSkillIds)) {
      const missingSkillNames = taskSkills
        .filter((entry) => !developerSkillIds.includes(entry.skill.id))
        .map((entry) => entry.skill.name);

      throw new UnprocessableEntityError(
        `Developer "${developer.name}" lacks required skills: ${missingSkillNames.join(", ")}`,
      );
    }
  }
}

export const taskService = new TaskService();
EOF

git add backend/src/utils/taskTree.ts \
  backend/src/validators/task.validator.ts \
  backend/src/repositories/task.repository.ts \
  backend/src/services/task.service.ts \
  backend/src/controllers/task.controller.ts \
  backend/src/routes/task.routes.ts \
  backend/src/types/task.types.ts

git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
feat(backend): enforce assignment and status business rules

Add PATCH /tasks/:id with skill-based assignment validation and parent
DONE gating until all descendants are complete.
EOF
)"

# --- M5: Gemini Integration ---
cp "$BACKUP/backend-package.json" backend/package.json
cp "$BACKUP/env.ts" backend/src/config/env.ts
cp "$BACKUP/task.service.final" backend/src/services/task.service.ts
cp "$BACKUP/task.controller.final" backend/src/controllers/task.controller.ts
cp "$BACKUP/task.types.final" backend/src/types/task.types.ts
cp "$BACKUP/skill.repository.final" backend/src/repositories/skill.repository.ts

git add backend/package.json backend/package-lock.json \
  backend/src/config/env.ts \
  backend/src/services/gemini.service.ts \
  backend/src/utils/geminiParser.ts \
  backend/src/repositories/skill.repository.ts \
  backend/src/services/task.service.ts \
  backend/src/controllers/task.controller.ts \
  backend/src/types/task.types.ts

git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
feat(backend): integrate Gemini skill inference on task creation

Automatically infer skills when omitted at create time, with graceful
fallback and warnings when the API is unavailable.
EOF
)"

# --- M6: Frontend Foundation ---
mkdir -p frontend/src/pages

cat > frontend/src/pages/TaskListPage.tsx <<'EOF'
import { PageContainer } from "@/components/layout/PageContainer";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useDevelopers } from "@/hooks/useDevelopers";
import { useSkills } from "@/hooks/useSkills";
import { useTasks } from "@/hooks/useTasks";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function TaskListPage() {
  const tasksQuery = useTasks();
  const developersQuery = useDevelopers();
  const skillsQuery = useSkills();

  const isLoading = tasksQuery.isLoading || developersQuery.isLoading || skillsQuery.isLoading;
  const error = tasksQuery.error ?? developersQuery.error ?? skillsQuery.error;

  return (
    <PageContainer
      title="Task List"
      description="View and manage tasks. Full task management UI will be implemented in the next milestone."
    >
      {isLoading ? <Spinner label="Loading application data..." /> : null}
      {error ? (
        <Alert variant="error" title="Failed to load data" message={getErrorMessage(error, "Unable to reach the API.")} />
      ) : null}
      {!isLoading && !error ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Root tasks</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{tasksQuery.data?.length ?? 0}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Developers</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{developersQuery.data?.length ?? 0}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Skills</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{skillsQuery.data?.length ?? 0}</p>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
EOF

cat > frontend/src/pages/TaskCreatePage.tsx <<'EOF'
import { PageContainer } from "@/components/layout/PageContainer";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useSkills } from "@/hooks/useSkills";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function TaskCreatePage() {
  const skillsQuery = useSkills();

  return (
    <PageContainer
      title="Create Task"
      description="Build nested tasks with required skills. The creation form will be implemented in the next milestone."
    >
      {skillsQuery.isLoading ? <Spinner label="Loading skills..." /> : null}
      {skillsQuery.error ? (
        <Alert variant="error" title="Failed to load skills" message={getErrorMessage(skillsQuery.error)} />
      ) : null}
      {!skillsQuery.isLoading && !skillsQuery.error ? (
        <Alert variant="info" message={`API connected. ${skillsQuery.data?.length ?? 0} skills available for task creation.`} />
      ) : null}
    </PageContainer>
  );
}
EOF

git add frontend/package.json frontend/package-lock.json \
  frontend/tsconfig.json frontend/tsconfig.node.json \
  frontend/vite.config.ts frontend/index.html \
  frontend/.env.example \
  frontend/src/main.tsx frontend/src/index.css frontend/src/vite-env.d.ts \
  frontend/src/routes/ \
  frontend/src/pages/TaskListPage.tsx \
  frontend/src/pages/TaskCreatePage.tsx \
  frontend/src/components/layout/ \
  frontend/src/components/ui/Alert.tsx \
  frontend/src/components/ui/Spinner.tsx \
  frontend/src/hooks/useTasks.ts \
  frontend/src/hooks/useDevelopers.ts \
  frontend/src/hooks/useSkills.ts \
  frontend/src/services/ \
  frontend/src/types/ \
  frontend/src/utils/getErrorMessage.ts \
  frontend/src/utils/queryKeys.ts

git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
feat(frontend): scaffold SPA with routing and data fetching

Set up Vite, React Router, TanStack Query, Axios, and placeholder pages
wired to the backend API.
EOF
)"

# --- M7: Task List Page ---
cp "$BACKUP/TaskListPage.final" frontend/src/pages/TaskListPage.tsx

git add frontend/src/hooks/useUpdateTask.ts \
  frontend/src/components/ui/Select.tsx \
  frontend/src/components/tasks/TaskList.tsx \
  frontend/src/components/tasks/TaskCard.tsx \
  frontend/src/components/tasks/SkillBadgeList.tsx \
  frontend/src/components/tasks/DeveloperSelect.tsx \
  frontend/src/components/tasks/TaskStatusSelect.tsx \
  frontend/src/pages/TaskListPage.tsx

git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
feat(frontend): implement task list with assign and status updates

Add recursive task cards with developer assignment and status controls,
surfacing backend validation errors without client-side rule enforcement.
EOF
)"

# --- M8: Task Creation Page ---
cp "$BACKUP/TaskCreatePage.final" frontend/src/pages/TaskCreatePage.tsx

git add frontend/package.json frontend/package-lock.json \
  frontend/src/components/ui/Input.tsx \
  frontend/src/components/ui/Button.tsx \
  frontend/src/components/tasks/SubtaskForm.tsx \
  frontend/src/components/tasks/TaskCreateForm.tsx \
  frontend/src/components/tasks/SkillMultiSelect.tsx \
  frontend/src/hooks/useCreateTask.ts \
  frontend/src/types/taskForm.types.ts \
  frontend/src/utils/mapTaskForm.ts \
  frontend/src/utils/formErrors.ts \
  frontend/src/pages/TaskCreatePage.tsx

git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
feat(frontend): implement recursive task creation form

Add React Hook Form with unlimited nested subtasks, skill multi-select,
and Gemini warning display after successful creation.
EOF
)"

# --- M9: Documentation & Production Polish ---
cp "$BACKUP/docker-compose.yml" docker-compose.yml
cp "$BACKUP/.env.example" .env.example
cp "$BACKUP/backend-env.example" backend/.env.example
cp "$BACKUP/docker-entrypoint.sh" backend/docker-entrypoint.sh
cp "$BACKUP/app.ts" backend/src/app.ts

git add README.md docker-compose.yml .env.example \
  backend/.env.example backend/docker-entrypoint.sh backend/.dockerignore \
  backend/src/app.ts \
  frontend/Dockerfile frontend/nginx.conf frontend/.dockerignore \
  scripts/create-milestone-commits.sh

git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
docs: add README and production Docker setup

Document architecture and API usage, add frontend nginx container with
API proxy, and polish CORS and database seeding for full-stack deploy.
EOF
)"

git checkout HEAD -- .
rm -rf "$BACKUP"

echo ""
echo "Created milestone commits:"
git log --oneline
