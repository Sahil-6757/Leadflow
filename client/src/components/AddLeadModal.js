import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AddLeadModal({ isOpen, onClose, onAddLead }) {
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    type: 'Dental Clinic',
    location: '',
    status: 'New',
    nextFollowUp: getDefaultDate(),
    phone: '',
    email: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.businessName.trim()) return;

    onAddLead({
      id: Date.now(),
      ...formData
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="card-heading">Add New Lead</h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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

            <div className="form-group">
              <label className="form-label">Business Type</label>
              <select
                className="form-input"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Dental Clinic">Dental Clinic</option>
                <option value="IT Services">IT Services</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Fitness">Fitness</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Retail">Retail</option>
              </select>
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
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Next Follow-up</label>
              <input
                type="date"
                className="form-input"
                value={formData.nextFollowUp}
                onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
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
