'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, ButtonGroup, Card, Spinner, Alert } from 'react-bootstrap';
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Maximize2 } from 'lucide-react';

interface PreviewPanelProps {
  code: {
    jsx: string;
    tsx: string;
    css: string;
    preview: string;
  };
  language: 'jsx' | 'tsx';
}

export default function PreviewPanel({ code, language }: PreviewPanelProps) {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const viewportSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      setLoading(true);
      setError(null);
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const generatePreviewHTML = (codeContent: string, css: string) => {
    if (!codeContent) {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Component Preview</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
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
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
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
            ${codeContent}
            
            // Enhanced component detection
            let Component = null;
            
            // Method 1: Look for function declarations
            const functionMatch = \`${codeContent}\`.match(/function\\s+(\\w+)/);
            if (functionMatch) {
              Component = window[functionMatch[1]];
            }
            
            // Method 2: Look for const/let declarations
            if (!Component) {
              const constMatch = \`${codeContent}\`.match(/(?:const|let)\\s+(\\w+)\\s*=/);
              if (constMatch) {
                Component = window[constMatch[1]];
              }
            }
            
            // Method 3: Look for arrow functions
            if (!Component) {
              const arrowMatch = \`${codeContent}\`.match(/const\\s+(\\w+)\\s*=\\s*\\(/);
              if (arrowMatch) {
                Component = window[arrowMatch[1]];
              }
            }
            
            // Method 4: Try to find any function that looks like a component
            if (!Component) {
              const componentNames = Object.keys(window).filter(key => 
                typeof window[key] === 'function' && 
                key !== 'React' && 
                key !== 'ReactDOM' && 
                key !== 'Babel' &&
                key.charAt(0) === key.charAt(0).toUpperCase()
              );
              
              if (componentNames.length > 0) {
                Component = window[componentNames[0]];
              }
            }
            
            if (Component) {
              ReactDOM.render(React.createElement(Component), document.getElementById('root'));
            } else {
              document.getElementById('root').innerHTML = '<div class="alert alert-warning">Component not found. Please check the generated code.</div>';
            }
            
          } catch (error) {
            console.error('Preview error:', error);
            document.getElementById('root').innerHTML = 
              '<div class="alert alert-danger"><strong>Error:</strong> ' + error.message + '</div>';
          }
        </script>
      </body>
      </html>
    `;
  };

  useEffect(() => {
    if (iframeRef.current) {
      setLoading(true);
      setError(null);
      
      const currentCode = code[language] || '';
      const previewHTML = code.preview || generatePreviewHTML(currentCode, code.css);
      const blob = new Blob([previewHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      iframeRef.current.src = url;
      
      const handleLoad = () => {
        setLoading(false);
        URL.revokeObjectURL(url);
      };
      
      const handleError = () => {
        setLoading(false);
        setError('Failed to load preview');
        URL.revokeObjectURL(url);
      };
      
      iframeRef.current.addEventListener('load', handleLoad);
      iframeRef.current.addEventListener('error', handleError);
      
      return () => {
        if (iframeRef.current) {
          iframeRef.current.removeEventListener('load', handleLoad);
          iframeRef.current.removeEventListener('error', handleError);
        }
        URL.revokeObjectURL(url);
      };
    }
  }, [code, language]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`d-flex flex-column h-100 bg-body ${isFullscreen ? 'position-fixed top-0 start-0 w-100 h-100' : ''}`} 
         style={{ zIndex: isFullscreen ? 9999 : 'auto' }}>
      {/* Toolbar */}
      <div className="border-bottom p-3 bg-body-secondary flex-shrink-0">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <ButtonGroup size="sm">
              <Button
                variant={viewport === 'desktop' ? 'primary' : 'outline-secondary'}
                onClick={() => setViewport('desktop')}
              >
                <Monitor size={16} className="me-1" />
                Desktop
              </Button>
              <Button
                variant={viewport === 'tablet' ? 'primary' : 'outline-secondary'}
                onClick={() => setViewport('tablet')}
              >
                <Tablet size={16} className="me-1" />
                Tablet
              </Button>
              <Button
                variant={viewport === 'mobile' ? 'primary' : 'outline-secondary'}
                onClick={() => setViewport('mobile')}
              >
                <Smartphone size={16} className="me-1" />
                Mobile
              </Button>
            </ButtonGroup>
            
            {viewport !== 'desktop' && (
              <small className="text-muted">
                {viewportSizes[viewport].width} × {viewportSizes[viewport].height}
              </small>
            )}
          </div>

          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={refreshPreview}
              disabled={loading}
              title="Refresh preview"
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
            </Button>
            
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <Maximize2 size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3 position-relative overflow-hidden">
        {error ? (
          <Alert variant="danger" className="m-0">
            <strong>Preview Error:</strong> {error}
            <div className="mt-2">
              <Button variant="outline-danger" size="sm" onClick={refreshPreview}>
                <RefreshCw size={16} className="me-1" />
                Retry
              </Button>
            </div>
          </Alert>
        ) : (
          <div 
            className="preview-container position-relative bg-white rounded shadow-sm"
            style={{
              width: viewport === 'desktop' ? '100%' : viewportSizes[viewport].width,
              height: viewport === 'desktop' ? '100%' : viewportSizes[viewport].height,
              maxWidth: '100%',
              maxHeight: '100%',
              overflow: 'hidden'
            }}
          >
            {loading && (
              <div className="position-absolute top-50 start-50 translate-middle">
                <div className="text-center">
                  <Spinner animation="border" className="mb-2" />
                  <div className="small text-muted">Loading preview...</div>
                </div>
              </div>
            )}
            
            <iframe
              ref={iframeRef}
              className="preview-iframe"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                opacity: loading ? 0.5 : 1,
                transition: 'opacity 0.3s ease'
              }}
              sandbox="allow-scripts allow-same-origin"
              title="Component Preview"
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-top px-3 py-2 bg-body-secondary flex-shrink-0">
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            {code[language] ? 'Component rendered successfully' : 'No component to preview'}
          </small>
          <div className="d-flex gap-3">
            {code[language] && (
              <small className="text-muted">
                {code[language].split('\n').length} lines of {language.toUpperCase()}
              </small>
            )}
            <small className="text-muted">
              Viewport: {viewport}
            </small>
          </div>
        </div>
      </div>

      {isFullscreen && (
        <Button
          variant="secondary"
          className="position-absolute top-0 end-0 m-3"
          onClick={toggleFullscreen}
          style={{ zIndex: 10000 }}
        >
          Exit Fullscreen
        </Button>
      )}
    </div>
  );
}