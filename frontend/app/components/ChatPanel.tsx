'use client';

import { useState, useRef, useEffect } from 'react';
import { Form, Button, Card, Badge, Spinner, Modal } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Copy, Download, RefreshCw, Paperclip, X, Image, FileText } from 'lucide-react';
import { Session, Message } from '../types';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string, attachments?: any[]) => void;
  loading: boolean;
  currentSession: Session | null;
  onAuthRequired: () => boolean;
}

export default function ChatPanel({
  messages,
  onSendMessage,
  loading,
  currentSession,
  onAuthRequired
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!onAuthRequired()) {
      return;
    }
    
    if ((!input.trim() && attachments.length === 0) || loading) return;

    onSendMessage(input.trim(), attachments);
    setInput('');
    setAttachments([]);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAttachments(prev => [...prev, ...response.data.files]);
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatTimestamp = (timestamp: Date | string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <Image size={16} />;
    return <FileText size={16} />;
  };

  return (
    <div className="d-flex flex-column h-100 bg-body">
      {/* Header */}
      <div className="border-bottom p-3 bg-body-secondary">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-0 fw-semibold">
              {currentSession?.title || 'Select a session'}
            </h6>
            {currentSession && (
              <small className="text-muted">
                {messages.length} messages
              </small>
            )}
          </div>
          {currentSession && (
            <Badge bg="success" className="small">
              Active
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow-1 overflow-auto p-3 custom-scrollbar">
        {!currentSession ? (
          <div className="text-center text-muted py-5">
            <Bot size={48} className="mb-3 opacity-50" />
            <h5>Welcome to AI Component Generator</h5>
            <p>Create a new session to start generating React components with AI assistance.</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted py-5">
            <Bot size={48} className="mb-3 opacity-50" />
            <h5>Start a conversation</h5>
            <p>Describe the React component you'd like to create.</p>
            <div className="mt-4">
              <p className="small fw-semibold mb-2">Try these examples:</p>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setInput('Create a modern pricing card with three tiers')}
                >
                  Pricing Card
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setInput('Build a responsive navigation bar with dropdown menus')}
                >
                  Navigation Bar
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setInput('Design a contact form with validation')}
                >
                  Contact Form
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <div className={`d-flex ${message.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div className={`d-flex gap-3 max-w-75 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                      message.role === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-success text-white'
                    }`} style={{ width: '32px', height: '32px', minWidth: '32px' }}>
                      {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>

                    {/* Message Content */}
                    <div className={`${message.role === 'user' ? 'text-end' : ''}`}>
                      <Card className={`border-0 shadow-sm ${
                        message.role === 'user' 
                          ? 'bg-primary text-white' 
                          : 'bg-body-secondary'
                      }`}>
                        <Card.Body className="p-3">
                          <div className="mb-2">
                            {message.content}
                          </div>

                          {message.role === 'assistant' && message.metadata && (
                            <div className="mt-2 d-flex gap-2 flex-wrap">
                              <Badge bg="secondary" className="small">
                                {message.metadata.model}
                              </Badge>
                              {message.metadata.language && (
                                <Badge bg="secondary" className="small">
                                  {message.metadata.language.toUpperCase()}
                                </Badge>
                              )}
                              {message.metadata.processingTime && (
                                <Badge bg="secondary" className="small">
                                  {Math.round(message.metadata.processingTime / 1000)}s
                                </Badge>
                              )}
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                      
                      <small className="text-muted mt-1 d-block">
                        {formatTimestamp(message.timestamp)}
                      </small>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="d-flex justify-content-start mb-4"
          >
            <div className="d-flex gap-3">
              <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center"
                   style={{ width: '32px', height: '32px' }}>
                <Bot size={16} />
              </div>
              <Card className="border-0 shadow-sm bg-body-secondary">
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center gap-2">
                    <Spinner animation="border" size="sm" />
                    <span className="loading-dots">Generating component</span>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-top p-3 bg-body-secondary">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3">
            <div className="d-flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="d-flex align-items-center gap-2 bg-primary bg-opacity-10 rounded px-3 py-2">
                  {getFileIcon(file.mimetype)}
                  <span className="small">{file.originalName}</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-danger"
                    onClick={() => removeAttachment(index)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <div className="d-flex gap-2">
            <div className="flex-grow-1">
              <Form.Control
                as="textarea"
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  currentSession 
                    ? "Describe the component you want to create..." 
                    : "Describe what you want to build... (Login required to generate)"
                }
                disabled={loading}
                className="resize-none"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            
            <div className="d-flex gap-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept="image/*,.pdf,.txt,.doc,.docx"
                style={{ display: 'none' }}
              />
              
              <Button
                variant="outline-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || uploading}
                className="px-3"
                style={{ height: '44px' }}
                title="Attach files"
              >
                {uploading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <Paperclip size={16} />
                )}
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                disabled={(!input.trim() && attachments.length === 0) || loading}
                className="px-3"
                style={{ height: '44px' }}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <Send size={16} />
                )}
              </Button>
            </div>
          </div>
        </Form>
        
        <div className="mt-2 text-center">
          <small className="text-muted">
            Press Enter to send, Shift+Enter for new line • Attach images, PDFs, and text files
          </small>
        </div>
      </div>
    </div>
  );
}