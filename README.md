## Tasks API

### Description

+ Created the backend for a to-do app using Node.js and MySQL, performing CRUD operations to efficiently manage tasks via RESTful APIs.
+ Implemented JWT-based authentication to securely manage user sessions.

### Routes

#### Auth routes

```
POST /login             - Login and receive JWT token  
POST /register          - Submit registration details and receive OTP via email  
POST /verify            - Verify OTP and complete registration  
POST /forgot-password   - Submit password reset request and receive OTP via email  
POST /reset-password    - Set new password using the received OTP  
POST /change-password   - Change password by providing the new one  
POST /logout            - Clear session and logout
```

#### Tasks routes

```
POST /tasks        - Create a new task  
GET /tasks         - Retrieve all tasks  
PUT /tasks/:id     - Update a specific task by ID  
DELETE /tasks/:id  - Delete a specific task by ID  
```

### Installation

```sh
  git clone https://github.com/Kr1shnam00rthi/Tasks-API
  cd Tasks-API
  npm install package.json
  node app.js
```
+ Add a .env file in the Tasks-API directory to store environment variables.
