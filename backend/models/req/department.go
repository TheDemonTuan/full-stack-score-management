package req

type DepartmentCreate struct {
	ID     uint   `json:"id" validate:"required,gte=1,lte=99"`
	Symbol string `json:"symbol" validate:"required,min=2,max=10"`
	Name   string `json:"name" validate:"required,min=3,max=100"`
}

type DepartmentUpdateById struct {
	Name string `json:"name" validate:"required,min=3,max=100"`
}

type DepartmentDeleteByListId struct {
	ListId []int `json:"list_id" validate:"required,min=1"`
}
