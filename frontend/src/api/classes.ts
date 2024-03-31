import http, { ApiSuccessResponse } from "@/lib/http";
import { StudentResponse } from "./students";

export interface ClassResponse {
  id: string;
  name: string;
  max_students: number;
  department_id: number;
  academic_year: number;
  host_instructor_id: string;
  students: StudentResponse[];
}

//----------------------------------------------GET LIST----------------------------------------------

export const classGetAll = async () => http.get<ApiSuccessResponse<ClassResponse[]>>("classes").then((res) => res.data);

//----------------------------------------------GET BY ID----------------------------------------------
export interface ClassGetByIdParams extends Pick<ClassResponse, "id"> {}

export const classGetById = async (params: ClassGetByIdParams) =>
  http.get<ApiSuccessResponse<ClassResponse>>(`classes/${params.id}`).then((res) => res.data);

//----------------------------------------------CREATE----------------------------------------------

export interface ClassCreateParams extends Pick<ClassResponse, "max_students" | "department_id"> {
  number_class: number;
  academic_year: number;
}

export const classCreate = async (params: ClassCreateParams) =>
  http.post<ApiSuccessResponse<ClassResponse>>("classes", params).then((res) => res.data);

//----------------------------------------------UPDATE BY ID----------------------------------------------
export interface ClassUpdateByIdParams extends Pick<ClassResponse, "id" | "max_students" | "host_instructor_id"> {}

export const classUpdateById = async (params: ClassUpdateByIdParams) =>
  http.put<ApiSuccessResponse<ClassResponse>>(`classes/${params.id}`, params).then((res) => res.data);

//----------------------------------------------DELETE BY ID----------------------------------------------
export interface ClassDeleteByIdParams extends Pick<ClassResponse, "id"> {}

export const classDeleteById = async (params: ClassDeleteByIdParams) =>
  http.delete<ApiSuccessResponse>(`classes/${params.id}`).then((res) => res.data);
