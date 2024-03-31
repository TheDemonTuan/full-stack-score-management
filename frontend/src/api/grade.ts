import http, { ApiSuccessResponse } from "@/lib/http";
export interface GradeResponse {
  id: number;
  process_score: number;
  midterm_score: number;
  final_score: number;
  subject_id: string;
  student_id: string;
  by_instructor_id: string;
}

//----------------------------------------------GET LIST----------------------------------------------
export interface GradeGetAllParams {
  preload?: boolean;
  select?: string[];
}

export const gradeGetAll = async (params?: GradeGetAllParams) =>
  http.get<ApiSuccessResponse<GradeResponse[]>>(`grades`).then((res) => res.data);

//----------------------------------------------GET ALL BY DEPARTMENT ID----------------------------------------------
export interface GradeGetAllByDepartmentIdParams {
  department_id: string;
}

export const gradeGetAllByDepartmentId = async (params: GradeGetAllByDepartmentIdParams) =>
  http.get<ApiSuccessResponse<GradeResponse[]>>(`grades/department/${params.department_id}`).then((res) => res.data);

//----------------------------------------------GET EXCEL LIST----------------------------------------------
export const gradeGetExcelList = async () =>
  http
    .get(`grades/export`, {
      responseType: "blob",
    })
    .then((res) => res.data);
//----------------------------------------------EXPORT BY DEPARTMENT ID----------------------------------------------
export interface GradeExportByDepartmentIdParams {
  department_id: string;
}

export const gradeExportByDepartmentId = async (params: GradeExportByDepartmentIdParams) =>
  http
    .get(`grades/export/department/${params.department_id}`, {
      responseType: "blob",
    })
    .then((res) => res.data);

//----------------------------------------------CREATE----------------------------------------------
export interface GradeCreateParams extends Omit<GradeResponse, "id"> {}

export const gradeCreate = async (params: GradeCreateParams) =>
  http.post<ApiSuccessResponse<GradeResponse>>("grades", params).then((res) => res.data);

//----------------------------------------------UPDATE----------------------------------------------
export interface GradeUpdateByIdParams extends Omit<GradeResponse, "subject_id" | "student_id" | "by_instructor_id"> {}

export const gradeUpdateById = async (params: GradeUpdateByIdParams) =>
  http.put<ApiSuccessResponse<GradeResponse>>(`grades/${params.id}`, params).then((res) => res.data);

//----------------------------------------------DELETE----------------------------------------------
export interface GradeDeleteByIdParams extends Pick<GradeResponse, "id"> {}

export const gradeDeleteById = async (params: GradeDeleteByIdParams) =>
  http.delete<ApiSuccessResponse>(`grades/${params.id}`).then((res) => res.data);
