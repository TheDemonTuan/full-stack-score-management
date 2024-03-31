package router

import (
	"github.com/gofiber/fiber/v2"
	"qldiemsv/controllers"
)

func studentsRouter(r fiber.Router) {
	studentsRoute := r.Group("students")

	studentsRoute.Add("GET", "", controllers.StudentGetAll)
	studentsRoute.Add("GET", ":id", controllers.StudentGetById)
	studentsRoute.Add("POST", "", controllers.StudentCreate)
	studentsRoute.Add("PUT", ":id", controllers.StudentUpdateById)
	studentsRoute.Add("DELETE", "", controllers.StudentDeleteAll)
	studentsRoute.Add("DELETE", "list", controllers.StudentDeleteByListId)
	studentsRoute.Add("DELETE", ":id", controllers.StudentDeleteById)
	studentsRoute.Add("GET", "department/:departmentID", controllers.GetStudentsByDepartmentID)
}
