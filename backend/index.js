const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|txt|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://vijay5094:Vijay%405094@cluster0.v35re.mongodb.net/Aibot?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Enhanced User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  name: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  dateOfBirth: { type: Date },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    defaultModel: { type: String, default: 'microsoft/wizardlm-2-8x22b' },
    defaultLanguage: { type: String, enum: ['jsx', 'tsx'], default: 'jsx' },
    autoSave: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

// Enhanced Session Schema with archive and sharing
const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  isShared: { type: Boolean, default: false },
  shareId: { type: String, unique: true, sparse: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    attachments: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String
    }],
    componentCode: {
      jsx: String,
      tsx: String,
      css: String,
      preview: String
    },
    metadata: {
      model: String,
      tokens: Number,
      processingTime: Number
    }
  }],
  currentComponent: {
    jsx: String,
    tsx: String,
    css: String,
    preview: String,
    language: { type: String, enum: ['jsx', 'tsx'], default: 'jsx' },
    version: { type: Number, default: 1 }
  },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
sessionSchema.index({ userId: 1, updatedAt: -1 });
sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ shareId: 1 });

const User = mongoose.model('User', userSchema);
const Session = mongoose.model('Session', sessionSchema);

// Auth middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    req.user = decoded;
    req.userDoc = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Validation middleware
const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

// Auth routes
app.post('/api/auth/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password, name, phone, dateOfBirth } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const user = new User({
      email,
      password: hashedPassword,
      name,
      phone: phone || '',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    });
    
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        preferences: user.preferences
      },
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/auth/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        preferences: user.preferences
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.userDoc._id,
        email: req.userDoc.email,
        name: req.userDoc.name,
        preferences: req.userDoc.preferences,
        createdAt: req.userDoc.createdAt,
        lastLogin: req.userDoc.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Session routes with enhanced functionality
app.get('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'active' } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.userId, status };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sessions = await Session.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('title description createdAt updatedAt messages tags status isShared')
      .lean();

    const total = await Session.countDocuments(query);

    const enhancedSessions = sessions.map(session => ({
      ...session,
      messageCount: session.messages?.length || 0,
      lastMessage: session.messages?.length > 0 
        ? session.messages[session.messages.length - 1].content.substring(0, 100) + '...'
        : 'No messages yet',
      hasCode: session.messages?.some(msg => msg.componentCode?.jsx || msg.componentCode?.tsx) || false
    }));
    
    res.json({
      sessions: enhancedSessions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + sessions.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Sessions fetch error:', error);
    res.status(500).json({ error: 'Server error fetching sessions' });
  }
});

app.post('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const { title, description = '' } = req.body;
    
    const sessionTitle = title?.trim() || `New Session ${new Date().toLocaleDateString()}`;

    const session = new Session({
      userId: req.user.userId,
      title: sessionTitle,
      description: description.trim(),
      messages: [],
    });
    
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Server error creating session' });
  }
});

app.get('/api/sessions/:id', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Session fetch error:', error);
    res.status(500).json({ error: 'Server error fetching session' });
  }
});

app.put('/api/sessions/:id', authenticateToken, async (req, res) => {
  try {
    const { messages, currentComponent, title, description, tags, status } = req.body;
    
    const updateData = { 
      updatedAt: Date.now() 
    };

    if (messages) updateData.messages = messages;
    if (currentComponent) updateData.currentComponent = currentComponent;
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (tags) updateData.tags = tags;
    if (status) updateData.status = status;

    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      updateData,
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Session update error:', error);
    res.status(500).json({ error: 'Server error updating session' });
  }
});

app.delete('/api/sessions/:id', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Session deletion error:', error);
    res.status(500).json({ error: 'Server error deleting session' });
  }
});

// Archive session
app.put('/api/sessions/:id/archive', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { status: 'archived', updatedAt: Date.now() },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({ message: 'Session archived successfully', session });
  } catch (error) {
    console.error('Session archive error:', error);
    res.status(500).json({ error: 'Server error archiving session' });
  }
});

// Share session
app.put('/api/sessions/:id/share', authenticateToken, async (req, res) => {
  try {
    const shareId = require('crypto').randomBytes(16).toString('hex');
    
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isShared: true, shareId, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({ 
      message: 'Session shared successfully', 
      shareUrl: `${process.env.FRONTEND_URL}/shared/${shareId}`,
      session 
    });
  } catch (error) {
    console.error('Session share error:', error);
    res.status(500).json({ error: 'Server error sharing session' });
  }
});

