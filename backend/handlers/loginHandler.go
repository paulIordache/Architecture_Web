package handlers

import (
	"backend/db"
	"backend/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"log"
	"net/http"
)

// LoginHandler handles user login
func LoginHandler(c *gin.Context) {
	var loginData models.User
	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Query for the user in the database
	var storedUser models.User
	err := db.DB.QueryRow("SELECT id, username, email, password FROM users WHERE email = $1", loginData.Email).
		Scan(&storedUser.ID, &storedUser.Username, &storedUser.Email, &storedUser.Password)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Compare hashed password with the stored one
	err = bcrypt.CompareHashAndPassword([]byte(storedUser.Password), []byte(loginData.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Log to check if username is being retrieved
	log.Println("Logged in user:", storedUser.Username)

	// Return success with username included
	c.JSON(http.StatusOK, gin.H{
		"message":  "Login successful",
		"username": storedUser.Username, // Ensure this is returned correctly
	})
}
