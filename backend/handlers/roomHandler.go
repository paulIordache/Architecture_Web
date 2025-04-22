package handlers

import (
	"backend/db"
	"backend/models"
	"database/sql"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

func GetRoomByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing asset ID"})
		return
	}

	var asset models.Room
	err := db.DB.QueryRow("SELECT id, name, obj_file_path, texture_path, thumbnail_path FROM room WHERE id = $1", id).
		Scan(&asset.ID, &asset.Name, &asset.Object, &asset.Thumbnail, &asset.Texture)
	if err != nil {
		log.Printf("Database query error: %v", err)
		if err == sql.ErrNoRows {
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

func GetAllRooms(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, name, obj_file_path, texture_path, thumbnail_path FROM room")
	if err != nil {
		log.Printf("Database query err error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error" + err.Error()})
		return
	}
	defer rows.Close()

	var rooms []models.Room
	for rows.Next() {
		var room models.Room
		err := rows.Scan(&room.ID, &room.Name, &room.Object, &room.Texture, &room.Thumbnail)
		if err != nil {
			log.Printf("Row scan error: %v", err)
			continue
		}

		room.Object = transformAssetPath(room.Object)
		room.Texture = transformAssetPath(room.Texture)
		room.Thumbnail = transformAssetPath(room.Thumbnail)
		rooms = append(rooms, room)
	}

	if err = rows.Err(); err != nil {
		log.Printf("Rows iteration error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing data"})
		return
	}

	c.JSON(http.StatusOK, rooms)
}
