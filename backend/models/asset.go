package models

type Asset struct {
	ID        int    `json:"id"`        // Asset ID
	Name      string `json:"name"`      // Asset Name
	Object    string `json:"object"`    // Path to the .obj file
	Thumbnail string `json:"thumbnail"` // Path to the thumbnail image
	Texture   string `json:"texture"`   // Path to the texture image
}
