# Express Auth CLI

An interactive CLI tool that instantly scaffolds a production-ready, highly secure Express authentication backend.

Forget writing the same boilerplate over and over again. Run a single command to generate a complete authentication system with your choice of **MongoDB (Mongoose)** or **PostgreSQL (Prisma)**.

## ✨ Features

- **Interactive CLI:** Choose your project name and database via a polished prompt.
- **True Database Agnosticism:** Seamlessly select between MongoDB or PostgreSQL. The internal architecture uses the Repository Pattern to keep business logic completely decoupled from the database layer.
- **Enterprise-Grade Security:**
  - **Dual-Token Flow:** Short-lived access tokens via JSON payloads, and long-lived refresh tokens stored securely in `HttpOnly`, `SameSite=Lax` cookies.
  - **Token Rotation & Revocation:** Refresh tokens are rotated on use and stored as SHA-256 hashes in the database.
  - **Hardened API:** Built-in protection against brute-force attacks via `express-rate-limit`, secure HTTP headers via `helmet`, and strict CORS configuration.
- **Complete Auth Lifecycle:**
  - Registration (with automatic email verification dispatch)
  - Login
  - Identity Check (`/me`)
  - Token Refresh
  - Secure Logout
  - Password Reset & Email Verification (Designed to prevent email enumeration)
- **Validation:** Strict runtime input validation using `Zod`.
- **Ready to Deploy:** Includes built-in environment variable validation on startup to prevent crashing in production due to missing secrets.

---

## 🚀 Quick Start

You can run the generator directly without installing it globally using `npx`:

```bash
npx express-auth
```

You will be prompted to enter a project name and select your preferred database:

```
⚡ Welcome to Express Auth CLI ⚡

? What is the name of your project? my-auth-backend
? Which database would you like to use?
❯ MongoDB (Mongoose)
  PostgreSQL (Prisma)
```

---

## 🛠️ Setting up the Generated Project

Once the CLI finishes generating your project, follow these steps to get your server running:

### 1. Navigate to the directory
```bash
cd my-auth-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure the Database
Open the newly generated `.env` file and ensure your database connection string is correct.
- **MongoDB:** Defaults to `mongodb://localhost:27017/<project-name>`
- **PostgreSQL:** Defaults to `postgresql://postgres:postgres@localhost:5432/<project-name>?schema=public`

*(If you chose PostgreSQL, you must push the schema to your database and generate the Prisma client before starting the server)*:
```bash
# PostgreSQL only:
npx prisma db push
npx prisma generate
```

### 4. Configure Environment Variables
The generator automatically creates a `.env` file for you, populated with secure, randomly generated JWT secrets. However, you will need to configure your email server if you want to send live emails:

Open the `.env` file in your code editor and look for the SMTP section:
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=noreply@yourdomain.com
```
*Note: If you leave the SMTP variables empty during local development, the application will gracefully fallback to logging the email contents (including verification tokens) directly to your server console so you can still test the flow!*

### 5. Start the Development Server
```bash
npm run dev
```
You should see:
```
Server running on port 5000
```

---

## 📚 API Endpoints

By default, the server runs on port `5000` and prefixes auth routes with `/api/auth`.

| Method | Endpoint | Description | Requires Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Authenticate user and receive tokens | No |
| `POST` | `/api/auth/refresh` | Rotate the `HttpOnly` refresh cookie | No |
| `POST` | `/api/auth/logout` | Clear cookie and revoke DB session | No |
| `GET`  | `/api/auth/me` | Get the currently authenticated user's profile | **Yes** |
| `POST` | `/api/auth/verify-email` | Verify email via token | No |
| `POST` | `/api/auth/resend-verification` | Resend verification email | No |
| `POST` | `/api/auth/forgot-password` | Dispatch a password reset token | No |
| `POST` | `/api/auth/reset-password` | Reset password using a token | No |

---

## 🏗️ Architecture

The generated project is strictly structured for maintainability and scale:

```text
├── src/
│   ├── config/          # Database and cookie configurations
│   ├── controllers/     # HTTP route handlers (req, res)
│   ├── middleware/      # Auth, validation, error, and rate-limiting middleware
│   ├── models/          # DB schemas (Mongoose models / Prisma schema)
│   ├── repositories/    # Database abstraction layer
│   ├── routes/          # Express router definitions
│   ├── services/        # Core business logic (auth, email handling)
│   ├── utils/           # Password hashing, JWT token generation
│   ├── validators/      # Zod validation schemas
│   └── app.js           # Express application setup
├── .env                 # Environment variables (auto-generated with secure secrets)
└── server.js            # Entry point
```

## 📝 License
MIT
