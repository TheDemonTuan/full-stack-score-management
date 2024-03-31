package controllers

import (
	"errors"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"
	"qldiemsv/common"
	"qldiemsv/models/entity"
	"qldiemsv/models/req"
	"sync"
)

// [GET] /api/grades
func GradeGetList(c *fiber.Ctx) error {
	var grades []entity.Grade

	if err := common.DBConn.Find(&grades).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(
		fiber.StatusOK,
		"Success",
		grades))
}

// [GET] /api/grades/:id
func GradeGetById(c *fiber.Ctx) error {
	id := c.Params("id")
	var grade entity.Grade

	if err := common.DBConn.First(&grade, "id = ?", id).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", grade))
}

// [GET] /api/grades/department/:id
func GradeGetAllByDepartmentId(c *fiber.Ctx) error {
	departmentId := c.Params("id")

	var department entity.Department
	if err := common.DBConn.First(&department, "id = ?", departmentId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy khoa")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	var subjectsId []string
	if err := common.DBConn.Model(&entity.Subject{}).Select("id").Where("department_id = ?", departmentId).Find(&subjectsId).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	var grades []entity.Grade
	if err := common.DBConn.Where("subject_id IN ?", subjectsId).Find(&grades).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", grades))
}

// [GET] /api/grades/export/department/:id
func GradeExportExcelByDepartmentId(c *fiber.Ctx) error {
	departmentId := c.Params("id")

	var department entity.Department
	if err := common.DBConn.First(&department, "id = ?", departmentId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy khoa")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	var subjectsId []string
	if err := common.DBConn.Model(&entity.Subject{}).Select("id").Where("department_id = ?", departmentId).Find(&subjectsId).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	var grades []entity.Grade
	if err := common.DBConn.Where("subject_id IN ?", subjectsId).Find(&grades).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	f := excelize.NewFile()
	defer func() {
		if err := f.Close(); err != nil {
			fmt.Println(err)
		}
	}()

	if err := f.SetSheetName("Sheet1", department.Name); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("Lỗi khi tạo file excel: %v", err))
	}

	if err := f.SetColWidth(department.Name, "A", "I", 20); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("Lỗi khi tạo file excel: %v", err))
	}

	var headers = []string{"Mã sinh viên", "Tên sinh viên", "Điểm quá trình", "Điểm giữa kỳ", "Điểm cuối kỳ", "Môn học", "Giảng viên dạy", "Ngày tạo", "Ngày cập nhật"}
	for idx, header := range headers {
		cell, err := excelize.CoordinatesToCellName(idx+1, 1)
		if err != nil {
			fmt.Println(err)
			return c.JSON(common.NewResponse(fiber.StatusInternalServerError, "Lỗi khi tạo file excel", nil))
		}
		if err := f.SetCellValue(department.Name, cell, header); err != nil {
			return err
		}
	}

	var wg sync.WaitGroup
	chErr := make(chan error, len(grades))
	wg.Add(len(grades))
	for idx, grade := range grades {
		go func(idx int, grade entity.Grade) {
			defer wg.Done()
			var student entity.Student
			if err := common.DBConn.First(&student, "id = ?", grade.StudentID).Error; err != nil {
				chErr <- err
				return
			}

			var subject entity.Subject
			if err := common.DBConn.First(&subject, "id = ?", grade.SubjectID).Error; err != nil {
				chErr <- err
				return
			}

			var instructor entity.Instructor
			if err := common.DBConn.First(&instructor, "id = ?", grade.ByInstructorID).Error; err != nil {
				chErr <- err
				return
			}

			data := []string{
				student.ID,
				student.FirstName + " " + student.LastName,
				fmt.Sprintf("%.2f", grade.ProcessScore),
				fmt.Sprintf("%.2f", grade.MidtermScore),
				fmt.Sprintf("%.2f", grade.FinalScore),
				subject.Name,
				instructor.FirstName + " " + instructor.LastName,
				grade.CreatedAt.Format("2006-01-02 15:04:05"),
				grade.UpdatedAt.Format("2006-01-02 15:04:05"),
			}
			for i, cell := range data {
				cellName, err := excelize.CoordinatesToCellName(i+1, idx+2)
				if err != nil {
					chErr <- err
					return
				}

				if err := f.SetCellValue(department.Name, cellName, cell); err != nil {
					chErr <- err
					return
				}
			}
		}(idx, grade)
	}

	go func() {
		wg.Wait()
		close(chErr)
	}()

	for err := range chErr {
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("Lỗi khi tạo file excel: %v", err))
	}

	if err := f.SaveAs("static/ByDepartmentList.xlsx"); err != nil {
		fmt.Println(err)
	}

	return c.Download("static/ByDepartmentList.xlsx")

}

