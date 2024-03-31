import { clearJwt, getJwt, setJwt } from "@/app/actions";
import { useAuth } from "@/hooks/useAuth";
import axios, { AxiosError } from "axios";

export interface ApiSuccessResponse<T = null | []> {
  code: number;
  message: string;
  data: T;
}

interface ErrorResponse {
  code: number;
  message: string;
  data: null;
}

const http = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/api/`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use(
  async (config) => {
    const jwt = await getJwt();
    if (jwt) {
      config.headers["Authorization"] = `Bearer ${jwt}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error: ApiErrorResponse) => {
    if (error.response?.status === 401) {
      await clearJwt();
    }
    return Promise.reject(error);
  }
);

export type ApiErrorResponse = AxiosError<ErrorResponse>;

export default http;
