package req

type ClassCreate struct {
	NumberClass  int  `json:"number_class" validate:"required,number,gte=1,lte=99"`
	AcademicYear int  `json:"academic_year" validate:"required"`
	MaxStudents  int  `json:"max_students" validate:"required,number,gte=15,lte=60"`
	DepartmentID uint `json:"department_id" validate:"required"`
}

type ClassUpdateById struct {
	MaxStudents      int    `json:"max_students" validate:"required,number,gte=15,lte=60"`
	HostInstructorID string `json:"host_instructor_id" validate:"required"`
}

type ClassDeleteByListId struct {
	ListId []int `json:"list_id" validate:"required,min=1"`
}
