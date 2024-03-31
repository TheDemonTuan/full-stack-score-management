import http, { ApiSuccessResponse } from "@/lib/http";
import { RegistrationResponse } from "./registration";
import { GradeResponse } from "./grade";

export interface StudentResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  birth_day: Date;
  phone: string;
  gender: boolean;
  academic_year: number;
  department_id: number;
  class_id: string;
  grades: GradeResponse[];
  registrations: RegistrationResponse[];
}

//----------------------------------------------GET ALL----------------------------------------------\
export interface StudentGetAllParams {
  preload?: boolean;
  select?: string[];
}

export const studentGetAll = async (params?: StudentGetAllParams) =>
  http.get<ApiSuccessResponse<StudentResponse[]>>(`students`).then((res) => res.data);

//----------------------------------------------GET BY ID----------------------------------------------\
export interface StudentGetByIdParams extends Pick<StudentResponse, "id">{}

export const studentGetById = async (id: string) =>
  http.get<ApiSuccessResponse<StudentResponse>>(`students/${id}`).then((res) => res.data);

//----------------------------------------------CREATE----------------------------------------------\

export interface StudentCreateParams extends Omit<StudentResponse, "id" | "grades" | "registrations"> {}

export const studentCreate = async (params: StudentCreateParams) =>
  http.post<ApiSuccessResponse<StudentResponse>>(`students`, params).then((res) => res.data);

//----------------------------------------------UPDATE----------------------------------------------\
export interface StudentUpdateByIdParams extends Omit<StudentResponse,"academic_year" | "department_id" | "grades" | "registrations"> {}

export const studentUpdateById = async (params: StudentUpdateByIdParams) =>
  http.put<ApiSuccessResponse<StudentResponse>>(`students/${params.id}`, params).then((res) => res.data);

//----------------------------------------------DELETE----------------------------------------------\
export interface StudentDeleteByIdParams extends Pick<StudentResponse, "id">{}

export const studentDeleteById = async (params: StudentDeleteByIdParams) =>
  http.delete<ApiSuccessResponse>(`students/${params.id}`).then((res) => res.data);