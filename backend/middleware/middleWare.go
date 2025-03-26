package middleware

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"log"
	"net/http"
	"runtime"
)

var jwtSecret = []byte("your_secret_key")

const jwtCookieName = "jwt"

// callerInfo returns file and line information for debugging.
func callerInfo() string {
	_, file, line, ok := runtime.Caller(2)
	if !ok {
		return "unknown:0"
	}
	return fmt.Sprintf("%s:%d", file, line)
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Log all incoming cookies.
		for _, cookie := range c.Request.Cookies() {
			log.Printf("[middleware - %s] Incoming cookie: %s = %s", callerInfo(), cookie.Name, cookie.Value)
		}

		var tokenString string

		// First, try retrieving the JWT from the cookie.
		cookieToken, err := c.Cookie(jwtCookieName)
		if err == nil && cookieToken != "" {
			tokenString = cookieToken
			log.Printf("[middleware - %s] Found JWT cookie: %s", callerInfo(), tokenString)
		} else {
			// Fallback: attempt to retrieve token from the Authorization header.
			authHeader := c.GetHeader("Authorization")
			if authHeader != "" {
				// Expected format is "Bearer <token>".
				var bearer string
				fmt.Sscanf(authHeader, "Bearer %s", &bearer)
				tokenString = bearer
				log.Printf("[middleware - %s] Retrieved JWT from Authorization header: %s", callerInfo(), tokenString)
			} else {
				log.Printf("[middleware - %s] Error: JWT not provided in cookie or Authorization header", callerInfo())
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required: JWT token not provided"})
				c.Abort()
				return
			}
		}

		// Parse the token.
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Verify the signing method.
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return jwtSecret, nil
		})
		if err != nil {
			log.Printf("[middleware - %s] Error parsing token: %v", callerInfo(), err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token: " + err.Error()})
			c.Abort()
			return
		}
		if !token.Valid {
			log.Printf("[middleware - %s] Token is invalid", callerInfo())
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			log.Printf("[middleware - %s] Invalid token claims", callerInfo())
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}
		log.Printf("[middleware - %s] Token claims: %v", callerInfo(), claims)

		// Store username and user_id into the context.
		c.Set("username", claims["username"])
		c.Set("user_id", claims["user_id"])
		c.Next()
	}
}
