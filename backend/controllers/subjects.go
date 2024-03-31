package controllers

import (
	"errors"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"qldiemsv/common"
	"qldiemsv/models/entity"
	"qldiemsv/models/req"
	"strconv"
)

func generateSubjectID(departmentID uint) string {
	const maxLength = 10
	const idPrefix = "MH"
	departmentCode := strconv.Itoa(int(departmentID))

	return idPrefix + departmentCode + common.GenerateRandNum(maxLength-len(idPrefix)-len(departmentCode))
}

// [GET] /api/subjects
func SubjectGetAll(c *fiber.Ctx) error {

	var subjects []entity.Subject

	if err := common.DBConn.Preload("Grades").Preload("StudentRegistrations").Preload("InstructorAssignments").Find(&subjects).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(
		fiber.StatusOK,
		"Success",
		subjects))
}

// [POST] /api/subjects
func SubjectCreate(c *fiber.Ctx) error {
	bodyData, err := common.Validator[req.SubjectCreate](c)

	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if totalPercentage := bodyData.ProcessPercentage + bodyData.MidtermPercentage + bodyData.FinalPercentage; totalPercentage != 100 {
		return fiber.NewError(fiber.StatusBadRequest, "Tổng % phải bằng 100")
	}
	newSubject := entity.Subject{
		ID:                generateSubjectID(bodyData.DepartmentID),
		Name:              bodyData.Name,
		Credits:           bodyData.Credits,
		ProcessPercentage: bodyData.ProcessPercentage,
		MidtermPercentage: bodyData.MidtermPercentage,
		FinalPercentage:   bodyData.FinalPercentage,
		DepartmentID:      bodyData.DepartmentID,
	}

	if err := common.DBConn.Create(&newSubject).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi tạo môn học")
	}
	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", newSubject))
}

// [GET] /api/subjects/:id
func SubjectGetById(c *fiber.Ctx) error {
	id := c.Params("id")
	var subject entity.Subject

	if err := common.DBConn.Preload("Grades").Preload("StudentRegistrations").Preload("InstructorAssignments").First(&subject, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy môn học")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}
	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", subject))
}

// [PUT] /api/subjects/:id
func SubjectUpdateById(c *fiber.Ctx) error {
	bodyData, err := common.Validator[req.SubjectUpdateById](c)

	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	var subject entity.Subject

	subjectId := c.Params("id")
	if err := common.DBConn.First(&subject, "id = ?", subjectId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy môn học")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	if totalPercentage := bodyData.ProcessPercentage + bodyData.MidtermPercentage + bodyData.FinalPercentage; totalPercentage != 100 {
		return fiber.NewError(fiber.StatusBadRequest, "Tổng % phải bằng 100")
	}

	subject.Name = bodyData.Name
	subject.Credits = bodyData.Credits
	subject.ProcessPercentage = bodyData.ProcessPercentage
	subject.MidtermPercentage = bodyData.MidtermPercentage
	subject.FinalPercentage = bodyData.FinalPercentage

	if err := common.DBConn.Save(&subject).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi cập nhật môn học")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", subject))
}

// [DELETE] /api/subjects/:id
func SubjectDeleteById(c *fiber.Ctx) error {
	id := c.Params("id")
	var subject entity.Subject

	if err := common.DBConn.First(&subject, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy môn học")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	if err := common.DBConn.Delete(&subject).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi xóa môn học")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", nil))
}

// [DELETE] /api/subjects/list
func SubjectDeleteByListId(c *fiber.Ctx) error {
	bodyData, err := common.Validator[req.SubjectDeleteByListId](c)

	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := common.DBConn.Where("id IN ?", bodyData.ListId).Delete(&entity.Subject{}).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy môn học")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi xóa nhiều môn học")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", nil))
}

// [DELETE] /api/subjects
func SubjectDeleteAll(c *fiber.Ctx) error {
	if err := common.DBConn.Where("1 = 1").Delete(&entity.Subject{}).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi xóa tất cả môn học")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", nil))
}

// [GET] /api/subjects/department/:departmentID
func GetSubjectsByDepartmentID(c *fiber.Ctx) error {
	departmentID := c.Params("departmentID")
	var subjects []entity.Subject

	if err := common.DBConn.Preload("Grades").Preload("Assignments").Find(&subjects, "department_id = ?", departmentID).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", subjects))
}
