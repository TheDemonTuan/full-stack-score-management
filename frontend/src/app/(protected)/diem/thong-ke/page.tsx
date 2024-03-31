"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
import { SubjectResponse, subjectGetAll } from "@/api/subjects";
import { ApiSuccessResponse } from "@/lib/http";
import {
  Button,
  Card,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spinner,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { DepartmentResponse, departmentGetAll } from "@/api/departments";
import { RiArrowDownSLine } from "react-icons/ri";
import { capitalize } from "lodash";
import { CardContent } from "@/components/ui/card";
import { CiExport } from "react-icons/ci";
import { gradeExportByDepartmentId, gradeGetExcelList } from "@/api/grade";
import FileSaver from "file-saver";
import { toast } from "react-toastify";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const DiemThongKePage = () => {
  const [departmentFilter, setDepartmentFilter] = React.useState<string>("5");
  const [isDepartmentExporting, setIsDepartmentExporting] = React.useState<boolean>(false);
  const [isAllExporting, setIsAllExporting] = React.useState<boolean>(false);

  const { data: subjectsData, isLoading: subjectsIsLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => await subjectGetAll(),
    select: (res: ApiSuccessResponse<SubjectResponse[]>) => res?.data,
  });

  const { data: departmentsData, isLoading: departmentsIsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => await departmentGetAll(),
    select: (res: ApiSuccessResponse<DepartmentResponse[]>) => res?.data,
  });

  const handleExportByDepartment = async () => {
    try {
      setIsDepartmentExporting(true);
      const exportExcel = await gradeExportByDepartmentId({ department_id: departmentFilter });
      const excelBlob = new Blob([exportExcel], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      FileSaver.saveAs(
        excelBlob,
        departmentsData?.find((department) => department.id === parseInt(departmentFilter))?.name + ".xlsx" ||
          "export.xlsx"
      );
      toast.success("Xuất file thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xuất file");
    } finally {
      setIsDepartmentExporting(false);
    }
  };

  const handleExportAll = async () => {
    try {
      setIsAllExporting(true);
      const exportExcel = await gradeGetExcelList();
      const excelBlob = new Blob([exportExcel], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      FileSaver.saveAs(excelBlob, "grades.xlsx");
      toast.success("Xuất file thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xuất file");
    } finally {
      setIsAllExporting(false);
    }
  };

  if (subjectsIsLoading || departmentsIsLoading)
    return <Spinner label="Loading..." color="secondary" size="lg" className="w-full h-full" />;

  return (
    <Card>
      <CardHeader></CardHeader>
      <CardContent>
        <Tabs aria-label="Options" color="secondary" variant="bordered">
          <Tab
            key="each_subject"
            title={
              <div className="flex items-center space-x-2">
                <span>Tất cả môn học</span>
              </div>
            }>
            <div className="flex justify-end">
              <Button
                isLoading={isAllExporting}
                isDisabled={isAllExporting}
                endContent={<CiExport size={21} />}
                color="success"
                onClick={handleExportAll}>
                Export
              </Button>
            </div>
            <Line
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                  title: {
                    display: true,
                    text: "Thống kê điểm",
                  },
                },
              }}
              data={{
                labels: subjectsData?.map((subject) => subject.name) || [],
                datasets: [
                  {
                    fill: true,
                    label: "Trung bình điểm môn học",
                    data:
                      subjectsData?.map((subject) => {
                        let sum = 0;
                        let grades = subject.grades.filter((grade) => grade.subject_id === subject.id);
                        grades.forEach((grade) => {
                          sum +=
                            (grade.process_score * subject.process_percentage) / 100 +
                            (grade.midterm_score * subject.midterm_percentage) / 100 +
                            (grade.final_score * subject.final_percentage) / 100;
                        });
                        return sum ? sum / grades.length : 0;
                      }) || [],
                    borderColor: "rgb(53, 162, 235)",
                    backgroundColor: "rgba(53, 162, 235, 0.5)",
                  },
                ],
              }}
            />
          </Tab>
          <Tab
            key="each_department"
            title={
              <div className="flex items-center space-x-2">
                <span>Mỗi khoa</span>
              </div>
            }>
            <div className="grid grid-flow-col justify-between">
              <Dropdown className="col-span-1">
                <DropdownTrigger className="hidden sm:flex">
                  <Button endContent={<RiArrowDownSLine className="text-small" />} variant="ghost">
                    {departmentsData?.find((department) => department.id === parseInt(departmentFilter))?.name ||
                      "Không hiển thị"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Table Columns"
                  closeOnSelect={true}
                  color="secondary"
                  items={departmentsData}
                  defaultSelectedKeys={[departmentFilter]}
                  selectedKeys={[departmentFilter]}
                  selectionMode="single"
                  onSelectionChange={(e) => {
                    setDepartmentFilter(Array.from(e)?.at(0) as string);
                  }}>
                  {(item) => (
                    <DropdownItem key={item.id} className="capitalize">
                      {capitalize(item.name)}
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
              <Button
                isLoading={isDepartmentExporting}
                isDisabled={isDepartmentExporting}
                endContent={<CiExport size={21} />}
                className="mx-auto"
                color="success"
                onClick={handleExportByDepartment}>
                Export
              </Button>
            </div>
            <Line
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                  title: {
                    display: true,
                    text: "Thống kê điểm",
                  },
                },
              }}
              data={{
                labels:
                  subjectsData
                    ?.filter((subject) => subject.department_id === parseInt(departmentFilter))
                    .map((subject) => subject.name) || [],
                datasets: [
                  {
                    fill: true,
                    label: "Trung bình điểm mỗi môn học",
                    data:
                      subjectsData
                        ?.filter((subject) => subject.department_id === parseInt(departmentFilter))
                        ?.map((subject) => {
                          let sum = 0;
                          let grades = subject.grades.filter((grade) => grade.subject_id === subject.id);
                          grades.forEach((grade) => {
                            sum +=
                              (grade.process_score * subject.process_percentage) / 100 +
                              (grade.midterm_score * subject.midterm_percentage) / 100 +
                              (grade.final_score * subject.final_percentage) / 100;
                          });
                          return sum ? sum / grades.length : 0;
                        }) || [],
                    borderColor: "rgb(53, 162, 235)",
                    backgroundColor: "rgba(53, 162, 235, 0.5)",
                  },
                ],
              }}
            />
          </Tab>
          <Tab
            key="each_academic_year"
            title={
              <div className="flex items-center space-x-2">
                <span>Mỗi khoá học</span>
              </div>
            }></Tab>
          <Tab
            key="each_class"
            title={
              <div className="flex items-center space-x-2">
                <span>Mỗi lớp</span>
              </div>
            }></Tab>
          <Tab
            key="each_instructor"
            title={
              <div className="flex items-center space-x-2">
                <span>Mỗi giảng viên</span>
              </div>
            }></Tab>
          <Tab
            key="each_student"
            title={
              <div className="flex items-center space-x-2">
                <span>Mỗi sinh viên</span>
              </div>
            }></Tab>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DiemThongKePage;
