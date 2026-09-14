import React, { useState } from 'react';
import { Copy, Send, ChevronDown, Check } from 'lucide-react';
import { TEMPLATES } from '../data/mockData';

export default function MessageTemplateCard({ templates, onUseTemplate, onShowToast, onViewAll }) {
  // Normalize templates if coming from MongoDB array [{ title, content }] or mockData object
  const templateMap = React.useMemo(() => {
    if (templates && Array.isArray(templates) && templates.length > 0) {
      const map = {};
      templates.forEach((t) => {
        map[t.title] = t.content;
      });
      return map;
    }
    return TEMPLATES;
  }, [templates]);

  const keys = Object.keys(templateMap);
  const [selectedTemplate, setSelectedTemplate] = useState(keys[0] || 'Initial Outreach (Website Improvement)');
  const [copied, setCopied] = useState(false);

  // Update selected if keys change
  React.useEffect(() => {
    if (!templateMap[selectedTemplate] && keys.length > 0) {
      setSelectedTemplate(keys[0]);
    }
  }, [templateMap, selectedTemplate, keys]);

  const currentText = templateMap[selectedTemplate] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    if (onShowToast) {
      onShowToast('Template copied to clipboard!');
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dashboard-card">
      <div className="card-header-flex">
        <h2 className="card-heading">Message Template</h2>
        <button
          className="card-link-btn"
          onClick={() => {
            if (onViewAll) {
              onViewAll();
            } else if (onShowToast) {
              onShowToast('Showing all templates library...');
            }
          }}
        >
          View All
        </button>
      </div>

      <div className="template-select-wrap">
        <select
          className="template-dropdown"
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
        >
          {Object.keys(TEMPLATES).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'var(--text-light)'
          }}
        />
      </div>

      <div className="template-box">
        {currentText}
      </div>

      <div className="template-actions">
        <button className="template-copy-btn" onClick={handleCopy}>
          {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
        <button
          className="template-use-btn"
          onClick={() => onUseTemplate && onUseTemplate(currentText)}
        >
          <Send size={14} />
          <span>Use Template</span>
        </button>
      </div>
    </div>
  );
}
