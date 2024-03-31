package router

import (
	"github.com/gofiber/fiber/v2"
	"qldiemsv/controllers"
)

func subjectsRouter(r fiber.Router) {
	subjectsRoute := r.Group("subjects")

	subjectsRoute.Add("GET", "", controllers.SubjectGetAll)
	subjectsRoute.Add("GET", ":id", controllers.SubjectGetById)
	subjectsRoute.Add("POST", "", controllers.SubjectCreate)
	subjectsRoute.Add("PUT", ":id", controllers.SubjectUpdateById)
	subjectsRoute.Add("DELETE", "", controllers.SubjectDeleteAll)
	subjectsRoute.Add("DELETE", "list", controllers.SubjectDeleteByListId)
	subjectsRoute.Add("DELETE", ":id", controllers.SubjectDeleteById)
	subjectsRoute.Add("GET", "/department/:departmentID", controllers.GetSubjectsByDepartmentID)
}
