import { setJwt } from "@/app/actions";
import http, { ApiSuccessResponse } from "@/lib/http";

// ----------------------------------------------LOGIN----------------------------------------------

export interface AuthLoginParams {
  username: string;
  password: string;
}

export const authLogin = async (params: AuthLoginParams) =>
  http.post<ApiSuccessResponse<UserResponse>>("auth/login", params).then(async (res) => {
    const authToken = res.headers["tdt-auth-token"];

    if (authToken) {
      await setJwt(authToken);
    }
    return res.data;
  });

// ----------------------------------------------Register----------------------------------------------

export interface AuthRegisterParams {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
}

export const authRegister = async (params: AuthRegisterParams) =>
  http.post<ApiSuccessResponse<UserResponse>>("auth/register", params).then(async (res) => {
    const authToken = res.headers["tdt-auth-token"];

    if (authToken) {
      await setJwt(authToken);
    }
    return res.data;
  });

// ----------------------------------------------Verify----------------------------------------------

export const authVerify = async () => http.get<ApiSuccessResponse<UserResponse>>("auth/verify").then((res) => res.data);

// ----------------------------------------------LOGOUT----------------------------------------------

export const authLogout = async () => http.delete(`auth/logout`).then((res) => res.data);
