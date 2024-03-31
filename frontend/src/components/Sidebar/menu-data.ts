import { TbCategory, TbSettingsCode } from "react-icons/tb";
import { PiStudent } from "react-icons/pi";
import { SiGoogleclassroom } from "react-icons/si";
import { LiaChalkboardTeacherSolid, LiaUsersCogSolid } from "react-icons/lia";
import { ImBooks } from "react-icons/im";
import { GiArchiveRegister, GiNotebook } from "react-icons/gi";
import { FaRegChartBar, FaUniversity } from "react-icons/fa";

export const MenuData = [
  {
    title: "Dashboard",
    link: "/",
    icon: FaUniversity,
  },
  {
    title: "Sinh viên",
    link: "/sinh-vien",
    icon: PiStudent,
    children: [
      {
        title: "Quản lý",
        link: "/quan-ly",
        icon: TbSettingsCode,
      },
      {
        title: "Đăng ký môn học",
        link: "/dang-ky-mon-hoc",
        icon: GiArchiveRegister,
      },
    ],
  },
  {
    title: "Giảng viên",
    link: "/giang-vien",
    icon: LiaChalkboardTeacherSolid,
    children: [
      {
        title: "Quản lý",
        link: "/quan-ly",
        icon: TbSettingsCode,
      },
      {
        title: "Phân công môn học",
        link: "/phan-cong-mon-hoc",
        icon: GiArchiveRegister,
      },
    ],
  },
  {
    title: "Khoa",
    link: "/khoa",
    icon: TbCategory,
  },
  {
    title: "Môn học",
    link: "/mon-hoc",
    icon: ImBooks,
  },
  {
    title: "Lớp học",
    link: "/lop-hoc",
    icon: SiGoogleclassroom,
  },
  {
    title: "Điểm",
    link: "/diem",
    icon: GiNotebook,
    children: [
      {
        title: "Quản lý",
        link: "/quan-ly",
        icon: TbSettingsCode,
      },
      {
        title: "Thống kê",
        link: "/thong-ke",
        icon: FaRegChartBar ,
      },
    ],
  },
];
