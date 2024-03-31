import http, { ApiSuccessResponse } from "@/lib/http";

export interface RegistrationResponse {
  id: number;
  subject_id: string;
  student_id: string;
}

//----------------------------------------------GET LIST----------------------------------------------
export interface RegistrationGetAllParams {
  preload?: boolean;
  select?: string[];
}

export const registrationGetAll = async (params?: RegistrationGetAllParams) =>
  http.get<ApiSuccessResponse<RegistrationResponse[]>>(`registrations`).then((res) => res.data);

//----------------------------------------------GET ALL BY DEPARTMENT ID----------------------------------------------
export interface RegistrationGetAllByDepartmentIdParams {
  id: string;
}

export const registrationGetAllByDepartmentId = async (params: RegistrationGetAllByDepartmentIdParams) =>
  http.get<ApiSuccessResponse<RegistrationResponse[]>>(`registrations/department/${params.id}`).then((res) => res.data);

//----------------------------------------------GET ALL BY STUDENT NAME----------------------------------------------
export interface RegistrationGetAllByStudentNameParams {
  name: string;
}

export const registrationGetAllByStudentName = async (params: RegistrationGetAllByStudentNameParams) =>
  http.get<ApiSuccessResponse<RegistrationResponse[]>>(`registrations/student/${params.name}`).then((res) => res.data);

//----------------------------------------------CREATE----------------------------------------------

export interface RegistrationCreateParams extends Pick<RegistrationResponse, "subject_id" | "student_id"> {}

export const registrationCreate = async (params: RegistrationCreateParams) =>
  http.post<ApiSuccessResponse<RegistrationResponse>>("registrations", params).then((res) => res.data);

//----------------------------------------------UPDATE BY ID----------------------------------------------
export interface RegistrationUpdateByIdParams extends Pick<RegistrationResponse, "id" | "subject_id" | "student_id"> {}

export const registrationUpdateById = async (params: RegistrationUpdateByIdParams) =>
  http.put<ApiSuccessResponse<RegistrationResponse>>(`registrations/${params.id}`, params).then((res) => res.data);

//----------------------------------------------DELETE BY ID----------------------------------------------
export interface RegistrationDeleteByIdParams extends Pick<RegistrationResponse, "id"> {}

export const registrationDeleteById = async (params: RegistrationDeleteByIdParams) =>
  http.delete<ApiSuccessResponse>(`registrations/${params.id}`).then((res) => res.data);
