package req

type AssignmentCreate struct {
	SubjectID    string `json:"subject_id" validate:"required"`
	InstructorID string `json:"instructor_id" validate:"required"`
}

type AssignmentUpdateById struct {
	SubjectID    string `json:"subject_id" validate:"required"`
	InstructorID string `json:"instructor_id" validate:"required"`
}
