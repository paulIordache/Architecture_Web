package models

type Room struct {
	ID         int    `json:"id"`
	Name       string `json:"name"`
	Dimensions string `json:"dimensions"`
}