// File upload endpoint
app.post('/api/upload', authenticateToken, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`
    }));

    res.json({ files: uploadedFiles });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Server error uploading files' });
  }
});

// Enhanced AI generation route
app.post('/api/generate', authenticateToken, async (req, res) => {
  try {
    const { prompt, previousCode, model = 'microsoft/wizardlm-2-8x22b', language = 'jsx', attachments = [] } = req.body;
    
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    const startTime = Date.now();

    // Enhanced system prompt for better code generation
    const systemPrompt = `You are an expert React component developer specializing in creating modern, responsive, and accessible components. Generate clean React components based on user requirements.

CRITICAL RULES:
1. Always return valid ${language.toUpperCase()} code that can be rendered directly
2. Use modern React patterns (functional components, hooks)
3. Use Bootstrap 5 classes for styling AND Tailwind CSS when appropriate
4. Make components responsive and accessible
5. Include proper TypeScript types when using TSX
6. Generate BOTH JSX/TSX component code AND CSS when needed
7. Always generate both JSX and TSX versions when possible
8. NEVER include code in your explanation - code goes only in the JSON response
9. In your explanation, describe what the component does, its features, and how to use it

RESPONSE FORMAT:
You must respond with TWO parts:
1. A brief explanation of the component (what it does, features, usage)
2. A JSON object with the code structure:
{
  "explanation": "Brief description of what this component does and its key features",
  "jsx": "JSX component code here",
  "tsx": "TSX component code here (with proper types)",
  "${language}": "component code here",
  "css": "additional CSS if needed",
  "description": "brief description of the component"
}

IMPORTANT: 
- Your explanation should be conversational and helpful, but NEVER include code snippets
- All code must be in the JSON object only
- Both JSX and TSX code should be ready to render immediately
- Include Bootstrap 5 classes for styling

Example response format:
I've created a modern counter component with increment functionality. This component features a clean card design with Bootstrap styling, includes proper state management using React hooks, and provides a responsive layout that works well on all devices. The component is fully accessible and includes hover effects for better user interaction.
{
  "explanation": "A modern counter component with increment functionality and clean Bootstrap styling",
  "jsx": "function MyComponent() {\\n  const [count, setCount] = useState(0);\\n  \\n  return (\\n    <div className=\\"container mt-4\\">\\n      <div className=\\"card shadow\\">\\n        <div className=\\"card-body\\">\\n          <h2 className=\\"card-title\\">Counter: {count}</h2>\\n          <button \\n            className=\\"btn btn-primary\\" \\n            onClick={() => setCount(count + 1)}\\n          >\\n            Increment\\n          </button>\\n        </div>\\n      </div>\\n    </div>\\n  );\\n}",
  "tsx": "interface MyComponentProps {}\\n\\nconst MyComponent: React.FC<MyComponentProps> = () => {\\n  const [count, setCount] = useState<number>(0);\\n  \\n  return (\\n    <div className=\\"container mt-4\\">\\n      <div className=\\"card shadow\\">\\n        <div className=\\"card-body\\">\\n          <h2 className=\\"card-title\\">Counter: {count}</h2>\\n          <button \\n            className=\\"btn btn-primary\\" \\n            onClick={() => setCount(count + 1)}\\n          >\\n            Increment\\n          </button>\\n        </div>\\n      </div>\\n    </div>\\n  );\\n};",
  "${language}": "function MyComponent() {\\n  const [count, setCount] = useState(0);\\n  \\n  return (\\n    <div className=\\"container mx-auto mt-8\\">\\n      <div className=\\"bg-white rounded-lg shadow-lg p-6\\">\\n        <h2 className=\\"text-2xl font-bold text-gray-800 mb-4\\">Counter: {count}</h2>\\n        <button \\n          className=\\"bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded\\" \\n          onClick={() => setCount(count + 1)}\\n        >\\n          Increment\\n        </button>\\n      </div>\\n    </div>\\n  );\\n}",
  "css": "/* Additional custom styles if needed */",
  "description": "A simple counter component with increment functionality"
}`;

    let contextPrompt = prompt;
    
    // Add context from attachments
    if (attachments && attachments.length > 0) {
      contextPrompt += '\n\nAttached files context:\n';
      attachments.forEach(file => {
        contextPrompt += `- ${file.originalName} (${file.mimetype})\n`;
      });
    }

    // Add previous code context
    if (previousCode && (previousCode.jsx || previousCode.tsx)) {
      contextPrompt += `\n\nCurrent component code:\n${previousCode[language] || previousCode.jsx || previousCode.tsx}`;
      if (previousCode.css) {
        contextPrompt += `\n\nCurrent CSS:\n${previousCode.css}`;
      }
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: contextPrompt }
    ];

    console.log('🤖 Generating component with OpenRouter...');

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: model,
      messages: messages,
      max_tokens: 4000,
      temperature: 0.7,
      top_p: 0.9,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
        'X-Title': 'AI Component Generator'
      },
      timeout: 30000
    });

    const aiResponse = response.data.choices[0].message.content;
    const processingTime = Date.now() - startTime;
    
    let explanationText = '';
    let componentCode = { jsx: '', tsx: '', css: '', description: '' };
    
    try {
      // Split response into explanation and JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        explanationText = aiResponse.substring(0, jsonMatch.index).trim();
        const parsed = JSON.parse(jsonMatch[0]);
        componentCode = {
          jsx: parsed.jsx || (language === 'jsx' ? parsed[language] : '') || '',
          tsx: parsed.tsx || (language === 'tsx' ? parsed[language] : '') || '',
          css: parsed.css || '',
          description: parsed.description || parsed.explanation || ''
        };
      } else {
        // Fallback: try to parse entire response as JSON
        const parsed = JSON.parse(aiResponse);
        explanationText = parsed.explanation || 'Component generated successfully.';
        componentCode = {
          jsx: parsed.jsx || (language === 'jsx' ? parsed[language] : '') || '',
          tsx: parsed.tsx || (language === 'tsx' ? parsed[language] : '') || '',
          css: parsed.css || '',
          description: parsed.description || ''
        };
      }
    } catch (parseError) {
      // Fallback: extract explanation and code separately
      explanationText = 'Component generated successfully.';
      let codeContent = aiResponse.trim();
      
      // Remove any code blocks from explanation
      const codeBlockRegex = /```[\s\S]*?```/g;
      explanationText = aiResponse.replace(codeBlockRegex, '').trim();
      
      // Extract code from markdown blocks
      const codeBlocks = aiResponse.match(/```[\s\S]*?```/g);
      if (codeBlocks && codeBlocks.length > 0) {
        codeContent = codeBlocks[0].replace(/```jsx?\n?/g, '').replace(/```tsx?\n?/g, '').replace(/```\n?/g, '');
      }
      
      if (!codeContent.includes('function ') && !codeContent.includes('const ') && !codeContent.includes('export')) {
        codeContent = `function GeneratedComponent() {\n  return (\n    ${codeContent}\n  );\n}`;
      }
      
      componentCode = {
        jsx: language === 'jsx' ? codeContent : '',
        tsx: language === 'tsx' ? codeContent : '',
        css: '',
        description: 'Generated component'
      };
    }

    // Ensure we have both JSX and TSX versions
    if (componentCode.jsx && !componentCode.tsx) {
      // Convert JSX to TSX
      componentCode.tsx = convertJsxToTsx(componentCode.jsx);
    } else if (componentCode.tsx && !componentCode.jsx) {
      // Convert TSX to JSX
      componentCode.jsx = convertTsxToJsx(componentCode.tsx);
    }

    // Generate preview HTML
    const previewHTML = generatePreviewHTML(componentCode[language] || componentCode.jsx, componentCode.css, language);
    
    const result = {
      response: explanationText || 'Component generated successfully.',
      componentCode: {
        ...componentCode,
        preview: previewHTML
      },
      metadata: {
        model: model,
        language: language,
        processingTime: processingTime,
        tokens: response.data.usage?.total_tokens || 0
      }
    };

    console.log('✅ Component generated successfully');
    res.json(result);
    
  } catch (error) {
    console.error('❌ AI generation error:', error.response?.data || error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ error: 'Request timeout. Please try again.' });
    }
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid OpenRouter API key' });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate component. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// User stats endpoint
app.get('/api/user/stats', authenticateToken, async (req, res) => {
  try {
    const sessions = await Session.countDocuments({ userId: req.user.userId });
    const sessionsWithMessages = await Session.find({ userId: req.user.userId });
    
    let totalMessages = 0;
    let totalComponents = 0;
    
    sessionsWithMessages.forEach(session => {
      totalMessages += session.messages?.length || 0;
      if (session.currentComponent && (session.currentComponent.jsx || session.currentComponent.tsx)) {
        totalComponents += 1;
      }
    });
    
    res.json({
      sessions,
      messages: totalMessages,
      components: totalComponents
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
});

// Helper functions for JSX/TSX conversion
function convertJsxToTsx(jsxCode) {
  // Basic JSX to TSX conversion
  let tsxCode = jsxCode;
  
  // Add React import if not present
  if (!tsxCode.includes('import React')) {
    tsxCode = "import React from 'react';\n" + tsxCode;
  }
  
  // Convert function declarations to typed versions
  tsxCode = tsxCode.replace(
    /function\s+(\w+)\s*\(/g,
    'const $1: React.FC = ('
  );
  
  // Add interface for props if component has parameters
  if (tsxCode.includes('(props') || tsxCode.includes('({')) {
    const componentName = tsxCode.match(/(?:const|function)\s+(\w+)/)?.[1];
    if (componentName) {
      const interfaceName = `${componentName}Props`;
      tsxCode = `interface ${interfaceName} {}\n\n` + tsxCode;
      tsxCode = tsxCode.replace(
        new RegExp(`const ${componentName}: React\\.FC`),
        `const ${componentName}: React.FC<${interfaceName}>`
      );
    }
  }
  
  return tsxCode;
}

function convertTsxToJsx(tsxCode) {
  // Basic TSX to JSX conversion
  let jsxCode = tsxCode;
  
  // Remove TypeScript interfaces
  jsxCode = jsxCode.replace(/interface\s+\w+\s*{[^}]*}\s*/g, '');
  
  // Remove type annotations
  jsxCode = jsxCode.replace(/:\s*React\.FC(<[^>]*>)?/g, '');
  jsxCode = jsxCode.replace(/:\s*\w+(\[\])?/g, '');
  jsxCode = jsxCode.replace(/<[^>]+>/g, '');
  
  // Convert const components back to function declarations
  jsxCode = jsxCode.replace(
    /const\s+(\w+)\s*=\s*\(/g,
    'function $1('
  );
  
  return jsxCode;
}

// Download code as ZIP
app.post('/api/download', authenticateToken, async (req, res) => {
  try {
    const { jsx, tsx, css, filename = 'component' } = req.body;
    
    if (!jsx && !tsx && !css) {
      return res.status(400).json({ error: 'No code to download' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).json({ error: 'Error creating archive' });
    });

    archive.pipe(res);

    // Add files to archive
    if (jsx) {
      archive.append(jsx, { name: `${filename}.jsx` });
    }
    
    if (tsx) {
      archive.append(tsx, { name: `${filename}.tsx` });
    }
    
    if (css) {
      archive.append(css, { name: `${filename}.css` });
    }

    // Add package.json for dependencies
    const packageJson = {
      name: filename,
      version: "1.0.0",
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
      },
      devDependencies: {
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "typescript": "^5.0.0"
      }
    };
    
    archive.append(JSON.stringify(packageJson, null, 2), { name: 'package.json' });

    // Add README
    const readme = `# ${filename}

Generated component using AI Component Generator.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

Import and use the component in your React application.

\`\`\`${jsx ? 'jsx' : 'tsx'}
import ${filename} from './${filename}';

function App() {
  return (
    <div>
      <${filename} />
    </div>
  );
}
\`\`\`
`;
    
    archive.append(readme, { name: 'README.md' });
    
    archive.finalize();
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Server error creating download' });
  }
});

// Helper function to generate preview HTML
function generatePreviewHTML(code, css, language) {
  if (!code) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Component Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
        </style>
      </head>
      <body>
        <div class="text-center">
          <div class="mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
              <circle cx="12" cy="13" r="3"></circle>
            </svg>
          </div>
          <h5 class="text-gray-600 text-xl font-semibold">No Component Generated</h5>
          <p class="text-gray-500">Start a conversation to generate your first React component</p>
        </div>
      </body>
      </html>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Component Preview</title>
      <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { 
          margin: 0; 
          padding: 20px; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background: #f8fafc;
        }
        #root {
          min-height: 200px;
        }
        ${css || ''}
      </style>
    </head>
    <body>
      <div id="root"></div>
      <script type="text/babel">
        const { useState, useEffect, useCallback, useMemo, useRef } = React;
        
        try {
          ${code}
          
          // Find the component function
          const componentNames = Object.keys(window).filter(key => 
            typeof window[key] === 'function' && 
            key !== 'React' && 
            key !== 'ReactDOM' && 
            key !== 'Babel' &&
            (key.includes('Component') || key.charAt(0) === key.charAt(0).toUpperCase())
          );
          
          let Component;
          
          if (componentNames.length > 0) {
            Component = window[componentNames[0]];
          } else {
            // Try to extract component from the code string
            const functionMatch = \`${code}\`.match(/function\\s+(\\w+)/);
            const constMatch = \`${code}\`.match(/const\\s+(\\w+)\\s*=/);
            
            if (functionMatch) {
              Component = window[functionMatch[1]];
            } else if (constMatch) {
              Component = window[constMatch[1]];
            }
          }
          
          if (!Component) {
            // Try to evaluate the code directly
            Component = eval('(' + \`${code.replace(/function\\s+(\\w+)/, '$1 = function')}\` + ')');
          }
          
          if (Component) {
            ReactDOM.render(React.createElement(Component), document.getElementById('root'));
          } else {
            document.getElementById('root').innerHTML = '<div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">Component not found. Please check the generated code.</div>';
          }
          
        } catch (error) {
          console.error('Preview error:', error);
          document.getElementById('root').innerHTML = 
            '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"><strong>Error:</strong> ' + error.message + '</div>';
        }
      </script>
    </body>
    </html>
  `;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔑 OpenRouter API: ${process.env.OPENROUTER_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI ? '✅ Configured' : '❌ Using default'}`);
});
