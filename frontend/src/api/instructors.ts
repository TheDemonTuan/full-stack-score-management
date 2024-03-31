import http, { ApiSuccessResponse } from "@/lib/http";
import { ClassResponse } from "./classes";
import { preloadTransform, selectTransform } from "@/lib/query-transform";
import { AssignmentResponse } from "./assignment";
import { GradeResponse } from "./grade";

export interface InstructorReponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  birth_day: Date;
  phone: string;
  gender: boolean;
  degree: string;
  department_id: number;
  classes: ClassResponse[];
  grades: GradeResponse[];
  assignments: AssignmentResponse[];
}

//----------------------------------------------GET ALL----------------------------------------------
export interface InstructorGetAllParams {
  preload?: boolean;
  select?: string[];
}

export const instructorGetAll = async (params?: InstructorGetAllParams) =>
  http
    .get<ApiSuccessResponse<InstructorReponse[]>>(
      `instructors?preload=${preloadTransform(params?.preload)}&select=${selectTransform(params?.select)}`
    )
    .then((res) => res.data);

//----------------------------------------------GET ALL BY DEPARTMENT ID----------------------------------------------
export interface InstructorGetAllByDepartmentIdParams extends Pick<InstructorReponse, "department_id"> {
  preload?: boolean;
  select?: string[];
}

export const instructorGetAllByDepartmentId = async (params?: InstructorGetAllByDepartmentIdParams) =>
  http
    .get<ApiSuccessResponse<InstructorReponse[]>>(
      `instructors/department/${params?.department_id}?preload=${preloadTransform(
        params?.preload
      )}&select=${selectTransform(params?.select)}`
    )
    .then((res) => res.data);

//----------------------------------------------CREATE----------------------------------------------
export interface InstructorCreateParams extends Omit<InstructorReponse, "id" | "classes" | "grades" | "assignments"> {}

export const instructorCreate = async (params: InstructorCreateParams) =>
  http.post<ApiSuccessResponse<InstructorReponse>>("instructors", params).then((res) => res.data);

//----------------------------------------------UPDATE----------------------------------------------
export interface InstructorUpdateByIdParams
  extends Omit<InstructorReponse, "classes" | "department_id" | "grades" | "assignments"> {}

export const instructorUpdateById = async (params: InstructorUpdateByIdParams) =>
  http.put<ApiSuccessResponse<InstructorReponse>>(`instructors/${params.id}`, params).then((res) => res.data);

//----------------------------------------------DELETE----------------------------------------------

export interface InstructorDeleteByIdParams extends Pick<InstructorReponse, "id"> {}

export const instructorDeleteById = async (params: InstructorDeleteByIdParams) =>
  http.delete<ApiSuccessResponse>(`instructors/${params.id}`).then((res) => res.data);
