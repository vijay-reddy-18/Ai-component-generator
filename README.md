# AI Component Generator Platform

A full-stack AI-driven platform for generating React components with live preview, built with Next.js, Node.js, and MongoDB.

## 🚀 Features

### Core Features (Mandatory)
- ✅ **Authentication & Persistence**: Secure signup/login with JWT
- ✅ **Session Management**: Load previous sessions with full chat history
- ✅ **Conversational UI**: Side-panel chat with AI assistant
- ✅ **Live Component Preview**: Real-time rendering with responsive viewport
- ✅ **Code Inspection & Export**: Syntax-highlighted code with copy/download
- ✅ **Iterative Refinement**: Modify components through conversation
- ✅ **Auto-save**: Persistent state across sessions

### Additional Features
- 🎨 **Interactive Landing Page**: Modern Bootstrap-based design
- 🌙 **Theme Support**: Dark/Light mode switching
- 📱 **Responsive Design**: Mobile-first approach
- 🔒 **Security**: Rate limiting, input validation, secure headers
- ⚡ **Performance**: Optimized API calls and caching
- 🎯 **User Experience**: Smooth animations and micro-interactions

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with SSR
- **React 18** - UI library with hooks
- **Bootstrap 5** - CSS framework for styling
- **Framer Motion** - Animation library
- **TypeScript** - Type safety
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **OpenRouter API** - AI model access

### AI Models
- Microsoft WizardLM-2-8x22B (default)
- OpenAI GPT-4o-mini
- Anthropic Claude-3-Haiku
- Google Gemini 2.0 Flash

## 📋 Prerequisites

Before running this project, make sure you have:

1. **Node.js** (v18 or higher)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **OpenRouter API Key** (from https://openrouter.ai)
4. **Git** (for cloning the repository)

## 🚀 Step-by-Step Setup Guide

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ai-component-generator-platform
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install-all
```

### 3. Set Up MongoDB

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Get connection string from "Connect" → "Connect your application"

### 4. Get OpenRouter API Key
1. Visit https://openrouter.ai
2. Sign up for an account
3. Go to "Keys" section
4. Create a new API key
5. Copy the key (starts with `sk-or-`)

### 5. Configure Environment Variables

#### Backend Configuration
Create `backend/.env` file:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ai-component-generator
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-component-generator

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# OpenRouter API Configuration
OPENROUTER_API_KEY=sk-or-your-openrouter-api-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

#### Frontend Configuration
Create `frontend/.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=AI Component Generator
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 6. Start the Application

#### Option A: Start Both Services Together
```bash
npm run dev
```

#### Option B: Start Services Separately
```bash
# Terminal 1 - Backend
npm run backend

# Terminal 2 - Frontend
npm run frontend
```

### 7. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🎯 How to Use

### 1. Landing Page
- Visit http://localhost:3000
- Explore features and testimonials
- Click "Get Started Free" to create account

### 2. Authentication
- Sign up with email and password
- Or sign in if you already have an account
- Secure JWT-based authentication

### 3. Generate Components
1. **Start New Session**: Click "New Session" in sidebar
2. **Describe Component**: Type what you want to build
   - Example: "Create a modern pricing card with three tiers"
3. **AI Generation**: AI generates React component code
4. **Live Preview**: See component rendered in real-time
5. **Iterate**: Ask for modifications in chat
6. **Export**: Copy code or download as files

### 4. Session Management
- **Auto-save**: Sessions save automatically
- **Resume**: Click any session to continue where you left off
- **History**: Full chat history preserved
- **Search**: Find sessions by title or content

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get user profile

### Sessions
- `GET /api/sessions` - List user sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### AI Generation
- `POST /api/generate` - Generate component with AI

### Utility
- `GET /api/health` - Health check

## 🎨 Customization

### Changing AI Models
Edit `backend/index.js` and modify the model parameter:
```javascript
const model = 'openai/gpt-4o-mini'; // or any supported model
```

### Styling
- Frontend uses Bootstrap 5 for styling
- Custom CSS in `frontend/app/globals.css`
- Component-specific styles in individual files

### Adding Features
1. **Backend**: Add routes in `backend/index.js`
2. **Frontend**: Add components in `frontend/app/components/`
3. **Database**: Modify schemas in backend

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Backend (Railway/Render)
1. Create account on Railway or Render
2. Connect GitHub repository
3. Set environment variables
4. Deploy with auto-scaling

### Database (MongoDB Atlas)
1. Use MongoDB Atlas for production
2. Update connection string in environment variables
3. Configure network access and security

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize user inputs
- **CORS Protection**: Configured origins
- **Security Headers**: Helmet.js protection

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check network connectivity for Atlas

2. **OpenRouter API Error**
   - Verify API key is correct
   - Check API quota/limits
   - Ensure proper formatting

3. **Preview Not Loading**
   - Check browser console for errors
   - Verify component code syntax
   - Try refreshing preview

4. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9
   ```

### Debug Mode
Set `NODE_ENV=development` in backend `.env` for detailed error messages.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review API documentation

---

**Happy Coding! 🚀**