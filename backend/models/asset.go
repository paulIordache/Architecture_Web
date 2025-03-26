package models

type Asset struct {
	ID      int    `json:"id"`
	Project int    `json:"project_id"`
	Name    string `json:"name"`
}
