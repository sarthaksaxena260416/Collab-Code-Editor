'use client';

import MonacoEditor from '@monaco-editor/react';

interface EditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
}

export default function Editor({ code, language, onChange }: EditorProps) {
  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={code}
      theme="vs-dark"
      onChange={(value) => onChange(value || '')}
      options={{
        fontSize: 14,
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        cursorBlinking: 'smooth',
        smoothScrolling: true,
      }}
    />
  );
}