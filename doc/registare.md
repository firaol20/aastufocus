# Frontend Registration Flow

This document outlines the step-by-step process for handling user registration in the frontend application, integrated with the Prisma/PostgreSQL backend.

## 1. Registration Form
The user fills out the registration form with the following fields:
- `name`: Full Name
- `email`: Valid institutional or personal email
- `password`: Strong password (min 8 characters)
- `department`: (Optional) Field of study
- `yearOfStudy`: (Optional) 1-5
- `phone`: (Optional) Contact number

## 2. API Request
When the form is submitted, the frontend sends a `POST` request to the backend:

- **Endpoint**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
```json
{
  "name": "Abel Bekele",
  "email": "abel@aastufocus.com",
  "password": "StrongPassword123!",
  "department": "Software Engineering",
  "yearOfStudy": 3,
  "phone": "+251912345678"
}
```

## 3. Handling the Response
The backend returns a `201 Created` response containing the user data and the initial tokens.

### Success Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-v4-string",
      "name": "Abel Bekele",
      "email": "abel@aastufocus.com",
      "role": "member",
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1Ni...",
    "refreshToken": "867f00d398e04037..."
  }
}
```

## 4. State & Token Management
1. **Store Access Token**: Save the `accessToken` in memory (e.g., Redux state or a React Context) for use in subsequent authenticated requests.
2. **Store Refresh Token**: 
   - The `refreshToken` is automatically set as a secure `HttpOnly` cookie by the backend.
   - You can also store the `refreshToken` in `localStorage` if your frontend architecture requires it for persistence across sessions.
3. **Set User State**: Store the `user` object in your global state manager (Redux/Context) to display user info in the UI.

## 5. Redirection
Once the state is successfully updated, redirect the user to the **Onboarding** page or the **Dashboard**:

```javascript
router.push('/dashboard');
```

## 6. Authenticated Requests
For all future requests to protected routes, include the `accessToken` in the `Authorization` header:

```javascript
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```
