package req

import "time"

type InstructorCreate struct {
	FirstName    string    `json:"first_name" validate:"required,min=3,max=50"`
	LastName     string    `json:"last_name" validate:"required,min=3,max=50"`
	Email        string    `json:"email" validate:"required,email,max=100"`
	Address      string    `json:"address" validate:"required,min=5,max=100"`
	Degree       string    `json:"degree" validate:"required,min=5,max=50"`
	BirthDay     time.Time `json:"birth_day" validate:"required"`
	Phone        string    `json:"phone" validate:"required,min=10,max=11"`
	Gender       bool      `json:"gender" validate:"boolean"`
	DepartmentID uint      `json:"department_id" validate:"required"`
}

type InstructorUpdateById struct {
	FirstName string    `json:"first_name" validate:"required,min=3,max=50"`
	LastName  string    `json:"last_name" validate:"required,min=3,max=50"`
	Email     string    `json:"email" validate:"required,email,max=100"`
	Address   string    `json:"address" validate:"required,min=5,max=100"`
	Degree    string    `json:"degree" validate:"required,min=5,max=50"`
	BirthDay  time.Time `json:"birth_day" validate:"required"`
	Phone     string    `json:"phone" validate:"required,min=10,max=11"`
	Gender    bool      `json:"gender" validate:"boolean"`
}

type InstructorDeleteByListId struct {
	ListId []int `json:"list_id" validate:"required,min=1"`
}
