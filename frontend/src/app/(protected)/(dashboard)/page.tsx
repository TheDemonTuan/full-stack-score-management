"use client";

import { ClassResponse, classGetAll } from "@/api/classes";
import { DepartmentResponse, departmentGetAll } from "@/api/departments";
import { InstructorReponse, instructorGetAll } from "@/api/instructors";
import { StudentResponse, studentGetAll } from "@/api/students";
import { SubjectResponse, subjectGetAll } from "@/api/subjects";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiSuccessResponse } from "@/lib/http";
import { useSuspenseQueries } from "@tanstack/react-query";
import { ImBooks } from "react-icons/im";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { PiStudent } from "react-icons/pi";
import { SiGoogleclassroom } from "react-icons/si";
import { TbCategory } from "react-icons/tb";
import { AssignmentResponse, assignmentGetAll } from "@/api/assignment";
import { RegistrationResponse, registrationGetAll } from "@/api/registration";
import { GradeResponse, gradeGetAll } from "@/api/grade";
import { GiNotebook } from "react-icons/gi";
import { FaSwatchbook } from "react-icons/fa";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import NextImage from "next/image";
import { Image } from "@nextui-org/react";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const [
    departmentsQuery,
    instructorsQuery,
    studentsQuery,
    subjectsQuery,
    classesQuery,
    assignmentsQuery,
    registrationsQuery,
    gradesQuery,
  ] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["departments"],
        queryFn: async () => await departmentGetAll(),
        select: (res: ApiSuccessResponse<DepartmentResponse[]>) => res?.data.length,
      },
      {
        queryKey: ["instructors"],
        queryFn: async () => await instructorGetAll(),
        select: (res: ApiSuccessResponse<InstructorReponse[]>) => res?.data.length,
      },
      {
        queryKey: ["students"],
        queryFn: async () => await studentGetAll(),
        select: (res: ApiSuccessResponse<StudentResponse[]>) => res?.data.length,
      },
      {
        queryKey: ["subjects"],
        queryFn: async () => await subjectGetAll(),
        select: (res: ApiSuccessResponse<SubjectResponse[]>) => res?.data.length,
      },
      {
        queryKey: ["classes"],
        queryFn: async () => await classGetAll(),
        select: (res: ApiSuccessResponse<ClassResponse[]>) => res?.data.length,
      },
      {
        queryKey: ["assignments"],
        queryFn: async () => await assignmentGetAll(),
        select: (res: ApiSuccessResponse<AssignmentResponse[]>) => res?.data.length,
      },
      {
        queryKey: ["registrations"],
        queryFn: async () => await registrationGetAll(),
        select: (res: ApiSuccessResponse<RegistrationResponse[]>) => res?.data.length,
      },
      {
        queryKey: ["grades"],
        queryFn: async () => await gradeGetAll(),
        select: (res: ApiSuccessResponse<GradeResponse[]>) => res?.data.length,
      },
    ],
  });

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số lượng giảng viên</CardTitle>
            <LiaChalkboardTeacherSolid size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{instructorsQuery?.data}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số lượng sinh viên</CardTitle>
            <PiStudent size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{studentsQuery?.data}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số lượng môn học</CardTitle>
            <ImBooks size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{subjectsQuery?.data}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số lượng khoa</CardTitle>
            <TbCategory size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{departmentsQuery?.data}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số lượng lớp</CardTitle>
            <SiGoogleclassroom size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{classesQuery?.data}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số lượng môn học phân công</CardTitle>
            <FaSwatchbook size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{assignmentsQuery?.data}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số lượng môn học đăng ký</CardTitle>
            <FaSwatchbook size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{registrationsQuery?.data}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số lượng điểm</CardTitle>
            <GiNotebook size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{gradesQuery?.data}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Thống kê</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Pie
              data={{
                labels: [
                  "Giảng viên",
                  "Sinh viên",
                  "Môn học",
                  "Khoa",
                  "Lớp học",
                  "Môn học phân công",
                  "Môn học đăng ký",
                  "Điểm",
                ],
                datasets: [
                  {
                    label: "# of Votes",
                    data: [
                      instructorsQuery.data,
                      studentsQuery?.data,
                      subjectsQuery?.data,
                      departmentsQuery?.data,
                      classesQuery?.data,
                      assignmentsQuery?.data,
                      registrationsQuery?.data,
                      gradesQuery?.data,
                    ],
                    backgroundColor: [
                      "rgba(255, 99, 132, 0.2)",
                      "rgba(54, 162, 235, 0.2)",
                      "rgba(255, 206, 86, 0.2)",
                      "rgba(75, 192, 192, 0.2)",
                      "rgba(153, 102, 255, 0.2)",
                      "rgba(255, 159, 64, 0.2)",
                      "rgba(240, 128, 128, 0.2)",
                      "rgba(0, 128, 0, 0.2)",
                    ],
                    borderColor: [
                      "rgba(255, 99, 132, 1)",
                      "rgba(54, 162, 235, 1)",
                      "rgba(255, 206, 86, 1)",
                      "rgba(75, 192, 192, 1)",
                      "rgba(153, 102, 255, 1)",
                      "rgba(255, 159, 64, 1)",
                      "rgba(240, 128, 128, 1)",
                      "rgba(0, 128, 0, 1)",
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
            />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>Chatting</CardHeader>
          <CardContent>
            <div className="chat chat-start">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <Image
                    as={NextImage}
                    alt="Tailwind CSS chat bubble component"
                    className="object-contain w-16 h-16"
                    src="/guest-avatar.png"
                    priority={true}
                    width={500}
                    height={500}
                    quality={100}
                    isBlurred
                  />
                </div>
              </div>
              <div className="chat-header">
                Nguyễn Viết Tuấn
                <time className="text-xs opacity-50">12:45</time>
              </div>
              <div className="chat-bubble">website xịn quá em ơi!</div>
            </div>
            <div className="chat chat-end">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <Image
                    as={NextImage}
                    alt="Tailwind CSS chat bubble component"
                    className="object-contain w-16 h-16"
                    src="/guest-avatar.png"
                    priority={true}
                    width={500}
                    height={500}
                    quality={100}
                    isBlurred
                  />
                </div>
              </div>
              <div className="chat-header">
                Nguyễn Viết Tuấn
                <time className="text-xs opacity-50">12:46</time>
              </div>
              <div className="chat-bubble">chứ sao nữa anh ơi</div>
              <div className="chat-footer opacity-50">Seen at 12:46</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
