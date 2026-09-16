import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';

const INITIAL_FORM_STATE = {
  businessName: '',
  contactPerson: '',
  phone: '',
  email: '',
  type: 'Dental Clinic',
  location: '',
  status: 'New',
};

export default function AddLeadModal({ isOpen, onClose, onAddLead }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  if (!isOpen) return null;

  const handleClose = () => {
    setFormData(INITIAL_FORM_STATE);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.businessName.trim()) return;

    onAddLead({
      id: Date.now(),
      nextFollowUp: 'Upcoming',
      ...formData,
    });

    setFormData(INITIAL_FORM_STATE);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', width: '92%' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} color="var(--primary-blue)" />
            <h3 className="card-heading">Add New Lead</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            <div className="form-group">
              <label className="form-label">Business Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Apex Health Clinic"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dr. Aryan Patel"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. contact@business.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Business Type</label>
                <select
                  className="form-input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Dental Clinic">Dental Clinic</option>
                  <option value="Ambulance services">Ambulance services</option>
                  <option value="IT Services">IT Services</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Retail">Retail</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <select
                  className="form-input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Replied">Replied</option>
                  <option value="Message Ready">Message Ready</option>
                  <option value="No Response">No Response</option>
                  <option value="Interested">Interested</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mumbai, MH"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
