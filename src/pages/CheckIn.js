import React, { useState, useEffect, useRef } from 'react';
import { useQueue } from '../context/QueueContext';
import Header from '../components/Header';

const CheckIn = () => {
  const { addCustomer, getEstimatedWaitTime } = useQueue();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    filingStatus: 'Individual'
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [ticket, setTicket] = useState(null);
  const nameInputRef = useRef(null);

  // Auto-focus on first field when page loads
  useEffect(() => {
    if (!showConfirmation && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showConfirmation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('🎫 CheckIn: Submitting form data:', formData);
    const newCustomer = addCustomer(formData);
    console.log('✅ CheckIn: Customer added successfully:', newCustomer);
    setTicket(newCustomer);
    setShowConfirmation(true);
    
    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      filingStatus: 'Individual'
    });
  };

  const handleNewCheckIn = () => {
    setShowConfirmation(false);
    setTicket(null);
  };

  if (showConfirmation && ticket) {
    const estimatedWait = getEstimatedWaitTime(ticket.position);
    
    return (
      <div className="page">
        <Header />
        <main className="main-content">
          <div className="confirmation-container">
            <div className="ticket-receipt">
              <h2>Check-in Confirmation</h2>
              <div className="ticket-info">
                <div className="ticket-number">
                  Ticket #{ticket.ticketNumber}
                </div>
                <div className="customer-details">
                  <p><strong>Name:</strong> {ticket.name}</p>
                  <p><strong>Filing Status:</strong> {ticket.filingStatus}</p>
                  <p><strong>Queue Position:</strong> {ticket.position}</p>
                  <p><strong>Estimated Wait Time:</strong> {estimatedWait} minutes</p>
                </div>
                <div className="instructions">
                  <p>Please have a seat in our waiting area. We'll call you when it's your turn.</p>
                  <p>You can monitor the queue status on our waiting room display.</p>
                </div>
              </div>
              <button 
                className="btn-secondary" 
                onClick={handleNewCheckIn}
              >
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
      <Header title="Client Check-in" />
      <main className="main-content">
        <div className="form-container">
          <form onSubmit={handleSubmit} className="check-in-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
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
              <label htmlFor="phone">Phone Number *</label>
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
              <label htmlFor="email">Email Address *</label>
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
              <label htmlFor="filingStatus">Filing Status *</label>
              <select
                id="filingStatus"
                name="filingStatus"
                value={formData.filingStatus}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="Individual">Individual</option>
                <option value="Business">Business</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button type="submit" className="btn-primary">
              Check In
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CheckIn;