func GradeExportExcelList(c *fiber.Ctx) error {
	var grades []entity.Grade
	if err := common.DBConn.Find(&grades).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	f := excelize.NewFile()
	defer func() {
		if err := f.Close(); err != nil {
			fmt.Println(err)
		}
	}()

	if err := f.SetSheetName("Sheet1", "Grades"); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("Lỗi khi tạo file excel: %v", err))
	}

	if err := f.SetColWidth("Grades", "A", "I", 20); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("Lỗi khi tạo file excel: %v", err))
	}

	var headers = []string{"Mã sinh viên", "Tên sinh viên", "Điểm quá trình", "Điểm giữa kỳ", "Điểm cuối kỳ", "Môn học", "Giảng viên dạy", "Ngày tạo", "Ngày cập nhật"}
	for idx, header := range headers {
		cell, err := excelize.CoordinatesToCellName(idx+1, 1)
		if err != nil {
			fmt.Println(err)
			return c.JSON(common.NewResponse(fiber.StatusInternalServerError, "Lỗi khi tạo file excel", nil))
		}
		if err := f.SetCellValue("Grades", cell, header); err != nil {
			return err
		}
	}

	var wg sync.WaitGroup
	chErr := make(chan error, len(grades))

	wg.Add(len(grades))
	for idx, grade := range grades {
		go func(idx int, grade entity.Grade) {
			defer wg.Done()
			var student entity.Student
			if err := common.DBConn.First(&student, "id = ?", grade.StudentID).Error; err != nil {
				chErr <- err
				return
			}

			var subject entity.Subject
			if err := common.DBConn.First(&subject, "id = ?", grade.SubjectID).Error; err != nil {
				chErr <- err
				return
			}

			var instructor entity.Instructor
			if err := common.DBConn.First(&instructor, "id = ?", grade.ByInstructorID).Error; err != nil {
				chErr <- err
				return
			}

			data := []string{
				student.ID,
				student.FirstName + " " + student.LastName,
				fmt.Sprintf("%.2f", grade.ProcessScore),
				fmt.Sprintf("%.2f", grade.MidtermScore),
				fmt.Sprintf("%.2f", grade.FinalScore),
				subject.Name,
				instructor.FirstName + " " + instructor.LastName,
				grade.CreatedAt.Format("2006-01-02 15:04:05"),
				grade.UpdatedAt.Format("2006-01-02 15:04:05"),
			}
			for i, cell := range data {
				cellName, err := excelize.CoordinatesToCellName(i+1, idx+2)
				if err != nil {
					chErr <- err
					return
				}

				if err := f.SetCellValue("Grades", cellName, cell); err != nil {
					chErr <- err
					return
				}
			}
		}(idx, grade)
	}

	go func() {
		wg.Wait()
		close(chErr)
	}()

	for err := range chErr {
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("Lỗi khi tạo file excel: %v", err))
	}

	if err := f.SaveAs("static/GradeList.xlsx"); err != nil {
		fmt.Println(err)
	}

	return c.Download("static/GradeList.xlsx")
}

// [POST] /api/grades
func GradeCreate(c *fiber.Ctx) error {
	bodyData, err := common.Validator[req.GradeCreate](c)

	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	var registration entity.StudentRegistration
	if err := common.DBConn.First(&registration, "subject_id = ? and student_id = ?", bodyData.SubjectID, bodyData.StudentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Sinh viên chưa đăng ký môn học này")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	var assignment entity.InstructorAssignment
	if err := common.DBConn.First(&assignment, "subject_id = ? and instructor_id = ?", bodyData.SubjectID, bodyData.ByInstructorID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Giảng viên không dạy môn học này")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	var grade entity.Grade
	if err := common.DBConn.First(&grade, "subject_id = ? and student_id = ?", bodyData.SubjectID, bodyData.StudentID).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Lỗi khi truy vấn cơ sở dữ liệu")
		}
	}

	if grade.ID != 0 {
		return fiber.NewError(fiber.StatusBadRequest, "Sinh viên đã có điểm môn học này")
	}

	newGrade := entity.Grade{
		ProcessScore:   bodyData.ProcessScore,
		MidtermScore:   bodyData.MidtermScore,
		FinalScore:     bodyData.FinalScore,
		SubjectID:      bodyData.SubjectID,
		StudentID:      bodyData.StudentID,
		ByInstructorID: bodyData.ByInstructorID,
	}

	if err := common.DBConn.Create(&newGrade).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi tạo điểm")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", newGrade))
}

// [PUT] /api/grades/:id
func GradeUpdateById(c *fiber.Ctx) error {
	gradeId := c.Params("id")
	bodyData, err := common.Validator[req.GradeUpdateById](c)

	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	var grade entity.Grade

	if err := common.DBConn.First(&grade, "id = ?", gradeId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy bảng điểm")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	grade.ProcessScore = bodyData.ProcessScore
	grade.MidtermScore = bodyData.MidtermScore
	grade.FinalScore = bodyData.FinalScore

	if err := common.DBConn.Save(&grade).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi cập nhật điểm")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", grade))
}

// [DELETE] /api/grades/:id
func GradeDeleteById(c *fiber.Ctx) error {
	gradeId := c.Params("id")

	var grade entity.Grade
	if err := common.DBConn.First(&grade, "id = ?", gradeId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy bảng điểm")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	if err := common.DBConn.Delete(&grade).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi xóa bảng điểm")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", grade))
}
