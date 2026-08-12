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

## 👶 Prerequisites (For Beginners)

Before using this tool, you need to have a few things installed on your computer:
1. **Node.js**: The runtime environment. [Download it here](https://nodejs.org/).
2. **A Database**: 
   - If you choose MongoDB: Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - If you choose PostgreSQL: Install [PostgreSQL](https://www.postgresql.org/download/) or use a cloud database like [Supabase](https://supabase.com/).
3. **An API Tester**: Download a tool like [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/) to test your new API endpoints.

---

## 🚀 Quick Start

You can run the generator directly without installing it globally using `npx`:

```bash
npx @shahid_310/express-auth-generator
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
The generator automatically creates a `.env` file for you, populated with secure, randomly generated secrets and sensible defaults. 

Here is a breakdown of all the environment variables you can configure:

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `PORT` | The port your Express server runs on. | `5000` |
| `MONGO_URI` / `DATABASE_URL` | Your database connection string. | Localhost default |
| `JWT_ACCESS_SECRET` | Secret used to sign short-lived access tokens. | *Auto-generated 64-char string* |
| `JWT_REFRESH_SECRET` | Secret used to sign long-lived refresh tokens. | *Auto-generated 64-char string* |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifespan. | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifespan. | `7d` |
| `COOKIE_SECURE` | Set to `true` in production to require HTTPS. | `false` |
| `COOKIE_SAME_SITE` | CSRF protection setting for cookies. | `lax` |
| `COOKIE_DOMAIN` | Domain for the HttpOnly cookie. | `localhost` |
| `CORS_ORIGIN` | The frontend URL allowed to communicate with this API. | `http://localhost:3000` |
| `AUTH_RATE_LIMIT_WINDOW_MS` | Timeframe for the rate limiter. | `900000` (15 mins) |
| `AUTH_RATE_LIMIT_MAX` | Max requests per IP per window. | `100` |
| `SMTP_HOST` | Your email provider's SMTP host (e.g., `smtp.mailtrap.io`). | *Empty* |
| `SMTP_PORT` | SMTP Port. | `587` |
| `SMTP_USER` | SMTP Username. | *Empty* |
| `SMTP_PASSWORD` | SMTP Password. | *Empty* |
| `SMTP_FROM` | Sender address for system emails. | `noreply@example.com` |

*Note: If you leave the SMTP variables empty during local development, the application will gracefully fallback to logging the email contents (including verification tokens) directly to your server console so you can still test the flow!*

### 5. Start the Development Server
```bash
npm run dev
```
You should see:
```
Server running on port 5000
```

### 6. Test Your New API (For Beginners)
Now that your server is running, you can test it!
1. Open **Postman** (or your API tester).
2. Create a new `POST` request to `http://localhost:5000/api/auth/register`.
3. Go to the **Body** tab, select **raw** and **JSON**.
4. Enter the following JSON:
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "strongpassword123"
   }
   ```
5. Click **Send**! You should get a `201 Created` response back. You now have a fully functioning authentication backend!

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

---

**Built with ❤️ by [Shahid Ansari](https://github.com/shahidansari311)**
