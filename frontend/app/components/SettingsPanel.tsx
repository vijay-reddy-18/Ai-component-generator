'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Button, Card, Badge, Alert, Accordion } from 'react-bootstrap';
import { Settings, Moon, Sun, Cpu, Key, User, Save, HelpCircle, Book, Zap, Upload, Camera } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { useAuth } from '../providers/AuthProvider';
import toast from 'react-hot-toast';
import axios from 'axios';

interface SettingsPanelProps {
  show: boolean;
  onHide: () => void;
}

export default function SettingsPanel({ show, onHide }: SettingsPanelProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'profile' | 'help'>('general');
  const [userStats, setUserStats] = useState({
    sessions: 0,
    components: 0,
    messages: 0
  });
  const [profileImage, setProfileImage] = useState<string>('');
  const [settings, setSettings] = useState({
    defaultModel: user?.preferences?.defaultModel || 'microsoft/wizardlm-2-8x22b',
    defaultLanguage: user?.preferences?.defaultLanguage || 'jsx',
    autoSave: user?.preferences?.autoSave ?? true,
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  });

  useEffect(() => {
    if (show && user) {
      loadUserStats();
    }
  }, [show, user]);

  const loadUserStats = async () => {
    try {
      const response = await axios.get('/api/user/stats');
      setUserStats(response.data);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('files', file);

    try {
      const response = await axios.post('/api/upload', formData);
      const imageUrl = response.data.files[0].url;
      setProfileImage(imageUrl);
      toast.success('Profile image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const aiModels = [
    { 
      id: 'microsoft/wizardlm-2-8x22b', 
      name: 'WizardLM-2 8x22B', 
      description: 'Powerful and creative, best for complex components',
      recommended: true
    },
    { 
      id: 'openai/gpt-4o-mini', 
      name: 'GPT-4o Mini', 
      description: 'Fast and efficient, good for simple components' 
    },
    { 
      id: 'anthropic/claude-3-haiku', 
      name: 'Claude 3 Haiku', 
      description: 'Quick responses with good code quality' 
    },
    { 
      id: 'google/gemini-2.0-flash-exp', 
      name: 'Gemini 2.0 Flash', 
      description: 'Latest Google model with experimental features' 
    }
  ];

  const handleSave = () => {
    updateUser({
      name: settings.name,
      preferences: {
        theme,
        defaultModel: settings.defaultModel,
        defaultLanguage: settings.defaultLanguage,
        autoSave: settings.autoSave
      }
    });
    
    toast.success('Settings saved successfully!');
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title className="d-flex align-items-center">
          <Settings size={20} className="me-2" />
          Settings & Help
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        <div className="row g-0">
          {/* Sidebar */}
          <div className="col-md-4 bg-body-secondary border-end">
            <div className="p-3">
              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action border-0 ${
                    activeTab === 'general' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('general')}
                >
                  <Settings size={16} className="me-2" />
                  General
                </button>
                <button
                  className={`list-group-item list-group-item-action border-0 ${
                    activeTab === 'ai' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('ai')}
                >
                  <Cpu size={16} className="me-2" />
                  AI Models
                </button>
                <button
                  className={`list-group-item list-group-item-action border-0 ${
                    activeTab === 'profile' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User size={16} className="me-2" />
                  Profile
                </button>
                <button
                  className={`list-group-item list-group-item-action border-0 ${
                    activeTab === 'help' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('help')}
                >
                  <HelpCircle size={16} className="me-2" />
                  Help & Guide
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="col-md-8">
            <div className="p-4">
              {activeTab === 'general' && (
                <div>
                  <h5 className="mb-4">General Settings</h5>
                  
                  <Card className="mb-4">
                    <Card.Body>
                      <h6 className="card-title">Appearance</h6>
                      <p className="card-text text-muted small">
                        Customize the look and feel of the application
                      </p>
                      
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <strong>Theme</strong>
                          <div className="text-muted small">
                            Current: {theme === 'light' ? 'Light' : 'Dark'} mode
                          </div>
                        </div>
                        <Button
                          variant="outline-secondary"
                          onClick={toggleTheme}
                          className="d-flex align-items-center gap-2"
                        >
                          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                          Switch to {theme === 'light' ? 'Dark' : 'Light'}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className="mb-4">
                    <Card.Body>
                      <h6 className="card-title">Code Generation</h6>
                      <p className="card-text text-muted small">
                        Configure default settings for code generation
                      </p>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Default Language</Form.Label>
                        <Form.Select
                          value={settings.defaultLanguage}
                          onChange={(e) => setSettings(prev => ({ ...prev, defaultLanguage: e.target.value as 'jsx' | 'tsx' }))}
                        >
                          <option value="jsx">JSX (JavaScript)</option>
                          <option value="tsx">TSX (TypeScript)</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Choose whether to generate JSX or TSX components by default
                        </Form.Text>
                      </Form.Group>
                      
                      <Form.Check
                        type="switch"
                        id="auto-save-switch"
                        label="Auto-save sessions"
                        checked={settings.autoSave}
                        onChange={(e) => setSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                        className="mb-2"
                      />
                      <small className="text-muted">
                        Automatically save your work as you chat
                      </small>
                    </Card.Body>
                  </Card>
                </div>
              )}

              {activeTab === 'ai' && (
                <div>
                  <h5 className="mb-4">AI Model Settings</h5>
                  
                  <Card>
                    <Card.Body>
                      <h6 className="card-title">Default Model</h6>
                      <p className="card-text text-muted small">
                        Choose your preferred AI model for component generation
                      </p>
                      
                      <div className="row g-3">
                        {aiModels.map((model) => (
                          <div key={model.id} className="col-12">
                            <div className={`card border ${
                              settings.defaultModel === model.id ? 'border-primary' : ''
                            }`}>
                              <div className="card-body p-3">
                                <div className="d-flex align-items-center">
                                  <Form.Check
                                    type="radio"
                                    name="defaultModel"
                                    id={model.id}
                                    checked={settings.defaultModel === model.id}
                                    onChange={() => setSettings(prev => ({ ...prev, defaultModel: model.id }))}
                                    className="me-3"
                                  />
                                  <div className="flex-grow-1">
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                      <h6 className="mb-0">{model.name}</h6>
                                      {model.recommended && (
                                        <Badge bg="success" className="small">Recommended</Badge>
                                      )}
                                    </div>
                                    <small className="text-muted">{model.description}</small>
                                  </div>
                                  {settings.defaultModel === model.id && (
                                    <Badge bg="primary">Active</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>

                  <Alert variant="info" className="mt-3">
                    <Key size={16} className="me-2" />
                    <strong>API Configuration:</strong> AI models are configured server-side. 
                    Contact your administrator to change API keys or add new models.
                  </Alert>
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <h5 className="mb-4">Profile Settings</h5>
                  
                  <Card className="mb-3">
                    <Card.Body>
                      <h6 className="card-title">Profile Picture</h6>
                      <div className="d-flex align-items-center gap-3">
                        <div className="position-relative">
                          {profileImage || user?.avatar ? (
                            <img
                              src={profileImage || user?.avatar}
                              alt="Profile"
                              className="rounded-circle"
                              style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                 style={{ width: '80px', height: '80px' }}>
                              <User size={32} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            id="profile-image"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                          />
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => document.getElementById('profile-image')?.click()}
                          >
                            <Camera size={16} className="me-2" />
                            Change Photo
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                  
                  <Card>
                    <Card.Body>
                      <h6 className="card-title">Account Information</h6>
                      <p className="card-text text-muted small">
                        Update your personal information
                      </p>
                      
                      <Form>
                        <div className="row">
                          <div className="col-md-6">
                            <Form.Group className="mb-3">
                              <Form.Label>Full Name</Form.Label>
                              <Form.Control
                                type="text"
                                value={settings.name}
                                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter your full name"
                              />
                            </Form.Group>
                          </div>
                          <div className="col-md-6">
                            <Form.Group className="mb-3">
                              <Form.Label>Phone Number</Form.Label>
                              <Form.Control
                                type="tel"
                                value={settings.phone}
                                onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="Enter your phone number"
                              />
                            </Form.Group>
                          </div>
                        </div>
                        
                        <div className="row">
                          <div className="col-md-6">
                            <Form.Group className="mb-3">
                              <Form.Label>Email Address</Form.Label>
                              <Form.Control
                                type="email"
                                value={settings.email}
                                disabled
                                className="bg-body-secondary"
                              />
                              <Form.Text className="text-muted">
                                Email cannot be changed. Contact support if needed.
                              </Form.Text>
                            </Form.Group>
                          </div>
                          <div className="col-md-6">
                            <Form.Group className="mb-3">
                              <Form.Label>Date of Birth</Form.Label>
                              <Form.Control
                                type="date"
                                value={settings.dateOfBirth}
                                onChange={(e) => setSettings(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                              />
                            </Form.Group>
                          </div>
                        </div>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Bio</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={settings.bio}
                            onChange={(e) => setSettings(prev => ({ ...prev, bio: e.target.value }))}
                            placeholder="Tell us about yourself"
                          />
                        </Form.Group>
                        
                        <div className="row">
                          <div className="col-md-6">
                            <Form.Group className="mb-3">
                              <Form.Label>Location</Form.Label>
                              <Form.Control
                                type="text"
                                value={settings.location}
                                onChange={(e) => setSettings(prev => ({ ...prev, location: e.target.value }))}
                                placeholder="City, Country"
                              />
                            </Form.Group>
                          </div>
                          <div className="col-md-6">
                            <Form.Group className="mb-3">
                              <Form.Label>Website</Form.Label>
                              <Form.Control
                                type="url"
                                value={settings.website}
                                onChange={(e) => setSettings(prev => ({ ...prev, website: e.target.value }))}
                                placeholder="https://yourwebsite.com"
                              />
                            </Form.Group>
                          </div>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>

                  <Card className="mt-3">
                    <Card.Body>
                      <h6 className="card-title">Account Statistics</h6>
                      <div className="row text-center">
                        <div className="col-4">
                          <div className="h4 mb-0 text-primary">{userStats.sessions}</div>
                          <small className="text-muted">Sessions</small>
                        </div>
                        <div className="col-4">
                          <div className="h4 mb-0 text-success">{userStats.components}</div>
                          <small className="text-muted">Components</small>
                        </div>
                        <div className="col-4">
                          <div className="h4 mb-0 text-info">{userStats.messages}</div>
                          <small className="text-muted">Messages</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              )}

              {activeTab === 'help' && (
                <div>
                  <h5 className="mb-4">Help & Guide</h5>
                  
                  <Accordion defaultActiveKey="0">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>
                        <Book size={16} className="me-2" />
                        Getting Started
                      </Accordion.Header>
                      <Accordion.Body>
                        <h6>How to use AI Component Generator:</h6>
                        <ol>
                          <li><strong>Create a Session:</strong> Click "New Session" to start</li>
                          <li><strong>Describe Your Component:</strong> Type what you want to build in natural language</li>
                          <li><strong>AI Generates Code:</strong> The AI will create JSX/TSX and CSS code</li>
                          <li><strong>Preview & Refine:</strong> See live preview and ask for modifications</li>
                          <li><strong>Export Code:</strong> Download your component as a ZIP file</li>
                        </ol>
                        
                        <h6 className="mt-3">Example Prompts:</h6>
                        <ul>
                          <li>"Create a modern pricing card with three tiers"</li>
                          <li>"Build a responsive navigation bar with dropdown menus"</li>
                          <li>"Design a contact form with validation"</li>
                          <li>"Make a dashboard with charts and statistics"</li>
                        </ul>
                      </Accordion.Body>
                    </Accordion.Item>

                    <Accordion.Item eventKey="1">
                      <Accordion.Header>
                        <Zap size={16} className="me-2" />
                        Advanced Features
                      </Accordion.Header>
                      <Accordion.Body>
                        <h6>Session Management:</h6>
                        <ul>
                          <li><strong>Archive:</strong> Archive old sessions to keep workspace clean</li>
                          <li><strong>Share:</strong> Generate shareable links for your components</li>
                          <li><strong>Rename:</strong> Give meaningful names to your sessions</li>
                          <li><strong>Search:</strong> Find sessions quickly using the search bar</li>
                        </ul>

                        <h6 className="mt-3">File Uploads:</h6>
                        <ul>
                          <li>Upload images for reference or inspiration</li>
                          <li>Attach design files (PDF, images) to guide AI generation</li>
                          <li>Include text files with requirements or specifications</li>
                        </ul>

                        <h6 className="mt-3">Code Export:</h6>
                        <ul>
                          <li>Download complete ZIP files with JSX/TSX and CSS</li>
                          <li>Includes package.json with dependencies</li>
                          <li>Ready-to-use components for your projects</li>
                        </ul>
                      </Accordion.Body>
                    </Accordion.Item>

                    <Accordion.Item eventKey="2">
                      <Accordion.Header>
                        <HelpCircle size={16} className="me-2" />
                        Tips & Best Practices
                      </Accordion.Header>
                      <Accordion.Body>
                        <h6>Writing Better Prompts:</h6>
                        <ul>
                          <li>Be specific about styling (colors, layout, size)</li>
                          <li>Mention responsive behavior if needed</li>
                          <li>Include functionality requirements (forms, buttons, etc.)</li>
                          <li>Reference popular design patterns or frameworks</li>
                        </ul>

                        <h6 className="mt-3">Iterative Development:</h6>
                        <ul>
                          <li>Start with basic structure, then add details</li>
                          <li>Ask for specific modifications: "Make the button larger and blue"</li>
                          <li>Request accessibility improvements</li>
                          <li>Test different viewport sizes using preview controls</li>
                        </ul>

                        <h6 className="mt-3">Code Quality:</h6>
                        <ul>
                          <li>Choose TSX for TypeScript projects</li>
                          <li>Review generated code before using in production</li>
                          <li>Test components in your actual project environment</li>
                          <li>Customize styling to match your design system</li>
                        </ul>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>

                  <Alert variant="success" className="mt-4">
                    <strong>Need More Help?</strong> Contact our support team or check the documentation 
                    for detailed guides and tutorials.
                  </Alert>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-top">
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        {activeTab !== 'help' && (
          <Button variant="primary" onClick={handleSave}>
            <Save size={16} className="me-2" />
            Save Changes
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}