'use client';

import { useState } from 'react';
import { Button, ListGroup, Form, Badge, Dropdown, Modal } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  Search, 
  Trash2, 
  Archive,
  Share2,
  Edit3,
  Calendar,
  User,
  LogOut,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import { Session } from '../types';
import toast from 'react-hot-toast';

interface SidebarProps {
  sessions: Session[];
  currentSession: Session | null;
  onNewSession: () => void;
  onLoadSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onArchiveSession: (sessionId: string) => void;
  onShareSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onToggleSidebar: () => void;
  onShowSettings: () => void;
  collapsed: boolean;
}

export default function Sidebar({
  sessions,
  currentSession,
  onNewSession,
  onLoadSession,
  onDeleteSession,
  onArchiveSession,
  onShareSession,
  onRenameSession,
  onToggleSidebar,
  onShowSettings,
  collapsed
}: SidebarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [renameSessionId, setRenameSessionId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showArchived ? session.status === 'archived' : session.status === 'active';
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRename = (sessionId: string, currentTitle: string) => {
    setRenameSessionId(sessionId);
    setRenameTitle(currentTitle);
  };

  const submitRename = () => {
    if (renameSessionId && renameTitle.trim()) {
      onRenameSession(renameSessionId, renameTitle.trim());
      setRenameSessionId(null);
      setRenameTitle('');
      toast.success('Session renamed successfully');
    }
  };

  const handleShare = async (sessionId: string) => {
    try {
      await onShareSession(sessionId);
      toast.success('Session shared! Link copied to clipboard');
    } catch (error) {
      toast.error('Failed to share session');
    }
  };

  if (collapsed) {
    return (
      <div className="bg-body-secondary border-end d-flex flex-column position-relative" 
           style={{ width: '60px', height: '100vh' }}>
        <div className="p-2 border-bottom text-center">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={onToggleSidebar}
            className="p-2"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
        
        <div className="p-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onNewSession}
            className="w-100 p-2"
            title="New Session"
          >
            <Plus size={16} />
          </Button>
        </div>

        <div className="flex-grow-1 overflow-auto">
          {filteredSessions.slice(0, 5).map((session) => (
            <div
              key={session._id}
              className={`p-2 cursor-pointer border-bottom ${
                currentSession?._id === session._id ? 'bg-primary bg-opacity-10' : ''
              }`}
              onClick={() => onLoadSession(session._id)}
              title={session.title}
            >
              <div className="text-center">
                <MessageSquare size={16} className="text-muted" />
              </div>
            </div>
          ))}
        </div>

        <div className="border-top p-2 text-center">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={toggleTheme}
            className="p-2 mb-2 w-100"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </Button>
          
          <Dropdown dropup>
            <Dropdown.Toggle
              variant="outline-secondary"
              size="sm"
              className="p-2 w-100"
            >
              <User size={16} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={onShowSettings}>
                <Settings size={14} className="me-2" />
                Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={logout} className="text-danger">
                <LogOut size={14} className="me-2" />
                Sign Out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="bg-body-secondary border-end d-flex flex-column position-relative sidebar-panel custom-scrollbar"
        style={{ width: '320px', height: '100vh', zIndex: 1050 }}
      >
        {/* Header */}
        <div className="p-3 border-bottom">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 text-primary fw-bold">
              AI Generator
            </h5>
            <div className="d-flex gap-1">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={toggleTheme}
                className="p-2"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={onShowSettings}
                className="p-2"
                title="Settings"
              >
                <Settings size={16} />
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={onToggleSidebar}
                className="p-2"
                title="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </Button>
            </div>
          </div>

          <Button
            variant="primary"
            className="w-100 mb-3"
            onClick={onNewSession}
          >
            <Plus size={16} className="me-2" />
            New Session
          </Button>

          {/* Search */}
          <div className="position-relative mb-3">
            <Search 
              size={16} 
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" 
            />
            <Form.Control
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-5"
              size="sm"
            />
          </div>

          {/* Archive Toggle */}
          <div className="d-flex gap-2">
            <Button
              variant={!showArchived ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => setShowArchived(false)}
              className="flex-grow-1"
            >
              Active
            </Button>
            <Button
              variant={showArchived ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => setShowArchived(true)}
              className="flex-grow-1"
            >
              <Archive size={14} className="me-1" />
              Archived
            </Button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-grow-1 overflow-auto custom-scrollbar">
          <AnimatePresence>
            {filteredSessions.length === 0 ? (
              <div className="text-center p-4 text-muted">
                <MessageSquare size={48} className="mb-3 opacity-50" />
                <p>{showArchived ? 'No archived sessions' : 'No sessions found'}</p>
                <p className="small">
                  {showArchived 
                    ? 'Archive sessions to organize your work' 
                    : 'Create a new session to get started'
                  }
                </p>
              </div>
            ) : (
              <ListGroup variant="flush">
                {filteredSessions.map((session) => (
                  <motion.div
                    key={session._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ListGroup.Item
                      action
                      active={currentSession?._id === session._id}
                      onClick={() => onLoadSession(session._id)}
                      className="border-0 py-3 position-relative"
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1 me-2">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <h6 className="mb-0 fw-semibold">
                              {session.title}
                            </h6>
                            {session.isShared && (
                              <Badge bg="success" className="small">
                                <Share2 size={10} className="me-1" />
                                Shared
                              </Badge>
                            )}
                            {session.status === 'archived' && (
                              <Badge bg="secondary" className="small">
                                <Archive size={10} className="me-1" />
                                Archived
                              </Badge>
                            )}
                          </div>
                          
                          {session.description && (
                            <p className="mb-1 small text-muted">
                              {session.description.length > 60
                                ? session.description.substring(0, 60) + '...'
                                : session.description
                              }
                            </p>
                          )}
                          
                          <div className="d-flex align-items-center gap-2 small text-muted">
                            <Calendar size={12} />
                            <span>{formatDate(session.updatedAt)}</span>
                            {session.messageCount > 0 && (
                              <>
                                <span>•</span>
                                <Badge bg="secondary" className="small">
                                  {session.messageCount} messages
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <Dropdown align="end">
                          <Dropdown.Toggle
                            variant="link"
                            className="p-1 text-muted border-0 shadow-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            ⋮
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRename(session._id, session.title);
                              }}
                            >
                              <Edit3 size={14} className="me-2" />
                              Rename
                            </Dropdown.Item>
                            
                            {session.status === 'active' ? (
                              <Dropdown.Item
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onArchiveSession(session._id);
                                }}
                              >
                                <Archive size={14} className="me-2" />
                                Archive
                              </Dropdown.Item>
                            ) : (
                              <Dropdown.Item
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onArchiveSession(session._id);
                                }}
                              >
                                <Archive size={14} className="me-2" />
                                Unarchive
                              </Dropdown.Item>
                            )}
                            
                            <Dropdown.Item
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(session._id);
                              }}
                            >
                              <Share2 size={14} className="me-2" />
                              Share
                            </Dropdown.Item>
                            
                            <Dropdown.Divider />
                            
                            <Dropdown.Item
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session._id);
                              }}
                              className="text-danger"
                            >
                              <Trash2 size={14} className="me-2" />
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </ListGroup.Item>
                  </motion.div>
                ))}
              </ListGroup>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="border-top p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                   style={{ width: '40px', height: '40px' }}>
                <User size={20} className="text-white" />
              </div>
              <div>
                <h6 className="mb-0 fw-semibold">{user?.name}</h6>
                <small className="text-muted">{user?.email}</small>
              </div>
            </div>
            
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                className="p-1 text-muted border-0 shadow-none"
              >
                ⋮
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={onShowSettings}>
                  <Settings size={14} className="me-2" />
                  Settings
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={logout} className="text-danger">
                  <LogOut size={14} className="me-2" />
                  Sign Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Rename Modal */}
      <Modal show={!!renameSessionId} onHide={() => setRenameSessionId(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Rename Session</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Session Title</Form.Label>
            <Form.Control
              type="text"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              placeholder="Enter new title"
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRenameSessionId(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitRename}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}