import React, { useEffect, useState } from 'react';
import { useQueue } from '../context/QueueContext';
import Header from '../components/Header';

const Waiting = () => {
  const { preparers, getWaitingCustomers, getCurrentlyServing } = useQueue();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 3000); // Auto-refresh every 3 seconds

    return () => clearInterval(timer);
  }, []);

  const waitingCustomers = getWaitingCustomers();
  const upNext = waitingCustomers.slice(0, 5); // Show next 5 customers
  
  console.log('⏳ Waiting Room: Customers in queue:', waitingCustomers.length, waitingCustomers.map(c => c.name));
  console.log('👥 Waiting Room: Currently serving:', Object.values(preparers).filter(c => c !== null).map(c => c?.name));
  const currentlyServing = getCurrentlyServing();

  return (
    <div className="page waiting-room">
      <Header />
      <main className="main-content">
        <div className="waiting-room-content">
          {/* NOW SERVING Display - Simple List */}
          <div className="now-serving-section">
            <h1 className="now-serving-title">NOW SERVING</h1>
            <div className="serving-customers">
              {Object.values(preparers)
                .filter(customer => customer !== null)
                .map((customer, index) => (
                  <div key={customer.id} className="serving-customer-name">
                    {customer.name}
                  </div>
                ))}
              {Object.values(preparers).filter(customer => customer !== null).length === 0 && (
                <div className="serving-customer-name">No one currently being served</div>
              )}
            </div>
          </div>

          {/* NEXT IN QUEUE Section */}
          <div className="next-in-queue-section">
            <h2 className="next-queue-heading">NEXT IN QUEUE:</h2>
            {upNext.length > 0 ? (
              <div className="queue-list-simple">
                {upNext.map((customer, index) => (
                  <div key={customer.id} className="queue-list-item">
                    {index + 1}. {customer.name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-queue-simple">
                <p>No customers currently waiting</p>
              </div>
            )}
          </div>

          {/* Footer with time and refresh indicator */}
          <div className="waiting-room-footer">
            <div className="current-time">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="refresh-indicator">
              Auto-refreshing every 3 seconds
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Waiting;