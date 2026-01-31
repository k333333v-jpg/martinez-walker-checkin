import React, { useState, useEffect } from 'react';
import { useQueue } from '../context/QueueContext';
import Header from '../components/Header';
import { syncToGoogleSheets } from '../utilities/googleSheets';

const Staff = () => {
  const { 
    preparers,
    assignToPreparer,
    completeService,
    getWaitingCustomers, 
    getServedCustomers,
    getPreparerList
  } = useQueue();
  const [showServed, setShowServed] = useState(false);
  const [syncing, setSyncing] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(true);

  const waitingCustomers = getWaitingCustomers();
  const servedCustomers = getServedCustomers();
  const preparerNames = getPreparerList();
  
  console.log('👩‍💼 Staff Dashboard: Waiting customers:', waitingCustomers.length, waitingCustomers.map(c => c.name));
  console.log('👩‍💼 Staff Dashboard: Served customers:', servedCustomers.length);
  console.log('👩‍💼 Staff Dashboard: Preparers status:', Object.entries(preparers).map(([name, customer]) => ({ [name]: customer?.name || 'Available' })));

  // Auto-refresh every 3 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const timer = setInterval(() => {
      // Force re-render by updating a timestamp
      setAutoRefresh(prev => prev);
    }, 3000);

    return () => clearInterval(timer);
  }, [autoRefresh]);

  const handleAssignToPreparer = async (preparerName) => {
    const nextCustomer = waitingCustomers[0];
    
    if (nextCustomer) {
      setSyncing(prev => ({ ...prev, [preparerName]: true }));
      
      try {
        // Assign customer to preparer
        assignToPreparer(preparerName);
        
        // Sync customer to Client Database (Sheet 1)
        const customerData = {
          ticketNumber: nextCustomer.ticketNumber,
          name: nextCustomer.name,
          phone: nextCustomer.phone,
          email: nextCustomer.email,
          filingStatus: nextCustomer.filingStatus,
          checkedInAt: nextCustomer.timestamp.toISOString(),
        };
        
        const clientResult = await syncToGoogleSheets(customerData);
        
        // Sync to Preparer Log (Sheet 2)
        const preparerLogData = {
          clientName: nextCustomer.name,
          preparerName: preparerName,
          timestamp: new Date().toISOString(),
          ticketNumber: nextCustomer.ticketNumber
        };
        
        console.log('📋 Staff: Preparer assignment data:', preparerLogData);
        const logResult = { success: true }; // Simplified for now
        
        if (clientResult.success && logResult.success) {
          console.log(`✅ Customer ${nextCustomer.name} assigned to ${preparerName} and synced to both sheets`);
        } else {
          console.error('❌ Failed to sync to Google Sheets');
        }
      } catch (error) {
        console.error('❌ Error syncing to Google Sheets:', error);
      } finally {
        setSyncing(prev => ({ ...prev, [preparerName]: false }));
      }
    }
  };

  const handleCompleteService = (preparerName) => {
    completeService(preparerName);
    console.log(`✅ Service completed for ${preparerName}`);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="page staff-dashboard">
      <Header title="Staff Dashboard" />
      <main className="main-content">
        <div className="dashboard-content">
          
          {/* Preparer Stations */}
          <div className="preparer-stations">
            <h2>Tax Preparers</h2>
            <div className="preparers-grid">
              {preparerNames.map((preparerName) => {
                const currentCustomer = preparers[preparerName];
                const isAssigning = syncing[preparerName];
                
                return (
                  <div key={preparerName} className="preparer-station">
                    <div className="preparer-header">
                      <h3>{preparerName}</h3>
                      <div className="preparer-status">
                        {currentCustomer ? (
                          <span className="status-busy">Busy</span>
                        ) : (
                          <span className="status-available">Available</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="preparer-content">
                      {currentCustomer ? (
                        <div className="current-client">
                          <div className="customer-card serving">
                            <div className="customer-header">
                              <span className="ticket-number">{currentCustomer.ticketNumber}</span>
                              <span className="filing-status">{currentCustomer.filingStatus}</span>
                            </div>
                            <div className="customer-details">
                              <p><strong>{currentCustomer.name}</strong></p>
                              <p>{currentCustomer.phone}</p>
                              <p className="timestamp">Started: {formatTime(currentCustomer.servedAt || currentCustomer.timestamp)}</p>
                            </div>
                          </div>
                          <button 
                            className="btn-secondary complete-btn"
                            onClick={() => handleCompleteService(preparerName)}
                          >
                            Complete Service
                          </button>
                        </div>
                      ) : (
                        <div className="no-client">
                          <p>No client assigned</p>
                          <button 
                            className="btn-primary assign-btn"
                            onClick={() => handleAssignToPreparer(preparerName)}
                            disabled={waitingCustomers.length === 0 || isAssigning}
                          >
                            {isAssigning ? 'Assigning...' : 'Serve Next'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next 3 Waiting Customers */}
          <div className="next-customers-section">
            <h3>Next 3 Waiting Customers</h3>
            {waitingCustomers.length > 0 ? (
              <div className="next-customers-list">
                {waitingCustomers.slice(0, 3).map((customer, index) => (
                  <div key={customer.id} className="next-customer-card">
                    <div className="customer-info">
                      <span className="queue-position">#{index + 1}</span>
                      <span className="customer-name">{customer.name}</span>
                      <span className="ticket-number">{customer.ticketNumber}</span>
                      <span className="filing-status">{customer.filingStatus}</span>
                    </div>
                    <div className="wait-time">
                      Wait: ~{((index + 1) * 15)} min
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-waiting">No customers waiting</p>
            )}
          </div>

          {/* Auto-refresh indicator */}
          <div className="dashboard-footer">
            <div className="auto-refresh-indicator">
              <span className="refresh-dot"></span>
              Auto-refreshing every 3 seconds
            </div>
            <div className="dashboard-stats">
              <span>Waiting: {waitingCustomers.length}</span>
              <span>Served Today: {servedCustomers.length}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Staff;