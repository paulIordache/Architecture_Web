package handlers

import (
	"backend/db"
	"backend/models"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
	"log"
	"net/http"
	"runtime"
	"time"
)

var jwtSecret = []byte("your_secret_key")

const jwtCookieName = "jwt"

// callerInfo returns file and line information for debugging.
func callerInfo() string {
	// Skip 2 levels to report the caller of the logging function.
	_, file, line, ok := runtime.Caller(2)
	if !ok {
		return "unknown:0"
	}
	return fmt.Sprintf("%s:%d", file, line)
}

// LoginHandler handles user login and issues a JWT via a secure cookie.
func LoginHandler(c *gin.Context) {
	var loginData models.User
	if err := c.ShouldBindJSON(&loginData); err != nil {
		log.Printf("[handlers - %s] Error binding JSON data: %v", callerInfo(), err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var storedUser models.User
	err := db.DB.QueryRow("SELECT id, username, email, password FROM users WHERE email = $1", loginData.Email).
		Scan(&storedUser.ID, &storedUser.Username, &storedUser.Email, &storedUser.Password)
	if err != nil {
		log.Printf("[handlers - %s] Error retrieving user from DB: %v", callerInfo(), err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Compare hashed password with the provided password.
	err = bcrypt.CompareHashAndPassword([]byte(storedUser.Password), []byte(loginData.Password))
	if err != nil {
		log.Printf("[handlers - %s] Password verification failed: %v", callerInfo(), err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Create the JWT claims (issue time, expiration, username & user_id).
	expirationTime := time.Now().Add(24 * time.Hour) // Token valid for 24 hours
	claims := jwt.MapClaims{
		"username": storedUser.Username,
		"user_id":  storedUser.ID,
		"exp":      expirationTime.Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		log.Printf("[handlers - %s] Error signing token: %v", callerInfo(), err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	// Log that we're about to set the cookie.
	log.Printf("[handlers - %s] Setting JWT cookie for user '%s' (expires in 24h)", callerInfo(), storedUser.Username)
	// Set the cookie.
	// For local development (without HTTPS), we set secure to false.
	c.SetCookie(jwtCookieName, tokenString, 3600*24, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"message":  "Login successful",
		"username": storedUser.Username,
		"token":    tokenString,
	})
}
