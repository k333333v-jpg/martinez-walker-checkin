import React, { useState, useEffect } from 'react';
import { useQueue } from '../context/QueueContext';
import Header from '../components/Header';

const Staff = () => {
  const {
    preparers,
    assignToPreparer,
    completeService,
    getWaitingCustomers,
    getServedCustomers,
    getPreparerList,
  } = useQueue();
  const [syncing, setSyncing] = useState({});
  const [, forceRefresh] = useState(0);

  const waitingCustomers = getWaitingCustomers();
  const servedCustomers = getServedCustomers();
  const preparerNames = getPreparerList();

  // Auto-refresh every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => forceRefresh(n => n + 1), 3000);
    return () => clearInterval(timer);
  }, []);

  const handleAssignToPreparer = async (preparerName) => {
    if (waitingCustomers.length === 0) return;
    const nextClient = waitingCustomers[0];

    setSyncing(prev => ({ ...prev, [preparerName]: true }));
    try {
      await assignToPreparer(preparerName);

      // Fire-and-forget log to Service Log tab
      fetch('/api/sheets?action=preparer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preparerName, clientName: nextClient.name }),
      }).catch(() => {});
    } catch (error) {
      console.error('Error assigning customer:', error);
    } finally {
      setSyncing(prev => ({ ...prev, [preparerName]: false }));
    }
  };

  const handleCompleteService = (preparerName) => {
    completeService(preparerName, 'completed');
  };

  const handlePendingService = (preparerName) => {
    completeService(preparerName, 'pending');
  };

  const formatTime = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page staff-dashboard">
      <Header />
      <main className="main-content">
        <div className="dashboard-content">

          {/* Preparer Stations */}
          <section className="preparer-stations">
            <h2 className="section-heading">Tax Preparers</h2>
            <div className="preparers-grid">
              {preparerNames.map((preparerName) => {
                const currentCustomer = preparers[preparerName];
                const isAssigning = syncing[preparerName];
                const isBusy = !!currentCustomer;

                return (
                  <div key={preparerName} className={`preparer-station${isBusy ? ' station-busy' : ' station-available'}`}>
                    <div className="station-top-bar" />
                    <div className="station-header">
                      <h3 className="station-name">{preparerName}</h3>
                      <span className={`status-badge${isBusy ? ' badge-busy' : ' badge-available'}`}>
                        <span className="badge-dot" />
                        {isBusy ? 'Busy' : 'Available'}
                      </span>
                    </div>

                    <div className="station-body">
                      {currentCustomer ? (
                        <>
                          <div className="serving-client-card">
                            <div className="client-ticket">{currentCustomer.ticketNumber}</div>
                            <div className="client-name">{currentCustomer.name}</div>
                            <div className="client-meta">
                              <span className="filing-badge">{currentCustomer.filingStatus}</span>
                              <span className="client-time">Since {formatTime(currentCustomer.servedAt || currentCustomer.timestamp)}</span>
                            </div>
                          </div>
                          <div className="service-actions">
                            <button className="btn-complete" onClick={() => handleCompleteService(preparerName)}>
                              Complete
                            </button>
                            <button className="btn-pending" onClick={() => handlePendingService(preparerName)}>
                              Pending
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="no-client">
                          <div className="no-client-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.35">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                          </div>
                          <p className="no-client-text">No client assigned</p>
                          <button
                            className="btn-serve"
                            onClick={() => handleAssignToPreparer(preparerName)}
                            disabled={waitingCustomers.length === 0 || isAssigning}
                          >
                            {isAssigning ? 'Assigning…' : 'Serve Next'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Queue Preview */}
          <section className="queue-preview-section">
            <h3 className="section-heading-sm">Next in Queue</h3>
            {waitingCustomers.length > 0 ? (
              <div className="queue-preview-row">
                {waitingCustomers.slice(0, 4).map((customer, index) => (
                  <div key={customer.id} className="queue-mini-card">
                    <span className="mini-position">#{index + 1}</span>
                    <span className="mini-name">{customer.name}</span>
                    <span className="mini-ticket">{customer.ticketNumber}</span>
                  </div>
                ))}
                {waitingCustomers.length > 4 && (
                  <div className="queue-mini-card queue-overflow">
                    +{waitingCustomers.length - 4} more
                  </div>
                )}
              </div>
            ) : (
              <p className="no-waiting">No customers currently waiting</p>
            )}
          </section>

          {/* Footer stats */}
          <div className="dashboard-footer">
            <div className="auto-refresh-indicator">
              <span className="refresh-dot" />
              Live — auto-refreshing
            </div>
            <div className="dashboard-stats">
              <span className="stat-pill">Waiting: <strong>{waitingCustomers.length}</strong></span>
              <span className="stat-pill">Served Today: <strong>{servedCustomers.length}</strong></span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Staff;
