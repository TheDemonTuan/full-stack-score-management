package req

type GradeCreate struct {
	ProcessScore float64 `json:"process_score" validate:"number,gte=0,lte=10" `
	MidtermScore float64 `json:"midterm_score" validate:"number,gte=0,lte=10"`
	FinalScore   float64 `json:"final_score" validate:"number,gte=0,lte=10"`

	SubjectID      string `json:"subject_id" validate:"required"`
	StudentID      string `json:"student_id" validate:"required"`
	ByInstructorID string `json:"by_instructor_id" validate:"required"`
}

type GradeUpdateById struct {
	ProcessScore float64 `json:"process_score" validate:"number,gte=0,lte=10" `
	MidtermScore float64 `json:"midterm_score" validate:"number,gte=0,lte=10"`
	FinalScore   float64 `json:"final_score" validate:"number,gte=0,lte=10"`
}
