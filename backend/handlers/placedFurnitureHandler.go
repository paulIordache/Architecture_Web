package handlers

import (
	"backend/db"
	"backend/models"
	"database/sql"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

func GetPlacedFurnitureByProject(c *gin.Context) {
	projectIDStr := c.Param("projectId")
	projectID, err := strconv.Atoi(projectIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	query := `
       SELECT 
          pf.id, pf.project_id, pf.furniture_id, pf.x, pf.y, pf.z,
          f.id, f.name, f.obj_file_path, f.texture_path, f.thumbnail_path
       FROM "PlacedFurniture" pf
       JOIN furniture f ON pf.furniture_id = f.id
       WHERE pf.project_id = $1
    `

	rows, err := db.DB.Query(query, projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch furniture"})
		return
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {

		}
	}(rows)

	var placedFurnitureList []models.PlacedFurniture
	for rows.Next() {
		var pf models.PlacedFurniture
		err := rows.Scan(
			&pf.ID, &pf.ProjectID, &pf.FurnitureID,
			&pf.X, &pf.Y, &pf.Z,
			&pf.Furniture.ID, &pf.Furniture.Name,
			&pf.Furniture.ObjFilePath, &pf.Furniture.TexturePath,
			&pf.Furniture.ThumbnailPath,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan furniture"})
			return
		}
		placedFurnitureList = append(placedFurnitureList, pf)
	}

	c.JSON(http.StatusOK, placedFurnitureList)
}

// UpdateFurniturePosition updates the position of a placed furniture item
func UpdateFurniturePosition(c *gin.Context) {
	// Get the furniture ID from the path parameter
	furnitureIDStr := c.Param("id")
	furnitureID, err := strconv.Atoi(furnitureIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid furniture ID"})
		return
	}

	// Parse the request body
	var updateData struct {
		X float64 `json:"x"`
		Y float64 `json:"y"`
		Z float64 `json:"z"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// Update the furniture position in the database
	updateQuery := `
        UPDATE "PlacedFurniture"
        SET x = $1, y = $2, z = $3
        WHERE id = $4
    `

	_, err = db.DB.Exec(updateQuery, updateData.X, updateData.Y, updateData.Z, furnitureID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update furniture position"})
		return
	}

	// Fetch the updated furniture to return to the client
	query := `
        SELECT 
            pf.id, pf.project_id, pf.furniture_id, pf.x, pf.y, pf.z,
            f.id, f.name, f.obj_file_path, f.texture_path, f.thumbnail_path
        FROM "PlacedFurniture" pf
        JOIN furniture f ON pf.furniture_id = f.id
        WHERE pf.id = $1
    `

	row := db.DB.QueryRow(query, furnitureID)

	var updatedFurniture models.PlacedFurniture
	err = row.Scan(
		&updatedFurniture.ID, &updatedFurniture.ProjectID, &updatedFurniture.FurnitureID,
		&updatedFurniture.X, &updatedFurniture.Y, &updatedFurniture.Z,
		&updatedFurniture.Furniture.ID, &updatedFurniture.Furniture.Name,
		&updatedFurniture.Furniture.ObjFilePath, &updatedFurniture.Furniture.TexturePath,
		&updatedFurniture.Furniture.ThumbnailPath,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve updated furniture"})
		return
	}

	c.JSON(http.StatusOK, updatedFurniture)
}

// DeletePlacedFurniture deletes a placed furniture item from a project
func DeletePlacedFurniture(c *gin.Context) {
	// Get the furniture ID from the path parameter
	furnitureIDStr := c.Param("id")
	furnitureID, err := strconv.Atoi(furnitureIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid furniture ID"})
		return
	}

	// Store furniture details before deletion to return to client
	query := `
        SELECT 
            pf.id, pf.project_id, pf.furniture_id, pf.x, pf.y, pf.z,
            f.id, f.name, f.obj_file_path, f.texture_path, f.thumbnail_path
        FROM "PlacedFurniture" pf
        JOIN furniture f ON pf.furniture_id = f.id
        WHERE pf.id = $1
    `

	row := db.DB.QueryRow(query, furnitureID)

	var deletedFurniture models.PlacedFurniture
	err = row.Scan(
		&deletedFurniture.ID, &deletedFurniture.ProjectID, &deletedFurniture.FurnitureID,
		&deletedFurniture.X, &deletedFurniture.Y, &deletedFurniture.Z,
		&deletedFurniture.Furniture.ID, &deletedFurniture.Furniture.Name,
		&deletedFurniture.Furniture.ObjFilePath, &deletedFurniture.Furniture.TexturePath,
		&deletedFurniture.Furniture.ThumbnailPath,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Furniture not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving furniture details"})
		}
		return
	}

	// Delete the furniture
	deleteQuery := `DELETE FROM "PlacedFurniture" WHERE id = $1`
	result, err := db.DB.Exec(deleteQuery, furnitureID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete furniture"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get deletion result"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Furniture not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":          "Furniture deleted successfully",
		"deletedFurniture": deletedFurniture,
	})
}

// AddPlacedFurniture adds new furniture to a project
func AddPlacedFurniture(c *gin.Context) {
	var newFurniture models.PlacedFurniture

	if err := json.NewDecoder(c.Request.Body).Decode(&newFurniture); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// Insert new furniture into database
	insertQuery := `
        INSERT INTO "PlacedFurniture" (project_id, furniture_id, x, y, z)
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id
    `

	var insertedID int
	err := db.DB.QueryRow(
		insertQuery,
		newFurniture.ProjectID,
		newFurniture.FurnitureID,
		newFurniture.X,
		newFurniture.Y,
		newFurniture.Z,
	).Scan(&insertedID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add furniture"})
		return
	}

	// Fetch the complete furniture details to return
	query := `
        SELECT 
            pf.id, pf.project_id, pf.furniture_id, pf.x, pf.y, pf.z,
            f.id, f.name, f.obj_file_path, f.texture_path, f.thumbnail_path
        FROM "PlacedFurniture" pf
        JOIN furniture f ON pf.furniture_id = f.id
        WHERE pf.id = $1
    `

	row := db.DB.QueryRow(query, insertedID)

	var insertedFurniture models.PlacedFurniture
	err = row.Scan(
		&insertedFurniture.ID, &insertedFurniture.ProjectID, &insertedFurniture.FurnitureID,
		&insertedFurniture.X, &insertedFurniture.Y, &insertedFurniture.Z,
		&insertedFurniture.Furniture.ID, &insertedFurniture.Furniture.Name,
		&insertedFurniture.Furniture.ObjFilePath, &insertedFurniture.Furniture.TexturePath,
		&insertedFurniture.Furniture.ThumbnailPath,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve inserted furniture details"})
		return
	}

	c.JSON(http.StatusCreated, insertedFurniture)
}
