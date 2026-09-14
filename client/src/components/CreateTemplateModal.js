import React, { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';

export default function CreateTemplateModal({
  isOpen,
  onClose,
  onSave,
  template = null,
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Initial Outreach');
  const [content, setContent] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (template) {
      setTitle(template.title || '');
      setCategory(template.category || 'Initial Outreach');
      setContent(template.content || '');
      setIsDefault(template.isDefault || false);
    } else {
      setTitle('');
      setCategory('Initial Outreach');
      setContent('');
      setIsDefault(false);
    }
  }, [template, isOpen]);

  if (!isOpen) return null;

  const insertVariable = (variable) => {
    setContent((prev) => prev + variable);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...(template?.id || template?._id ? { id: template.id || template._id } : {}),
        title: title.trim(),
        category,
        content: content.trim(),
        isDefault,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save template:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--purple-accent)" />
            <h3 className="card-heading">
              {template ? 'Edit Message Template' : 'Create New Template'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            <div className="form-group">
              <label className="form-label">Template Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dental Clinic Outreach (Mobile Speed)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Initial Outreach">Initial Outreach</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Quick Demo Offer">Quick Demo Offer</option>
                <option value="SEO & Audits">SEO & Local Audits</option>
                <option value="Re-engagement">Re-engagement</option>
                <option value="Custom Pitch">Custom Pitch</option>
              </select>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Message Content *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Insert:</span>
                  <button
                    type="button"
                    className="var-chip"
                    onClick={() => insertVariable('{{name}}')}
                    title="Insert recipient name"
                  >
                    {'{{name}}'}
                  </button>
                  <button
                    type="button"
                    className="var-chip"
                    onClick={() => insertVariable('{{businessName}}')}
                    title="Insert business name"
                  >
                    {'{{businessName}}'}
                  </button>
                  <button
                    type="button"
                    className="var-chip"
                    onClick={() => insertVariable('{{senderName}}')}
                    title="Insert your name"
                  >
                    {'{{senderName}}'}
                  </button>
                </div>
              </div>

              <textarea
                className="form-input"
                rows={8}
                placeholder="Write your high-converting outreach message here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                style={{ resize: 'vertical', lineHeight: 1.55 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <input
                type="checkbox"
                id="isDefaultTemplate"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="table-checkbox"
              />
              <label
                htmlFor="isDefaultTemplate"
                style={{ fontSize: '12.5px', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Set as recommended default template
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ backgroundColor: 'var(--purple-accent)' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : template ? 'Update Template' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
