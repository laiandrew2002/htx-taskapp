import axios, { type AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export type ApiAxiosError = AxiosError<ApiErrorResponse>;

export function isApiAxiosError(error: unknown): error is ApiAxiosError {
  return axios.isAxiosError(error);
}
