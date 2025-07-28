'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Code, 
  Eye, 
  Download, 
  Users, 
  Zap, 
  Shield, 
  Palette,
  ArrowRight,
  Play,
  CheckCircle,
  Star
} from 'lucide-react';
import AuthModal from './AuthModal';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const features = [
    {
      icon: <Sparkles className="text-primary" size={32} />,
      title: "AI-Powered Generation",
      description: "Generate React components instantly using advanced AI models like GPT-4, Claude, and Gemini."
    },
    {
      icon: <Eye className="text-success" size={32} />,
      title: "Live Preview",
      description: "See your components come to life with real-time preview across desktop, tablet, and mobile."
    },
    {
      icon: <Code className="text-info" size={32} />,
      title: "Clean Code Export",
      description: "Get production-ready JSX/TSX and CSS code with syntax highlighting and easy export."
    },
    {
      icon: <Palette className="text-warning" size={32} />,
      title: "Interactive Editor",
      description: "Fine-tune your components with visual property editors and real-time modifications."
    },
    {
      icon: <Shield className="text-danger" size={32} />,
      title: "Secure & Private",
      description: "Your code and conversations are encrypted and stored securely with full privacy protection."
    },
    {
      icon: <Zap className="text-purple" size={32} />,
      title: "Lightning Fast",
      description: "Generate and iterate on components in seconds with optimized AI processing."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Frontend Developer",
      company: "TechCorp",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      content: "This platform has revolutionized my development workflow. I can prototype components 10x faster!"
    },
    {
      name: "Mike Rodriguez",
      role: "UI/UX Designer",
      company: "DesignStudio",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      content: "The AI understands design patterns perfectly. It's like having a senior developer as my pair programming partner."
    },
    {
      name: "Emily Johnson",
      role: "Product Manager",
      company: "StartupXYZ",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      content: "Our team's productivity has increased dramatically. We can now validate ideas with working prototypes in minutes."
    }
  ];

  const stats = [
    { number: "50K+", label: "Components Generated" },
    { number: "10K+", label: "Happy Developers" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "AI Availability" }
  ];

  const handleGetStarted = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <div className="landing-page">
        {/* Navigation */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
          <div className="container">
            <motion.a 
              className="navbar-brand d-flex align-items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-primary rounded-circle p-2 me-2">
                <Sparkles className="text-white" size={24} />
              </div>
              <span className="fw-bold fs-4">AI Component Generator</span>
            </motion.a>

            <div className="navbar-nav ms-auto">
              <motion.button
                className="btn btn-outline-primary me-2"
                onClick={() => handleGetStarted('login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
              <motion.button
                className="btn btn-primary"
                onClick={() => handleGetStarted('signup')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
              </motion.button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="hero-section bg-gradient-primary text-white py-5" style={{ marginTop: '76px', minHeight: '100vh' }}>
          <div className="container h-100 d-flex align-items-center">
            <div className="row w-100 align-items-center">
              <div className="col-lg-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 className="display-3 fw-bold mb-4">
                    Generate React Components with 
                    <span className="text-warning"> AI Magic</span>
                  </h1>
                  <p className="lead mb-4 opacity-90">
                    Transform your ideas into production-ready React components instantly. 
                    Chat with AI, see live previews, and export clean code - all in one powerful platform.
                  </p>
                  
                  <div className="d-flex flex-wrap gap-3 mb-4">
                    <motion.button
                      className="btn btn-warning btn-lg px-4 py-3"
                      onClick={() => handleGetStarted('signup')}
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="me-2" size={20} />
                      Start Creating Now
                    </motion.button>
                    <motion.button
                      className="btn btn-outline-light btn-lg px-4 py-3"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Eye className="me-2" size={20} />
                      Watch Demo
                    </motion.button>
                  </div>

                  <div className="d-flex align-items-center gap-4 text-sm opacity-75">
                    <div className="d-flex align-items-center">
                      <CheckCircle size={16} className="me-1" />
                      <span>Free to start</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <CheckCircle size={16} className="me-1" />
                      <span>No credit card required</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <CheckCircle size={16} className="me-1" />
                      <span>Export ready code</span>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div className="col-lg-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-center"
                >
                  <img 
                    src="https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop" 
                    alt="AI Component Generator Interface" 
                    className="img-fluid rounded-4 shadow-lg"
                    style={{ maxHeight: '500px', objectFit: 'cover', width: '100%' }}
                  />
                  <div className="mt-4">
                    <h4 className="fw-bold text-white mb-3">AI-Powered Component Generation</h4>
                    <p className="text-white opacity-90">
                      Experience the future of React development with our intelligent component generator
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-5 bg-white">
          <div className="container">
            <div className="row text-center">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="col-6 col-md-3 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h2 className="display-4 fw-bold text-primary mb-2">{stat.number}</h2>
                  <p className="text-muted mb-0">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section with Image */}
        <section className="py-5 bg-light" id="about">
          <div className="container">
            <motion.div
              className="text-center mb-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="display-4 fw-bold mb-3">About AI Component Generator</h2>
              <p className="lead text-muted">Transform your ideas into production-ready React components with AI assistance</p>
            </motion.div>

            <div className="row align-items-center">
              <div className="col-lg-6">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h3 className="fw-bold mb-4">What is AI Component Generator?</h3>
                  <p className="text-muted mb-4">
                    AI Component Generator is a revolutionary platform that transforms natural language descriptions 
                    into production-ready React components. Simply describe what you want to build, and our advanced 
                    AI models will generate clean, modern JSX/TSX code with CSS styling.
                  </p>
                  
                  <div className="row g-3 mb-4">
                    <div className="col-sm-6">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary rounded-circle p-2 me-3">
                          <Sparkles className="text-white" size={16} />
                        </div>
                        <div>
                          <h6 className="mb-0">AI-Powered</h6>
                          <small className="text-muted">Advanced language models</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="d-flex align-items-center">
                        <div className="bg-success rounded-circle p-2 me-3">
                          <Code className="text-white" size={16} />
                        </div>
                        <div>
                          <h6 className="mb-0">Clean Code</h6>
                          <small className="text-muted">Production-ready output</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="d-flex align-items-center">
                        <div className="bg-info rounded-circle p-2 me-3">
                          <Eye className="text-white" size={16} />
                        </div>
                        <div>
                          <h6 className="mb-0">Live Preview</h6>
                          <small className="text-muted">Real-time rendering</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="d-flex align-items-center">
                        <div className="bg-warning rounded-circle p-2 me-3">
                          <Download className="text-white" size={16} />
                        </div>
                        <div>
                          <h6 className="mb-0">Export Ready</h6>
                          <small className="text-muted">Download complete files</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div className="col-lg-6">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <img 
                    src="https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop" 
                    alt="AI Component Generator Interface" 
                    className="img-fluid rounded-4 shadow-lg"
                    style={{ maxHeight: '400px', objectFit: 'cover' }}
                  />
                  <div className="mt-4">
                    <h5 className="fw-bold text-primary">Online Component Generator</h5>
                    <p className="text-muted">
                      Experience the power of AI-driven component generation with our intuitive interface
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-5 bg-white">
          <div className="container">
            <motion.div
              className="text-center mb-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="display-4 fw-bold mb-3">How It Works</h2>
              <p className="lead text-muted">Get from idea to component in three simple steps</p>
            </motion.div>

            <div className="row align-items-center">
              <div className="col-lg-4">
                <motion.div
                  className="text-center mb-4"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="step-number bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                    <span className="fw-bold fs-4">1</span>
                  </div>
                  <h4 className="fw-bold mb-3">Describe Your Component</h4>
                  <p className="text-muted">Simply chat with our AI and describe what you want to build. Be as detailed or as simple as you like.</p>
                </motion.div>
              </div>

              <div className="col-lg-4">
                <motion.div
                  className="text-center mb-4"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="step-number bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                    <span className="fw-bold fs-4">2</span>
                  </div>
                  <h4 className="fw-bold mb-3">AI Generates Code</h4>
                  <p className="text-muted">Our advanced AI understands your requirements and generates clean, production-ready React code instantly.</p>
                </motion.div>
              </div>

              <div className="col-lg-4">
                <motion.div
                  className="text-center mb-4"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <div className="step-number bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                    <span className="fw-bold fs-4">3</span>
                  </div>
                  <h4 className="fw-bold mb-3">Preview & Export</h4>
                  <p className="text-muted">See your component live, make adjustments, and export the code when you're happy with the result.</p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-5 bg-light">
          <div className="container">
            <motion.div
              className="text-center mb-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="display-4 fw-bold mb-3">What Developers Say</h2>
              <p className="lead text-muted">Join thousands of developers who love our platform</p>
            </motion.div>

            <div className="row g-4">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="col-md-4"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body p-4">
                      <div className="d-flex mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="text-warning" size={16} fill="currentColor" />
                        ))}
                      </div>
                      <p className="card-text mb-4">"{testimonial.content}"</p>
                      <div className="d-flex align-items-center">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="rounded-circle me-3"
                          width="50"
                          height="50"
                        />
                        <div>
                          <h6 className="mb-0 fw-bold">{testimonial.name}</h6>
                          <small className="text-muted">{testimonial.role} at {testimonial.company}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-5 bg-gradient-primary text-white">
          <div className="container text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="display-4 fw-bold mb-4">Ready to Build Amazing Components?</h2>
              <p className="lead mb-4 opacity-90">
                Join thousands of developers who are already creating with AI. Start your journey today!
              </p>
              <motion.button
                className="btn btn-warning btn-lg px-5 py-3 me-3"
                onClick={() => handleGetStarted('signup')}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="me-2" size={20} />
                Get Started Free
              </motion.button>
              <motion.button
                className="btn btn-outline-light btn-lg px-5 py-3"
                onClick={() => handleGetStarted('login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
                <ArrowRight className="ms-2" size={20} />
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-5" style={{ backgroundColor: '#764ba2', color: '#ffffff' }}>
          <div className="container">
            <div className="row">
              <div className="col-lg-4 mb-4">
                <div className="d-flex align-items-center mb-3" style={{ color: '#ffffff' }}>
                  <div className="bg-white bg-opacity-20 rounded-circle p-2 me-2">
                    <Sparkles className="text-white" size={20} />
                  </div>
                  <span className="fw-bold fs-5">AI Component Generator</span>
                </div>
                <p style={{ color: '#e8d5f0', opacity: 0.9 }}>
                  The most powerful AI-driven platform for generating React components. 
                  Build faster, code smarter, and create amazing user interfaces.
                </p>
                
              </div>
              
              <div className="col-lg-2 col-md-6 mb-4">
                <h6 className="fw-bold mb-3">Product</h6>
                <ul className="list-unstyled">
                  <li><a href="#" className="text-decoration-none" style={{ color: '#e8d5f0' }}>Features</a></li>
                  <li><a href="#" className="text-decoration-none" style={{ color: '#e8d5f0' }}>API</a></li>
                  <li><a href="#" className="text-decoration-none" style={{ color: '#e8d5f0' }}>Documentation</a></li>
                  <li><a href="#" className="text-decoration-none" style={{ color: '#e8d5f0' }}>Examples</a></li>
                </ul>
              </div>
              
              <div className="col-lg-2 col-md-6 mb-4">
                <h6 className="fw-bold mb-3">Company</h6>
                <ul className="list-unstyled">
                  <li><a href="#" className="text-decoration-none" style={{ color: '#e8d5f0' }}>About</a></li>
                  <li><a href="#" className="text-decoration-none" style={{ color: '#e8d5f0' }}>Blog</a></li>
                  <li><a href="#" className="text-decoration-none" style={{ color: '#e8d5f0' }}>Contact</a></li>
                  <li><a href="#" className="text-decoration-none" style={{ color: '#e8d5f0' }}>News</a></li>
                </ul>
              </div>
              
              <div className="col-lg-2 col-md-6 mb-4">
                <h6 className="fw-bold mb-3">Support</h6>
                <ul className="list-unstyled">
                  <li><a href="#" className="text-decoration-none" style={{ color: '#e8d5f0' }}>Help Center</a></li>
                  <li><a href="#" className="text-decoration-none" style={{ color: '#e8d5f0' }}>Community</a></li>
                  <li><a href="#" className="text-decoration-none" style={{ color: '#e8d5f0' }}>Tutorials</a></li>
                  <li><a href="#" className="text-decoration-none" style={{ color: '#e8d5f0' }}>FAQ</a></li>
                </ul>
              </div>
              
              <div className="col-lg-2 col-md-6 mb-4">
                <h6 className="fw-bold mb-3">Contact</h6>
                <div className="small" style={{ color: '#e8d5f0' }}>
                  <p className="mb-2">
                    <strong>Developer:</strong><br />
                    Vijay Reddy
                  </p>
                  <p className="mb-2">
                    <strong>Email:</strong><br />
                    <a href="mailto:vijayreddy.0531@gmail.com" style={{ color: '#e8d5f0' }}>
                      vijayreddy.0531@gmail.com
                    </a>
                  </p>
                  <p className="mb-2">
                    <strong>Phone:</strong><br />
                    <a href="tel:+918309716871" style={{ color: '#e8d5f0' }}>
                      +91 8309716871
                    </a>
                  </p>
                  <p className="mb-0">
                    <strong>Address:</strong><br />
                    3/73 Konduru, Pendlimarri Mandalam<br />
                    Kadapa, Andhra Pradesh 516218
                  </p>
                </div>
              </div>
            </div>
            
            <hr className="my-4" style={{ borderColor: '#e8d5f0', opacity: 0.3 }} />
            
            {/* Legal Links */}
            <div className="row mb-4">
              <div className="col-12">
                <h6 className="fw-bold mb-3">Legal & Policies</h6>
                <ul className="list-unstyled">
                  <li className="d-inline me-4">
                    <a href="#" className="text-decoration-none" style={{ color: '#e8d5f0' }}>Privacy Policy</a>
                  </li>
                  <li className="d-inline me-4">
                    <a href="#" className="text-decoration-none" style={{ color: '#e8d5f0' }}>Terms of Service</a>
                  </li>
                  <li className="d-inline me-4">
                    <a href="#" className="text-decoration-none" style={{ color: '#e8d5f0' }}>Cookie Policy</a>
                  </li>
                  <li className="d-inline">
                    <a href="#" className="text-decoration-none" style={{ color: '#e8d5f0' }}>License</a>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="row align-items-center">
              <div className="col-md-6">
                <p className="mb-0" style={{ color: '#e8d5f0', opacity: 0.9 }}>
                  © 2024 AI Component Generator Platform. All rights reserved.
                </p>
                <p className="small mb-0" style={{ color: '#e8d5f0', opacity: 0.8 }}>
                  Developed and maintained by <strong>Vijay Reddy</strong>
                </p>
              </div>
              <div className="col-md-6 text-md-end">
                <p className="mb-0" style={{ color: '#e8d5f0', opacity: 0.9 }}>
                  Made with ❤️ for developers worldwide
                </p>
                <p className="small mb-0" style={{ color: '#e8d5f0', opacity: 0.8 }}>
                  Powered by AI • Built with React & Node.js
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Auth Modal */}
      <AuthModal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        mode={authMode}
        onSwitchMode={setAuthMode}
      />

      <style jsx global>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
        }
        
        .hero-demo-container {
          max-width: 500px;
          margin: 0 auto;
        }
        
        .demo-window {
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
        }
        
        .step-number {
          font-size: 1.5rem;
          font-weight: bold;
        }
        
        .text-purple {
          color: #6f42c1 !important;
        }
        
        .landing-page {
          overflow-x: hidden;
        }
        
        @media (max-width: 768px) {
          .display-3 {
            font-size: 2.5rem;
          }
          
          .hero-demo-container {
            margin-top: 2rem;
          }
        }
      `}</style>
    </>
  );
}