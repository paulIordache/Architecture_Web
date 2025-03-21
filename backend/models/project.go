package models

type Project struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Object    string `json:"object"`
	Thumbnail string `json:"thumbnail"`
}
