# Message API Backend

This is the backend for the **Message Application**, a secure messaging platform that supports rich-text content, threaded replies, reactions, image uploads via Quill, and user authentication with JWT.

## 📦 Features

- 🔐 User authentication (JWT + Passport)
- 📨 Message creation with recipient validation
- 🖼️ Rich-text editor with image upload (Quill integration)
- 🧵 Threaded replies with sender tracking
- ❤️ Reactions for both messages and comments
- 📎 File attachment support
- 👤 User search and profile avatar upload
- 🧼 HTML sanitization with DOMPurify (on frontend)

---

## 🛠️ Tech Stack

- **Node.js** + **Express.js**
- **PostgreSQL** + **Prisma ORM**
- **Multer** (file upload handling)
- **Passport.js** (authentication middleware)
- **CORS**, **dotenv**, **path**, **fs**

---

## 🔧 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/wpierce19/message-api.git
cd message-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environmental Variables
Create a `.env`

```bash
DATABASE_URL=your_postgree_url
JWT_SECRET=your_secret
```

### 4. Migrate Database

```bash
npx prisma migrate dev --name init
```

### 5. Start Server

```bash
npm start
```

## 📁 API Routes
| Method | Endpoint                         | Description                    |
| ------ | -------------------------------- | ------------------------------ |
| POST   | `/auth/login`                    | Login user (email/password)    |
| GET    | `/users/search?q=...`            | Search users by name/email     |
| POST   | `/users/avatar`                  | Upload profile image           |
| GET    | `/messages/`                     | Fetch all user messages        |
| POST   | `/messages/`                     | Create a new message           |
| GET    | `/messages/:id`                  | Get a single message thread    |
| PATCH  | `/messages/:id/read`             | Mark a message as read         |
| POST   | `/messages/:id/reply`            | Add a comment to a message     |
| POST   | `/messages/:id/react`            | React to a message             |
| POST   | `/messages/:id/react/:commentId` | React to a specific comment    |
| POST   | `/messages/image`                | Upload image from Quill editor |


## 📂 File Uploads
Uploaded files are saved to a Render persistent storage at

```bash
/mnt/data/uploads
```
They are served statically via:
```bash
GET /uploads/:filename
```

If not using a persistent storage
```bash
Create a /uploads folder in root of backend
remove /mnt/data from the uploads path
```

## 🔒 CORS Support
CORS is currently enabled for:
- `https://message-application-frontend.pages.dev`

To allow your `http://localhost:5173` to function:

Modify line 26 in `app.js` from:  
```bash
origin: ["https://message-application-frontend.pages.dev"]
```
To:
```bash
origin: ["http://localhost:5173"]
```

## 🤝 Contributing
Feel free to open issues or submit pull requests to improve the API.

## Contact Info
Wyatt Pierce @ wpierce53@gmail.com