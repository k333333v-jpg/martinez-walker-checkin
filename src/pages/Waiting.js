import React, { useEffect, useState } from 'react';
import { useQueue } from '../context/QueueContext';

const Waiting = () => {
  const { preparers, getWaitingCustomers } = useQueue();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 3000);
    return () => clearInterval(timer);
  }, []);

  const waitingCustomers = getWaitingCustomers();
  const serving = Object.values(preparers).filter(Boolean);
  const upNext = waitingCustomers.slice(0, 6);

  return (
    <div className="waiting-room-page">
      <div className="waiting-brand-bar">
        <span className="waiting-brand-name">Martinez &amp; Walker</span>
        <span className="waiting-brand-tag">Professional Tax Services</span>
      </div>

      <div className="waiting-room-content">
        {/* NOW SERVING */}
        <section className="now-serving-section">
          <h1 className="now-serving-title">NOW SERVING</h1>
          <div className="serving-list">
            {serving.length > 0 ? serving.map((customer) => (
              <div key={customer.id} className="serving-card">
                <div className="serving-accent" />
                <span className="serving-name">{customer.name}</span>
              </div>
            )) : (
              <div className="serving-card serving-empty">
                <div className="serving-accent" />
                <span className="serving-name serving-name-dim">No one currently being served</span>
              </div>
            )}
          </div>
        </section>

        {/* NEXT IN QUEUE */}
        <section className="next-queue-section">
          <h2 className="next-queue-title">NEXT IN QUEUE</h2>
          {upNext.length > 0 ? (
            <ol className="next-queue-list">
              {upNext.map((customer, index) => (
                <li key={customer.id} className="next-queue-item">
                  <span className="queue-num">{index + 1}</span>
                  <span className="queue-name">{customer.name}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="next-queue-empty">No customers currently waiting</p>
          )}
        </section>
      </div>

      <div className="waiting-room-footer">
        <span className="waiting-time">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span className="waiting-footer-brand">Martinez &amp; Walker Tax Services</span>
      </div>
    </div>
  );
};

export default Waiting;
