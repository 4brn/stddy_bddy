# Routes Documentation
- Running on port 3000

## Authenthication

### POST /api/auth/signup
```json
{
  "username": "johndoe",
  "password": "12345"
}
// RETURNS 201 IF SUCCESSFUL
```

### POST /api/auth/login
```json
{
  "username": "johndoe",
  "password": "12345"
}
// SUCCESS 200 & SESSION COOKIE
// 307 - SESSION COOKIE FOUND
// 400 - INVALID USER CREDENTIALS
// 404 - USER NOT FOUND IN DB
```

### DELETE /api/auth/logout
```json
// CLEARS CLIENT & SERVER SESSION
// RETURNS 200
```

## User Management
- Used my admins for user management
- All endpoints requre admin priviliges

### GET /api/users?limit=10
```json
// RETUNS 200 & ALL USERS (UNLESS LIMITED)
```

### POST /api/users
```json
{
  "username": "created_by_admin",
  "password": "strong_password",
  "isAdmin": true
}
// RETURNS 200
```
### PATCH /api/users/:id
```json
// ID TAKEN FROM URL AS PARAMETER
// REQUEST BODY INCLUDES ONLY CHANGED DATA
{
  "username": "updated_by_admin",
  "password": "new_password",
  "isAdmin": false
}
// RETURNS 200
```

### DELETE /api/users/:id
```json
// DELETES USER
// DELETES USER'S SESSIONS
// RETURNS 200
```

### DELETE /api/users/logout/:id
```json
// DELETES USER'S SESSION (aka logs them out)
// RETURNS 200
```
