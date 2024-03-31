package router

import (
	"github.com/gofiber/fiber/v2"
	"qldiemsv/controllers"
)

func instructorsRouter(r fiber.Router) {
	instructorsRoute := r.Group("instructors")

	//[GET] /api/instructors
	instructorsRoute.Add("GET", "", controllers.InstructorGetAll)
	instructorsRoute.Add("GET", "department/:id", controllers.InstructorGetAllByDepartmentId)
	instructorsRoute.Add("GET", ":id", controllers.InstructorGetById)
	//[POST] /api/instructors
	instructorsRoute.Add("POST", "", controllers.InstructorCreate)
	//[PUT] /api/instructors
	instructorsRoute.Add("PUT", ":id", controllers.InstructorUpdateById)
	//[DELETE] /api/instructors
	instructorsRoute.Add("DELETE", "", controllers.InstructorDeleteAll)
	instructorsRoute.Add("DELETE", "list", controllers.InstructorDeleteByListId)
	instructorsRoute.Add("DELETE", ":id", controllers.InstructorDeleteById)

}
