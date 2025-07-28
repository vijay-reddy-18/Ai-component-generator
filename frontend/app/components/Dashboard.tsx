'use client';

import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Sidebar from './Sidebar';
import ChatPanel from './ChatPanel';
import PreviewPanel from './PreviewPanel';
import CodePanel from './CodePanel';
import SettingsPanel from './SettingsPanel';
import AuthModal from './AuthModal';
import LandingPage from './LandingPage';
import { useAuth } from '../providers/AuthProvider';
import { Session, Message } from '../types';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLanding, setShowLanding] = useState(!user);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentCode, setCurrentCode] = useState<{
    jsx: string;
    tsx: string;
    css: string;
    preview: string;
  }>({
    jsx: '',
    tsx: '',
    css: '',
    preview: ''
  });
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [currentLanguage, setCurrentLanguage] = useState<'jsx' | 'tsx'>(
    user?.preferences?.defaultLanguage || 'jsx'
  );

  // Show landing page for non-authenticated users
  useEffect(() => {
    setShowLanding(!user);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const handleAuthRequired = useCallback(() => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get('/api/sessions');
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load sessions');
    }
  };

  const createNewSession = async () => {
    if (!handleAuthRequired()) return;
    
    try {
      const response = await axios.post('/api/sessions', {
        title: `New Session ${new Date().toLocaleDateString()}`,
        description: 'AI Component Generation Session'
      });
      
      const newSession = response.data;
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      setMessages([]);
      setCurrentCode({ jsx: '', tsx: '', css: '', preview: '' });
      toast.success('New session created!');
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('Failed to create new session');
    }
  };

  const loadSession = async (sessionId: string) => {
    if (!handleAuthRequired()) return;
    
    try {
      const response = await axios.get(`/api/sessions/${sessionId}`);
      const session = response.data;
      
      setCurrentSession(session);
      setMessages(session.messages || []);
      
      if (session.currentComponent) {
        setCurrentCode(session.currentComponent);
        if (session.currentComponent.language) {
          setCurrentLanguage(session.currentComponent.language);
        }
      } else {
        setCurrentCode({ jsx: '', tsx: '', css: '', preview: '' });
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      toast.error('Failed to load session');
    }
  };

  const sendMessage = async (content: string, attachments: any[] = []) => {
    if (!handleAuthRequired()) return;
    
    if (!currentSession) {
      toast.error('Please create a session first');
      return;
    }

    setLoading(true);
    
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date(),
      attachments: attachments
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      const response = await axios.post('/api/generate', {
        prompt: content,
        previousCode: currentCode,
        model: user?.preferences?.defaultModel || 'microsoft/wizardlm-2-8x22b',
        language: currentLanguage,
        attachments: attachments
      });

      const aiMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        componentCode: response.data.componentCode,
        metadata: response.data.metadata
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      if (response.data.componentCode) {
        const newCode = {
          jsx: response.data.componentCode.jsx || currentCode.jsx,
          tsx: response.data.componentCode.tsx || currentCode.tsx,
          css: response.data.componentCode.css || currentCode.css,
          preview: response.data.componentCode.preview || currentCode.preview
        };
        setCurrentCode(newCode);

        // Auto-generate session name from component
        if (currentSession.title.includes('New Session')) {
          const componentName = extractComponentName(content, response.data.componentCode.jsx || response.data.componentCode.tsx);
          if (componentName) {
            await axios.put(`/api/sessions/${currentSession._id}`, {
              title: componentName
            });
            setCurrentSession(prev => prev ? { ...prev, title: componentName } : null);
            setSessions(prev => prev.map(s => 
              s._id === currentSession._id ? { ...s, title: componentName } : s
            ));
          }
        }

        // Save session with updated component
        await axios.put(`/api/sessions/${currentSession._id}`, {
          messages: finalMessages,
          currentComponent: {
            ...newCode,
            language: currentLanguage,
            version: (currentSession.currentComponent?.version || 0) + 1
          }
        });
      }

      toast.success('Component generated successfully!');
    } catch (error: any) {
      console.error('Failed to generate component:', error);
      const errorMessage = error.response?.data?.error || 'Failed to generate component';
      toast.error(errorMessage);
      
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  const extractComponentName = (prompt: string, code: string) => {
    // Try to extract component name from prompt
    const promptWords = prompt.toLowerCase();
    if (promptWords.includes('button')) return 'Button Component';
    if (promptWords.includes('card')) return 'Card Component';
    if (promptWords.includes('form')) return 'Form Component';
    if (promptWords.includes('navbar') || promptWords.includes('navigation')) return 'Navigation Component';
    if (promptWords.includes('modal')) return 'Modal Component';
    if (promptWords.includes('table')) return 'Table Component';
    if (promptWords.includes('chart')) return 'Chart Component';
    if (promptWords.includes('dashboard')) return 'Dashboard Component';
    if (promptWords.includes('pricing')) return 'Pricing Component';
    if (promptWords.includes('hero')) return 'Hero Component';
    if (promptWords.includes('footer')) return 'Footer Component';
    if (promptWords.includes('header')) return 'Header Component';
    
    // Try to extract from code
    const functionMatch = code.match(/function\s+(\w+)/);
    const constMatch = code.match(/const\s+(\w+)\s*=/);
    
    if (functionMatch) return `${functionMatch[1]} Component`;
    if (constMatch) return `${constMatch[1]} Component`;
    
    return 'Custom Component';
  };

  const deleteSession = async (sessionId: string) => {
    if (!handleAuthRequired()) return;
    
    try {
      await axios.delete(`/api/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s._id !== sessionId));
      
      if (currentSession?._id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
        setCurrentCode({ jsx: '', tsx: '', css: '', preview: '' });
      }
      
      toast.success('Session deleted');
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('Failed to delete session');
    }
  };

  const archiveSession = async (sessionId: string) => {
    if (!handleAuthRequired()) return;
    
    try {
      await axios.put(`/api/sessions/${sessionId}/archive`);
      await loadSessions(); // Reload to update status
      toast.success('Session archived');
    } catch (error) {
      console.error('Failed to archive session:', error);
      toast.error('Failed to archive session');
    }
  };

  const shareSession = async (sessionId: string) => {
    if (!handleAuthRequired()) return;
    
    try {
      const response = await axios.put(`/api/sessions/${sessionId}/share`);
      navigator.clipboard.writeText(response.data.shareUrl);
      await loadSessions(); // Reload to update share status
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      console.error('Failed to share session:', error);
      toast.error('Failed to share session');
    }
  };

  const renameSession = async (sessionId: string, newTitle: string) => {
    if (!handleAuthRequired()) return;
    
    try {
      await axios.put(`/api/sessions/${sessionId}`, { title: newTitle });
      setSessions(prev => prev.map(s => 
        s._id === sessionId ? { ...s, title: newTitle } : s
      ));
      if (currentSession?._id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, title: newTitle } : null);
      }
    } catch (error) {
      console.error('Failed to rename session:', error);
      toast.error('Failed to rename session');
    }
  };

  const handleLanguageChange = (language: 'jsx' | 'tsx') => {
    setCurrentLanguage(language);
    
    // Auto-save language preference
    if (currentSession) {
      axios.put(`/api/sessions/${currentSession._id}`, {
        currentComponent: {
          ...currentCode,
          language: language
        }
      }).catch(console.error);
    }
  };

  // Show landing page for non-authenticated users
  if (showLanding) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowAuthModal(true)} />
        <AuthModal
          show={showAuthModal}
          onHide={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  return (
    <div className="d-flex vh-100 bg-body">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        currentSession={currentSession}
        onNewSession={createNewSession}
        onLoadSession={loadSession}
        onDeleteSession={deleteSession}
        onArchiveSession={archiveSession}
        onShareSession={shareSession}
        onRenameSession={renameSession}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onShowSettings={() => setShowSettings(true)}
        collapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Mobile Header */}
        <div className="d-lg-none bg-body border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              ☰
            </button>
            <h5 className="mb-0">AI Component Generator</h5>
            <button
              className="btn btn-outline-secondary"
              onClick={() => setShowSettings(true)}
            >
              ⚙️
            </button>
          </div>
        </div>

        <div className="flex-grow-1 d-flex">
          {/* Chat Panel */}
          <div className="d-flex flex-column chat-panel custom-scrollbar" style={{ width: '450px', minWidth: '400px' }}>
            <ChatPanel
              messages={messages}
              onSendMessage={sendMessage}
              loading={loading}
              currentSession={currentSession}
              onAuthRequired={handleAuthRequired}
            />
          </div>

          {/* Preview/Code Panel */}
          <div className="flex-grow-1 d-flex flex-column border-start code-panel custom-scrollbar">
            {/* Tab Navigation */}
            <div className="border-bottom bg-body-secondary flex-shrink-0">
              <div className="d-flex">
                <button
                  className={`btn btn-link text-decoration-none px-4 py-3 ${
                    activeTab === 'preview' ? 'border-bottom border-primary border-3' : ''
                  }`}
                  onClick={() => setActiveTab('preview')}
                >
                  👁️ Preview
                </button>
                <button
                  className={`btn btn-link text-decoration-none px-4 py-3 ${
                    activeTab === 'code' ? 'border-bottom border-primary border-3' : ''
                  }`}
                  onClick={() => setActiveTab('code')}
                >
                  💻 Code
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-grow-1 overflow-auto custom-scrollbar">
              {activeTab === 'preview' ? (
                <PreviewPanel 
                  code={currentCode} 
                  language={currentLanguage}
                />
              ) : (
                <CodePanel 
                  code={currentCode} 
                  language={currentLanguage}
                  onLanguageChange={handleLanguageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsPanel
        show={showSettings}
        onHide={() => setShowSettings(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
      />

      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
}