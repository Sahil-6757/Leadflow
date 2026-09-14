import React from 'react';
import { Plus } from 'lucide-react';

export default function GreetingBar({ onAddLead, userName = 'Sahil' }) {
  return (
    <div className="greeting-bar">
      <div>
        <h1 className="greeting-title">
          Good evening, {userName}! <span>👋</span>
        </h1>
        <p className="greeting-subtitle">
          Here's what's happening with your leads today.
        </p>
      </div>

      <div className="greeting-right">
        <span className="date-display">Thu, 11 Sep 2026</span>
        <button className="primary-add-btn" onClick={onAddLead}>
          <Plus size={18} strokeWidth={2.5} />
          <span>Add Lead</span>
        </button>
      </div>
    </div>
  );
}
