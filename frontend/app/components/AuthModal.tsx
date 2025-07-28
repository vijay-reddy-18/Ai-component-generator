'use client';

import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner, Nav } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Sparkles, Calendar, Phone, Mail, Lock } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import toast from 'react-hot-toast';

interface AuthModalProps {
  show: boolean;
  onHide: () => void;
}

export default function AuthModal({ show, onHide }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    dateOfBirth: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'login') {
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
      } else {
        await register(formData.email, formData.password, formData.name, {
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth
        });
        toast.success('Account created successfully!');
      }
      onHide();
      setFormData({ email: '', password: '', name: '', phone: '', dateOfBirth: '' });
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      size="md"
      backdrop="static"
      className="auth-modal"
    >
      <Modal.Body className="p-0">
        <div className="row g-0">
          {/* Left Side - Branding */}
          <div className="col-md-5 bg-gradient-primary text-white d-flex align-items-center justify-content-center">
            <div className="text-center p-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                     style={{ width: '80px', height: '80px' }}>
                  <Sparkles size={40} />
                </div>
                <h3 className="fw-bold mb-3">AI Component Generator</h3>
                <p className="opacity-90 mb-0">
                  Transform your ideas into beautiful React components with the power of AI
                </p>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="col-md-7">
            <div className="p-5">
              <div className="text-center mb-4">
                <h4 className="fw-bold text-dark">
                  {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
                </h4>
                <p className="text-muted small">
                  {activeTab === 'login' 
                    ? 'Sign in to continue generating components'
                    : 'Join thousands of developers creating with AI'
                  }
                </p>
              </div>

              {/* Tab Navigation */}
              <Nav variant="pills" className="justify-content-center mb-4">
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'login'}
                    onClick={() => {
                      setActiveTab('login');
                      setError('');
                    }}
                    className="px-4"
                  >
                    Login
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'signup'}
                    onClick={() => {
                      setActiveTab('signup');
                      setError('');
                    }}
                    className="px-4"
                  >
                    Sign Up
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              {error && (
                <Alert variant="danger" className="py-2 small mb-3">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {activeTab === 'signup' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-medium">
                        <User size={16} className="me-2" />
                        Full Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                        className="py-2"
                      />
                    </Form.Group>

                    <div className="row">
                      <div className="col-md-6">
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-medium">
                            <Phone size={16} className="me-2" />
                            Phone Number
                          </Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Your phone number"
                            className="py-2"
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-6">
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-medium">
                            <Calendar size={16} className="me-2" />
                            Date of Birth
                          </Form.Label>
                          <Form.Control
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            className="py-2"
                          />
                        </Form.Group>
                      </div>
                    </div>
                  </>
                )}

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-medium">
                    <Mail size={16} className="me-2" />
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-medium">
                    <Lock size={16} className="me-2" />
                    Password
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      required
                      className="py-2 pe-5"
                      minLength={6}
                    />
                    <Button
                      variant="link"
                      className="position-absolute top-50 end-0 translate-middle-y border-0 text-muted p-2"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  {activeTab === 'signup' && (
                    <Form.Text className="text-muted small">
                      Must be at least 6 characters
                    </Form.Text>
                  )}
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 py-2 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      {activeTab === 'login' ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    activeTab === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </Button>

                <div className="text-center">
                  <small className="text-muted">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                  </small>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Modal.Body>

      <style jsx global>{`
        .auth-modal .modal-dialog {
          max-width: 800px;
        }
        
        .auth-modal .modal-content {
          border: none;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          overflow: hidden;
        }
        
        .auth-modal .form-control:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
        
        .auth-modal .nav-pills .nav-link {
          border-radius: 25px;
          font-weight: 500;
        }
        
        .auth-modal .nav-pills .nav-link.active {
          background-color: #0d6efd;
        }
        
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      `}</style>
    </Modal>
  );
}