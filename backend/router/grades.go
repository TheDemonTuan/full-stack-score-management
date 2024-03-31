package router

import (
	"github.com/gofiber/fiber/v2"
	"qldiemsv/controllers"
)

func gradesRouter(r fiber.Router) {
	gradesRoute := r.Group("grades")

	gradesRoute.Add("GET", "", controllers.GradeGetList)
	gradesRoute.Add("GET", "department/:id", controllers.GradeGetAllByDepartmentId)
	gradesRoute.Add("GET", "export", controllers.GradeExportExcelList)
	gradesRoute.Add("GET", "export/department/:id", controllers.GradeExportExcelByDepartmentId)
	gradesRoute.Add("GET", ":id", controllers.GradeGetById)
	gradesRoute.Add("POST", "", controllers.GradeCreate)
	gradesRoute.Add("PUT", ":id", controllers.GradeUpdateById)
	gradesRoute.Add("DELETE", ":id", controllers.GradeDeleteById)
}
