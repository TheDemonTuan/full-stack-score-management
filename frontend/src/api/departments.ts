import http, { ApiSuccessResponse } from "@/lib/http";
import { ClassResponse } from "./classes";
import { InstructorReponse } from "./instructors";
import { SubjectResponse } from "./subjects";
import { preloadTransform, selectTransform } from "@/lib/query-transform";
import { StudentResponse } from "./students";

export interface DepartmentResponse {
  id: number;
  symbol: string;
  name: string;
  classes: ClassResponse[];
  students: StudentResponse[];
  instructors: InstructorReponse[];
  subjects: SubjectResponse[];
}

//----------------------------------------------GET LIST----------------------------------------------
export interface DepartmentGetAllParams {
  preload?: boolean;
  select?: string[];
}

export const departmentGetAll = async (params?: DepartmentGetAllParams) =>
  http.get<ApiSuccessResponse<DepartmentResponse[]>>(`departments`).then((res) => res.data);

//----------------------------------------------GET BY ID----------------------------------------------
export interface DepartmentGetByIdParams extends Pick<DepartmentResponse, "id"> {
  preload?: boolean;
  select?: string[];
}

export const departmentGetById = async (params: DepartmentGetByIdParams) =>
  http
    .get<ApiSuccessResponse<DepartmentResponse>>(
      `departments/${params.id}?preload=${preloadTransform(params?.preload)}&select=${selectTransform(params?.select)}`
    )
    .then((res) => res.data);

//----------------------------------------------CREATE----------------------------------------------
export interface DepartmentCreateParams extends Pick<DepartmentResponse, "id" | "symbol" | "name"> {}

export const departmentCreate = async (params: DepartmentCreateParams) =>
  http.post<ApiSuccessResponse<DepartmentResponse>>("departments", params).then((res) => res.data);

//----------------------------------------------UPDATE BY ID----------------------------------------------
export interface DepartmentUpdateByIdParams extends Pick<DepartmentResponse, "id" | "name"> {}

export const departmentUpdateById = async (params: DepartmentUpdateByIdParams) =>
  http.put<ApiSuccessResponse<DepartmentResponse>>(`departments/${params.id}`, params).then((res) => res.data);

//----------------------------------------------DELETE BY ID----------------------------------------------
export interface DepartmentDeleteByIdParams extends Pick<DepartmentResponse, "id"> {}

export const departmentDeleteById = async (params: DepartmentDeleteByIdParams) =>
  http.delete<ApiSuccessResponse>(`departments/${params.id}`).then((res) => res.data);
