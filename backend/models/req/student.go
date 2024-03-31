package req

import "time"

type StudentCreate struct {
	FirstName    string    `json:"first_name" validate:"required,min=3,max=50"`
	LastName     string    `json:"last_name" validate:"required,min=3,max=50"`
	Email        string    `json:"email" validate:"required,email,max=100"`
	Address      string    `json:"address" validate:"required,max=100"`
	BirthDay     time.Time `json:"birth_day" validate:"required"`
	Phone        string    `json:"phone" validate:"required,max=20"`
	Gender       bool      `json:"gender" validate:"boolean"`
	AcademicYear int       `json:"academic_year" gorm:"not null,gte=1,lte=99"`
	ClassID      string    `json:"class_id" validate:"required"`
	DepartmentID uint      `json:"department_id" validate:"required"`
}

type StudentUpdateById struct {
	FirstName string    `json:"first_name" validate:"required,min=3,max=50"`
	LastName  string    `json:"last_name" validate:"required,min=3,max=50"`
	Email     string    `json:"email" validate:"required,email,max=100"`
	Address   string    `json:"address" validate:"required,max=100"`
	BirthDay  time.Time `json:"birth_day" validate:"required"`
	Phone     string    `json:"phone" validate:"required,max=20"`
	Gender    bool      `json:"gender" validate:"boolean"`
	ClassID   string    `json:"class_id" validate:"required"`
}

type StudentDeleteByListId struct {
	ListId []int `json:"list_id" validate:"required,min=1"`
}
