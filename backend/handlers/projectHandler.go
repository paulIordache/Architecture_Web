package handlers

import (
	"backend/db"
	"backend/models"
	"database/sql"
	"github.com/gin-gonic/gin"
	"net/http"
)

func GetProjectsByUser(c *gin.Context) {
	// get username from middleware
	username, exists := c.Get("username")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// query to fetch projects of the user
	rows, err := db.DB.Query(`
		SELECT p.id, p.user_id, p.name, p.description, p.room_layout_id
		FROM projects p
		JOIN users u ON p.user_id = u.id
		WHERE u.username = $1
	`, username)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var projects []models.Project
	for rows.Next() {
		var project models.Project
		if err := rows.Scan(&project.ID, &project.User, &project.Name, &project.Description, &project.Room); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		projects = append(projects, project)
	}

	// Return the list of projects
	c.JSON(http.StatusOK, projects)
}

// CreateProject handles the creation of a new project
func CreateProject(c *gin.Context) {
	var newProject models.Project

	// Bind the JSON data to the newProject object
	if err := c.ShouldBindJSON(&newProject); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// Get the user_id from the context (set by middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Set the user_id of the project
	newProject.User = int(userID.(float64))

	// Validate required fields
	if newProject.Name == "" || newProject.Room == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Project name and room layout are required"})
		return
	}

	// Insert into the database and capture the generated project ID
	err := db.DB.QueryRow(`
		INSERT INTO projects (user_id, name, description, room_layout_id)
		VALUES ($1, $2, $3, $4) RETURNING id`,
		newProject.User, newProject.Name, newProject.Description, newProject.Room,
	).Scan(&newProject.ID) // Capture the generated ID

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project"})
		return
	}

	// Respond with the created project including the ID
	c.JSON(http.StatusCreated, newProject)
}

// GetProjectByID handles the retrieval of a specific project by its ID
func GetProjectByID(c *gin.Context) {
	// Extract the project ID from the URL parameter
	projectID := c.Param("id")
	if projectID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Project ID is required"})
		return
	}

	// Query to fetch the project by its ID
	row := db.DB.QueryRow(`
		SELECT p.id, p.user_id, p.name, p.description, p.room_layout_id
		FROM projects p
		WHERE p.id = $1
	`, projectID)

	var project models.Project
	err := row.Scan(&project.ID, &project.User, &project.Name, &project.Description, &project.Room)
	if err != nil {
		// If no project is found or other errors
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// Return the project details
	c.JSON(http.StatusOK, project)
}
