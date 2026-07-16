import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { TaskCreatePage } from "@/pages/TaskCreatePage";
import { TaskListPage } from "@/pages/TaskListPage";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <TaskListPage />,
      },
      {
        path: "tasks/new",
        element: <TaskCreatePage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
