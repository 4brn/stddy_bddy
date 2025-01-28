# Routes

## Auth

(Routes that create/delete sessions, send cookies with session TOKEN)
- POST /api/auth/signup - credentials from /signup (username, password), Creates user , return status code
- POST /api/auth/login - credentials from /login (username, password), checks for user, checks for password, sets cookie
- DELETE /api/auth/logout - deletes cookie, return status code

## CRUD

### Users

- GET /api/users (protected) - Lists all users
- GET /api/users/:id - Lists user
- POST /api/users - Creates user
- PUT /api/user/:id - Updates user
- DELETE /api/user/:id - 

