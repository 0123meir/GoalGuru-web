import { AxiosError } from "axios";

export type APIError = AxiosError<{ error: string }>;
