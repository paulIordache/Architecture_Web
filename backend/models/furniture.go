package models

type Furniture struct {
	ID        int    `json:"id"`
	Object    int    `json:"obj_file_path"`
	Texture   string `json:"texture_path"`
	Thumbnail string `json:"thumbnail_path"`
	Name      string `json:"name"`
}
