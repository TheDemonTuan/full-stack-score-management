import http, { ApiSuccessResponse } from "@/lib/http";
import { AssignmentResponse } from "./assignment";
import { RegistrationResponse } from "./registration";
import { GradeResponse } from "./grade";

export interface SubjectResponse {
  id: string;
  name: string;
  credits: number;
  process_percentage: number;
  midterm_percentage: number;
  final_percentage: number;
  department_id: number;
  grades: GradeResponse[];
  instructor_assignments: AssignmentResponse[];
  student_registrations: RegistrationResponse[];
}

//----------------------------------------------GET LIST----------------------------------------------
export const subjectGetAll = async () =>
  http.get<ApiSuccessResponse<SubjectResponse[]>>("subjects").then((res) => res.data);

//----------------------------------------------CREATE----------------------------------------------
export interface SubjectCreateParams
  extends Omit<SubjectResponse, "id" | "grades" | "instructor_assignments" | "student_registrations"> {}

export const subjectCreate = async (params: SubjectCreateParams) =>
  http.post<ApiSuccessResponse<SubjectResponse>>("subjects", params).then((res) => res.data);

//----------------------------------------------UPDATE----------------------------------------------
export interface SubjectUpdateByIdParams extends Omit<SubjectResponse, "department_id" | "grades" | "instructor_assignments" | "student_registrations"> {}

export const subjectUpdateById = async (params: SubjectUpdateByIdParams) =>
  http.put<ApiSuccessResponse<SubjectResponse>>(`subjects/${params.id}`, params).then((res) => res.data);

//----------------------------------------------DELETE----------------------------------------------
export interface SubjectDeleteByIdParams extends Pick<SubjectResponse, "id"> {}

export const subjectDeleteById = async (params: SubjectDeleteByIdParams) =>
  http.delete<ApiSuccessResponse<null>>(`subjects/${params.id}`).then((res) => res.data);
