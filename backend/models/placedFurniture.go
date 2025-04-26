package models

type Furniture struct {
	ID            int    `json:"id"`
	Name          string `json:"name"`
	ObjFilePath   string `json:"obj_file_path"`
	TexturePath   string `json:"texture_path"`
	ThumbnailPath string `json:"thumbnail_path"`
}
