import React, { useState, useEffect, useRef } from 'react';
import { useQueue } from '../context/QueueContext';
import Header from '../components/Header';

const CheckIn = () => {
  const { addCustomer, getEstimatedWaitTime } = useQueue();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', filingStatus: 'Individual' });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (!showConfirmation && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showConfirmation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFilingStatus = (status) => {
    setFormData(prev => ({ ...prev, filingStatus: status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const newCustomer = await addCustomer(formData);
      setTicket(newCustomer);
      setShowConfirmation(true);
      setFormData({ name: '', phone: '', email: '', filingStatus: 'Individual' });

      // Fire-and-forget — doesn't block confirmation screen
      fetch('/api/sheets?action=checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustomer.name,
          phone: newCustomer.phone,
          email: newCustomer.email,
        }),
      }).catch(() => {});
    } catch (error) {
      console.error('Error adding customer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewCheckIn = () => {
    setShowConfirmation(false);
    setTicket(null);
  };

  if (showConfirmation && ticket) {
    const estimatedWait = getEstimatedWaitTime(ticket.position);

    return (
      <div className="page">
        <Header hideNav />
        <main className="main-content">
          <div className="confirmation-container">
            <div className="confirmation-card">
              <div className="confirmation-icon">
                <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="26" cy="26" r="26" fill="#16a34a" opacity="0.12" />
                  <circle cx="26" cy="26" r="20" fill="#16a34a" />
                  <path d="M16 26l7 7 13-13" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="confirmation-title">You're checked in!</h2>
              <p className="confirmation-subtitle">We'll call your name when a preparer is ready.</p>

              <div className="ticket-badge">{ticket.ticketNumber}</div>

              <div className="confirmation-stats">
                <div className="stat-item">
                  <span className="stat-value">{ticket.position}</span>
                  <span className="stat-label">Queue Position</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                  <span className="stat-value">~{estimatedWait}m</span>
                  <span className="stat-label">Est. Wait</span>
                </div>
              </div>

              <div className="confirmation-callout">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>Please take a seat — you can track the queue on the waiting room display.</span>
              </div>

              <button className="btn-secondary" onClick={handleNewCheckIn}>
                New Check-in
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Header hideNav />
      <main className="main-content">
        <div className="form-container">
          <div className="form-card">
            <div className="form-header">
              <h2 className="form-title">Welcome</h2>
              <p className="form-subtitle">Please check in below and we'll be with you shortly.</p>
            </div>

            <form onSubmit={handleSubmit} className="check-in-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  ref={nameInputRef}
                  autoComplete="name"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  autoComplete="tel"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  autoComplete="email"
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label>Filing Status</label>
                <div className="filing-toggle">
                  {['Individual', 'Business', 'Other'].map(status => (
                    <button
                      key={status}
                      type="button"
                      className={`filing-option${formData.filingStatus === status ? ' filing-option-active' : ''}`}
                      onClick={() => handleFilingStatus(status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary btn-submit" disabled={submitting}>
                {submitting ? 'Checking in…' : 'Check In'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckIn;
