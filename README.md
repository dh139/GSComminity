# Gajjar Samaj Community App

A full MERN stack community social application for the Gajjar Samaj community with features like member directory, social feed, events, and family tree management.

## Features

- User Authentication (Register, Login, Password Reset)
- Member Directory with search and filters
- Social Feed with posts, likes, and comments
- Community Events with RSVP
- Family Tree Builder
- Admin Dashboard for member approvals and management
- Profile Management with photo upload
- Mobile-responsive design

## Tech Stack

**Frontend:**
- React 18 with Vite
- React Router DOM v6
- Zustand (State Management)
- Tailwind CSS
- React Icons
- React Hot Toast

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- Cloudinary (Image Storage)
- Multer (File Upload)

## Project Structure

\`\`\`
gajjar-samaj-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── cloudinary.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── post.controller.js
│   │   │   ├── event.controller.js
│   │   │   ├── familyTree.controller.js
│   │   │   └── admin.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── upload.middleware.js
│   │   ├── models/
│   │   │   ├── User.model.js
│   │   │   ├── Post.model.js
│   │   │   ├── Event.model.js
│   │   │   └── FamilyTree.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── post.routes.js
│   │   │   ├── event.routes.js
│   │   │   ├── familyTree.routes.js
│   │   │   └── admin.routes.js
│   │   ├── utils/
│   │   │   └── generateToken.js
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── lib/
│   │   │   └── axios.js
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── ForgotPassword.jsx
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── ManageUsers.jsx
│   │   │   │   └── ManageEvents.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Feed.jsx
│   │   │   ├── CreatePost.jsx
│   │   │   ├── Members.jsx
│   │   │   ├── MemberDetail.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── FamilyTree.jsx
│   │   ├── store/
│   │   │   ├── authStore.js
│   │   │   ├── postStore.js
│   │   │   ├── familyTreeStore.js
│   │   │   └── eventStore.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
\`\`\`

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- MongoDB installed locally or MongoDB Atlas account
- Cloudinary account for image uploads (free tier works)

### 2. Clone and Setup

\`\`\`bash
# Create project folder
mkdir gajjar-samaj-app
cd gajjar-samaj-app
\`\`\`

### 3. Backend Setup

\`\`\`bash
# Create backend folder
mkdir backend
cd backend

# Initialize package.json (copy the package.json content provided)
npm init -y

# Install dependencies
npm install express mongoose dotenv bcryptjs jsonwebtoken cors multer cloudinary express-validator cookie-parser

# Install dev dependencies
npm install -D nodemon
\`\`\`

Copy all the backend files from the `backend/` folder structure provided.

Update your `backend/package.json` scripts:
\`\`\`json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
\`\`\`

### 4. Frontend Setup

\`\`\`bash
# From project root
cd ..

# Create Vite React app
npm create vite@latest frontend -- --template react

# Navigate to frontend
cd frontend

# Install dependencies
npm install react-router-dom zustand axios react-icons react-hot-toast

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
\`\`\`

Copy all the frontend files from the `frontend/` folder structure provided.

### 5. Environment Variables

Create `.env` file in the `backend` folder:

\`\`\`env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gajjar-samaj
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=http://localhost:5173
\`\`\`

**Getting Cloudinary Credentials:**
1. Sign up at https://cloudinary.com (free)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret

### 6. MongoDB Setup

**Option A - Local MongoDB:**
\`\`\`bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod
\`\`\`

**Option B - MongoDB Atlas (Cloud):**
1. Create account at https://www.mongodb.com/atlas
2. Create a free cluster
3. Get connection string and update MONGODB_URI

### 7. Run the Application

\`\`\`bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm run dev
\`\`\`

**URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### 8. Create Admin User

After registering your first user, you can make them an admin by running this in MongoDB:

\`\`\`javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin", isApproved: true } }
)
\`\`\`

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all approved users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update profile

### Posts
- `GET /api/posts` - Get all posts (paginated)
- `POST /api/posts` - Create post
- `PUT /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment
- `DELETE /api/posts/:id` - Delete post

### Events
- `GET /api/events` - Get events
- `POST /api/events` - Create event (admin)
- `POST /api/events/:id/rsvp` - RSVP to event
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### Family Tree
- `GET /api/family-tree/me` - Get user's family tree
- `POST /api/family-tree/members` - Add family member

### Admin
- `GET /api/admin/stats` - Get dashboard stats
- `GET /api/admin/pending-approvals` - Get pending users
- `PUT /api/admin/users/:id/approve` - Approve user
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user

## Default Credentials

After setup, register a new account. The first user should be manually upgraded to admin via MongoDB.

## Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env

**Cloudinary Upload Error:**
- Verify Cloudinary credentials
- Check file size limits

**CORS Error:**
- Ensure CLIENT_URL in backend .env matches frontend URL

## License

MIT License
