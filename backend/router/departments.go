package router

import (
	"github.com/gofiber/fiber/v2"
	"qldiemsv/controllers"
)

func departmentsRouter(r fiber.Router) {
	departmentsRoute := r.Group("departments")

	// [GET] /api/departments
	departmentsRoute.Add("GET", "", controllers.DepartmentGetAll)
	departmentsRoute.Add("GET", ":id", controllers.DepartmentGetById)
	// [POST] /api/departments
	departmentsRoute.Add("POST", "", controllers.DepartmentCreate)
	// [PUT] /api/departments
	departmentsRoute.Add("PUT", ":id", controllers.DepartmentUpdateById)
	// [DELETE] /api/departments
	departmentsRoute.Add("DELETE", "", controllers.DepartmentDeleteAll)
	departmentsRoute.Add("DELETE", "list", controllers.DepartmentDeleteByListId)
	departmentsRoute.Add("DELETE", ":id", controllers.DepartmentDeleteById)
}
