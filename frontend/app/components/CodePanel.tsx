'use client';

import { useState } from 'react';
import { Button, ButtonGroup, Card, Alert } from 'react-bootstrap';
import { Copy, Download, FileText, Palette, Package } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../providers/ThemeProvider';
import { useAuth } from '../providers/AuthProvider';
import toast from 'react-hot-toast';
import axios from 'axios';

interface CodePanelProps {
  code: {
    jsx: string;
    tsx: string;
    css: string;
    preview: string;
  };
  language: 'jsx' | 'tsx';
  onLanguageChange: (language: 'jsx' | 'tsx') => void;
}

export default function CodePanel({ code, language, onLanguageChange }: CodePanelProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'code' | 'css'>('code');
  const [downloading, setDownloading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const downloadCode = async () => {
    if (!code.jsx && !code.tsx && !code.css) {
      toast.error('No code to download');
      return;
    }

    setDownloading(true);
    
    try {
      const response = await axios.post('/api/download', {
        jsx: code.jsx,
        tsx: code.tsx,
        css: code.css,
        filename: 'component'
      }, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'component.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Code downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download code');
    } finally {
      setDownloading(false);
    }
  };

  const getCurrentCode = () => {
    if (activeTab === 'css') return code.css;
    if (activeTab === 'jsx') return code.jsx;
    if (activeTab === 'tsx') return code.tsx;
    return '';
  };

  const currentCode = getCurrentCode();
  const currentLanguage = activeTab === 'css' ? 'css' : activeTab;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`d-flex flex-column h-100 bg-body ${isFullscreen ? 'position-fixed top-0 start-0 w-100 h-100' : ''}`}
         style={{ zIndex: isFullscreen ? 9999 : 'auto' }}>
      {/* Toolbar */}
      <div className="border-bottom p-3 bg-body-secondary flex-shrink-0">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-3">
            <ButtonGroup size="sm">
              <Button
                variant={activeTab === 'jsx' ? 'primary' : 'outline-secondary'}
                onClick={() => setActiveTab('jsx')}
              >
                <FileText size={16} className="me-1" />
                JSX
              </Button>
              <Button
                variant={activeTab === 'tsx' ? 'primary' : 'outline-secondary'}
                onClick={() => setActiveTab('tsx')}
              >
                <FileText size={16} className="me-1" />
                TSX
              </Button>
              <Button
                variant={activeTab === 'css' ? 'primary' : 'outline-secondary'}
                onClick={() => setActiveTab('css')}
              >
                <Palette size={16} className="me-1" />
                CSS
              </Button>
            </ButtonGroup>
          </div>

          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <Package size={16} />
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => copyToClipboard(currentCode, activeTab.toUpperCase())}
              disabled={!currentCode}
            >
              <Copy size={16} className="me-1" />
              Copy
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={downloadCode}
              disabled={(!code.jsx && !code.tsx && !code.css) || downloading}
            >
              <Package size={16} className="me-1" />
              {downloading ? 'Downloading...' : 'Download ZIP'}
            </Button>
          </div>
        </div>
      </div>

      {/* Code Display */}
      <div className="flex-grow-1 overflow-auto custom-scrollbar" style={{ height: 'calc(100vh - 200px)' }}>
        {!currentCode ? (
          <div className="d-flex align-items-center justify-content-center h-100">
            <div className="text-center text-muted">
              <FileText size={48} className="mb-3 opacity-50" />
              <h5>No {activeTab.toUpperCase()} Code</h5>
              <p>Generate a component to see the code here</p>
            </div>
          </div>
        ) : (
          <div className="code-panel h-100">
            <SyntaxHighlighter
              language={currentLanguage}
              style={theme === 'dark' ? vscDarkPlus : vs}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: 'transparent',
                fontSize: '14px',
                lineHeight: '1.5',
                minHeight: 'calc(100vh - 250px)',
                maxHeight: 'none',
                overflow: 'visible'
              }}
              showLineNumbers
              wrapLongLines
              lineNumberStyle={{
                minWidth: '3em',
                paddingRight: '1em',
                textAlign: 'right',
                userSelect: 'none'
              }}
            >
              {currentCode}
            </SyntaxHighlighter>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-top px-3 py-2 bg-body-secondary flex-shrink-0">
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            {currentCode ? (
              <>
                {currentCode.split('\n').length} lines • {currentCode.length} characters
              </>
            ) : (
              `No ${activeTab.toUpperCase()} code available`
            )}
          </small>
          {currentCode && (
            <div className="d-flex gap-3">
              <small className="text-muted">
                Language: {currentLanguage.toUpperCase()}
              </small>
              <small className="text-muted">
                Tab: {activeTab.toUpperCase()}
              </small>
            </div>
          )}
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