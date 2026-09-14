import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Check } from 'lucide-react';
import { aiAPI } from '../services/api';

export default function AiMessageModal({ isOpen, onClose, onShowToast, targetLead = null, initialLeadName = '' }) {
  const [leadName, setLeadName] = useState('Dr. Mahale Dental Clinic');
  const [goal, setGoal] = useState('Website Redesign Pitch');
  const [tone, setTone] = useState('Professional & Friendly');
  const [generatedMsg, setGeneratedMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (targetLead?.businessName) {
      setLeadName(targetLead.businessName);
      setGeneratedMsg('');
    } else if (initialLeadName) {
      setLeadName(initialLeadName);
      setGeneratedMsg('');
    }
  }, [targetLead, initialLeadName, isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.generateMessage({ leadName, goal, tone });
      if (res.data && res.data.message) {
        setGeneratedMsg(res.data.message);
      }
    } catch (err) {
      // Fallback
      setGeneratedMsg(
        `Hi ${leadName} team,\n\nI was reviewing your online presence and spotted several quick tweaks to speed up mobile loading and boost appointment bookings by 25-35%.\n\nI built a free interactive demo showing how patients can book appointments with zero friction. Would you like me to send you the link?\n\nBest regards,\nSahil Khan`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMsg);
    setCopied(true);
    if (onShowToast) onShowToast('AI message copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#8b5cf6" />
            <h3 className="card-heading">Generate AI Message</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Target Lead / Business</label>
            <input
              type="text"
              className="form-input"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Outreach Goal</label>
            <select
              className="form-input"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            >
              <option value="Website Redesign Pitch">Website Redesign Pitch</option>
              <option value="SEO & Local Ranking Improvement">SEO & Local Ranking Improvement</option>
              <option value="Quick Demo Offer">Quick Demo Offer</option>
              <option value="Follow-up after no response">Follow-up after no response</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tone</label>
            <select
              className="form-input"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option value="Professional & Friendly">Professional & Friendly</option>
              <option value="Direct & Value-Focused">Direct & Value-Focused</option>
              <option value="Casual & Conversational">Casual & Conversational</option>
            </select>
          </div>

          <button
            className="btn-primary"
            style={{
              backgroundColor: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onClick={handleGenerate}
            disabled={loading}
          >
            <Sparkles size={16} />
            <span>{loading ? 'Generating...' : 'Generate with AI'}</span>
          </button>

          {generatedMsg && (
            <div className="form-group" style={{ marginTop: '10px' }}>
              <label className="form-label">Generated Outreach</label>
              <div className="template-box" style={{ maxHeight: '130px', margin: 0 }}>
                {generatedMsg}
              </div>
              <button
                className="template-copy-btn"
                onClick={handleCopy}
                style={{ marginTop: '8px' }}
              >
                {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
