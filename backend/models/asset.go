package models

type Asset struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Object    string `json:"object"`
	Thumbnail string `json:"thumbnail"`
}
