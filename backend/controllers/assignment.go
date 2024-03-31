package controllers

import (
	"errors"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"net/url"
	"qldiemsv/common"
	"qldiemsv/models/entity"
	"qldiemsv/models/req"
)

// [GET] /api/assignments
func AssignmentGetAll(c *fiber.Ctx) error {
	var assignments []entity.InstructorAssignment

	if err := common.DBConn.Find(&assignments).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}
	return c.JSON(common.NewResponse(
		fiber.StatusOK,
		"Success",
		assignments))
}

// [GET] /api/assignments/department/:id
func AssignmentGetAllByDepartmentId(c *fiber.Ctx) error {
	departmentId := c.Params("id")

	var subjectsId []string

	if err := common.DBConn.Model(&entity.Subject{}).Select("id").Where("department_id = ?", departmentId).Find(&subjectsId).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	var assignments []entity.InstructorAssignment
	if err := common.DBConn.Where("subject_id IN ?", subjectsId).Find(&assignments).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(
		fiber.StatusOK,
		"Success",
		assignments))
}

// [GET] /api/assignments/department/:id
func AssignmentGetAllInstructorByFullName(c *fiber.Ctx) error {
	instructorNameRaw := c.Params("name")

	instructorName, err := url.QueryUnescape(instructorNameRaw)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Tên giảng viên không hợp lệ")
	}

	var instructorsId []string

	if err := common.DBConn.Model(&entity.Instructor{}).Select("id").Where("LOWER(CONCAT(first_name,' ',last_name)) LIKE LOWER(?)", "%"+instructorName+"%").Find(&instructorsId).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	var assignments []entity.InstructorAssignment
	if err := common.DBConn.Where("instructor_id IN ?", instructorsId).Find(&assignments).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(
		fiber.StatusOK,
		"Success",
		assignments))
}

// [POST] /api/assignments
func AssignmentCreate(c *fiber.Ctx) error {
	bodyData, err := common.Validator[req.AssignmentCreate](c)
	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	var subject entity.Subject
	if err := common.DBConn.First(&subject, "id = ?", bodyData.SubjectID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy môn học")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	var instructor entity.Instructor
	if err := common.DBConn.First(&instructor, "id = ?", bodyData.InstructorID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy giảng viên")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	if instructor.DepartmentID != subject.DepartmentID {
		return fiber.NewError(fiber.StatusBadRequest, "Giảng viên không thuộc khoa của môn học")
	}

	var assignment entity.InstructorAssignment
	if err := common.DBConn.First(&assignment, "subject_id = ? AND instructor_id = ?", subject.ID, instructor.ID).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Lỗi khi truy vấn cơ sở dữ liệu")
		}
	}

	if assignment.ID != 0 {
		return fiber.NewError(fiber.StatusBadRequest, "Giảng viên đã được phân công môn học này")
	}

	newAssignment := entity.InstructorAssignment{
		SubjectID:    bodyData.SubjectID,
		InstructorID: bodyData.InstructorID,
	}

	if err := common.DBConn.Create(&newAssignment).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi tạo phân công")
	}
	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", newAssignment))
}

//// [GET] /api/assignments/:id
//func AssignmentGetById(c *fiber.Ctx) error {
//	assignmentId := c.Params("id")
//	var assignment entity.InstructorAssignment
//	if err := common.DBConn.First(&assignment, "id = ?", assignmentId).Error; err != nil {
//		if errors.Is(err, gorm.ErrRecordNotFound) {
//			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy môn học")
//		}
//		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
//	}
//	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", assignment))
//}

// [PUT] /api/assignments/:id
func AssignmentUpdateById(c *fiber.Ctx) error {
	assignmentId := c.Params("id")
	bodyData, err := common.Validator[req.AssignmentUpdateById](c)
	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	var assignment entity.InstructorAssignment
	if err := common.DBConn.First(&assignment, "id = ?", assignmentId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy phân công")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	var subject entity.Subject
	if err := common.DBConn.First(&subject, "id = ?", bodyData.SubjectID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy môn học")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	var instructor entity.Instructor
	if err := common.DBConn.First(&instructor, "id = ?", bodyData.InstructorID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy giảng viên")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	if instructor.DepartmentID != subject.DepartmentID {
		return fiber.NewError(fiber.StatusBadRequest, "Giảng viên không thuộc khoa của môn học")
	}

	var existAssignment entity.InstructorAssignment
	if err := common.DBConn.First(&existAssignment, "subject_id = ? AND instructor_id = ?", subject.ID, instructor.ID).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Lỗi khi truy vấn cơ sở dữ liệu")
		}
	}

	if existAssignment.ID != 0 {
		return fiber.NewError(fiber.StatusBadRequest, "Giảng viên đã được phân công môn học này")
	}

	assignment.SubjectID = subject.ID
	assignment.InstructorID = instructor.ID

	if err := common.DBConn.Save(&assignment).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi cập nhật phân công")
	}
	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", assignment))
}

// [DELETE] /api/assignments/:id
func AssignmentDeleteById(c *fiber.Ctx) error {
	assignmentId := c.Params("id")

	var assignment entity.InstructorAssignment
	if err := common.DBConn.First(&assignment, "id = ?", assignmentId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy phân công")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	if err := common.DBConn.Delete(&assignment).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi xóa phân công")
	}
	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", nil))
}

//
//// [DELETE] /api/assignments
//func AssignmentDeleteAll(c *fiber.Ctx) error {
//	if err := common.DBConn.Where("1 = 1").Delete(&entity.Assignment{}).Error; err != nil {
//		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi xóa tất cả phân công")
//	}
//	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", nil))
//}
//
//// [DELETE] /api/assignments/list
//func AssignmentDeleteByListId(c *fiber.Ctx) error {
//	var subjectIDs []string
//	var instructorIDs []string
//	if err := c.BodyParser(&subjectIDs); err != nil {
//		return fiber.NewError(fiber.StatusBadRequest, "Danh sách ID không hợp lệ")
//	}
//	if err := c.BodyParser(&instructorIDs); err != nil {
//		return fiber.NewError(fiber.StatusBadRequest, "Danh sách ID không hợp lệ")
//	}
//	if err := common.DBConn.Where("subject_id IN ? AND instructor_id IN ?", subjectIDs, instructorIDs).Delete(&entity.Assignment{}).Error; err != nil {
//		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi xóa phân công")
//	}
//	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", nil))
//}
