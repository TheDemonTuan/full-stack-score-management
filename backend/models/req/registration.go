package req

type RegistrationCreate struct {
	SubjectID string `json:"subject_id" validate:"required"`
	StudentID string `json:"student_id" validate:"required"`
}

type RegistrationUpdateById struct {
	SubjectID string `json:"subject_id" validate:"required"`
	StudentID string `json:"student_id" validate:"required"`
}
