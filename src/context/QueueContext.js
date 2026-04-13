import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const QueueContext = createContext();

const preparers = ['Ingrid', 'Kevin', 'Ruben'];

export function QueueProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [nextTicketNumber, setNextTicketNumber] = useState(1);

  // Load initial data and subscribe to real-time changes
  useEffect(() => {
    fetchQueue();

    const subscription = supabase
      .channel('queue-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue' }, () => {
        fetchQueue();
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  const fetchQueue = async () => {
    const { data, error } = await supabase
      .from('queue')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching queue:', error);
      return;
    }

    const mapped = data.map(c => ({
      id: c.id,
      ticketNumber: c.ticket_number,
      name: c.name,
      phone: c.phone,
      email: c.email,
      filingStatus: c.filing_status,
      served: c.served,
      preparer: c.preparer,
      servedAt: c.served_at ? new Date(c.served_at) : null,
      completedAt: c.completed_at ? new Date(c.completed_at) : null,
      completionStatus: c.completion_status,
      timestamp: new Date(c.created_at),
    }));

    setCustomers(mapped);

    // Next ticket number = highest number + 1
    if (data.length > 0) {
      const nums = data.map(c => parseInt(c.ticket_number.replace('MWQ-', ''), 10));
      setNextTicketNumber(Math.max(...nums) + 1);
    }
  };

  const addCustomer = async (customerData) => {
    const ticketNumber = `MWQ-${nextTicketNumber.toString().padStart(3, '0')}`;
    const waiting = customers.filter(c => !c.served && !c.preparer);
    const position = waiting.length + 1;

    const { data, error } = await supabase
      .from('queue')
      .insert([{
        ticket_number: ticketNumber,
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        filing_status: customerData.filingStatus,
      }])
      .select()
      .single();

    if (error) throw error;

    const newCustomer = {
      id: data.id,
      ticketNumber,
      name: data.name,
      phone: data.phone,
      email: data.email,
      filingStatus: data.filing_status,
      served: false,
      preparer: null,
      servedAt: null,
      timestamp: new Date(data.created_at),
      position,
    };

    setNextTicketNumber(prev => prev + 1);
    return newCustomer;
  };

  const assignToPreparer = async (preparerName) => {
    const waiting = customers.filter(c => !c.served && !c.preparer);
    if (waiting.length === 0) return;

    const next = waiting[0];
    const { error } = await supabase
      .from('queue')
      .update({ preparer: preparerName, served_at: new Date().toISOString() })
      .eq('id', next.id);

    if (error) console.error('Error assigning preparer:', error);
  };

  const completeService = async (preparerName, status = 'completed') => {
    const current = customers.find(c => c.preparer === preparerName && !c.served);
    if (!current) return;

    const { error } = await supabase
      .from('queue')
      .update({ served: true, completion_status: status, completed_at: new Date().toISOString() })
      .eq('id', current.id);

    if (error) console.error('Error completing service:', error);
  };

  const getEstimatedWaitTime = (position) => position * 15;
  const getWaitingCustomers = () => customers.filter(c => !c.served && !c.preparer);
  const getServedCustomers = () => customers.filter(c => c.served);
  const getCurrentlyServing = () => customers.filter(c => c.preparer && !c.served);
  const getPreparerList = () => preparers;

  // Build preparers map for compatibility
  const preparersMap = {};
  preparers.forEach(p => {
    preparersMap[p] = customers.find(c => c.preparer === p && !c.served) || null;
  });

  return (
    <QueueContext.Provider value={{
      customers,
      preparers: preparersMap,
      nextTicketNumber,
      addCustomer,
      assignToPreparer,
      completeService,
      getEstimatedWaitTime,
      getWaitingCustomers,
      getServedCustomers,
      getCurrentlyServing,
      getPreparerList,
    }}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) throw new Error('useQueue must be used within a QueueProvider');
  return context;
}
