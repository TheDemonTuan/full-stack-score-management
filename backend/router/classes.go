package router

import (
	"github.com/gofiber/fiber/v2"
	"qldiemsv/controllers"
)

func classesRouter(r fiber.Router) {
	classesRoute := r.Group("classes")

	classesRoute.Add("GET", "", controllers.ClassGetAll)
	classesRoute.Add("GET", ":id", controllers.ClassGetById)
	classesRoute.Add("POST", "", controllers.ClassCreate)
	classesRoute.Add("PUT", ":id", controllers.ClassUpdateById)
	classesRoute.Add("DELETE", "", controllers.ClassDeleteAll)
	classesRoute.Add("DELETE", "list", controllers.ClassDeleteByListId)
	classesRoute.Add("DELETE", ":id", controllers.ClassDeleteById)
	classesRoute.Add("GET", "/department/:departmentID", controllers.GetClassesByDepartmentID)
}
