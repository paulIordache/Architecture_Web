package handlers

import (
	"backend/db"
	"backend/models"
	"database/sql"
	"errors"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"strings"
)

func transformAssetPath(dbPath string) string {
	// Convert backslashes to forward slashes
	cleanPath := strings.ReplaceAll(dbPath, "\\", "/")
	// Remove the redundant prefix "assets/objects/" if it exists
	return strings.TrimPrefix(cleanPath, "assets/objects/")
}

func GetAssetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing asset ID"})
		return
	}

	var asset models.A
	err := db.DB.QueryRow("SELECT id, name, obj_file_path, thumbnail_path, texture_path FROM room WHERE id = $1", id).
		Scan(&asset.ID, &asset.Name, &asset.Object, &asset.Thumbnail, &asset.Texture)
	if err != nil {
		log.Printf("Database query error: %v", err)
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Asset not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + err.Error()})
		}
		return
	}

	// Transform the path from the database
	asset.Object = transformAssetPath(asset.Object)
	asset.Thumbnail = transformAssetPath(asset.Thumbnail)
	asset.Texture = transformAssetPath(asset.Texture)

	// Construct the full URL for the OBJ file
	fullObjURL := "http://localhost:8080/assets/" + asset.Object
	log.Printf("Serving OBJ file at: %s", fullObjURL)

	// Return the asset as JSON (you can include the URL or the transformed path)
	c.JSON(http.StatusOK, asset)
}
