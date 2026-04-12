import React, { createContext, useContext, useReducer, useEffect } from 'react';

const QueueContext = createContext();

const preparers = ['Ingrid', 'Kevin', 'Ruben'];

const loadInitialState = () => {
  try {
    const saved = localStorage.getItem('martinez-walker-queue-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.customers = parsed.customers.map(c => ({
        ...c,
        timestamp: new Date(c.timestamp),
        servedAt: c.servedAt ? new Date(c.servedAt) : null,
      }));
      return parsed;
    }
  } catch (error) {
    console.error('QueueContext: Error loading state from localStorage:', error);
  }
  return {
    customers: [],
    preparers: { Ingrid: null, Kevin: null, Ruben: null },
    nextTicketNumber: 1,
  };
};

const initialState = loadInitialState();

function queueReducer(state, action) {
  switch (action.type) {
    case 'ADD_CUSTOMER': {
      return {
        ...state,
        customers: [...state.customers, action.payload],
        nextTicketNumber: state.nextTicketNumber + 1,
      };
    }

    case 'ASSIGN_TO_PREPARER': {
      const { preparerName } = action.payload;
      const waiting = state.customers.filter(c => !c.served && !c.preparer);
      if (waiting.length === 0) return state;

      const next = waiting[0];
      return {
        ...state,
        customers: state.customers.map(c =>
          c.id === next.id ? { ...c, preparer: preparerName, servedAt: new Date() } : c
        ),
        preparers: { ...state.preparers, [preparerName]: next },
      };
    }

    case 'COMPLETE_SERVICE': {
      const { preparerName, status } = action.payload;
      const current = state.preparers[preparerName];
      if (!current) return state;
      return {
        ...state,
        customers: state.customers.map(c =>
          c.id === current.id ? { ...c, served: true, completionStatus: status, completedAt: new Date() } : c
        ),
        preparers: { ...state.preparers, [preparerName]: null },
      };
    }

    case 'SYNC_FROM_STORAGE':
      return action.payload;

    default:
      return state;
  }
}

export function QueueProvider({ children }) {
  const [state, dispatch] = useReducer(queueReducer, initialState);

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem('martinez-walker-queue-state', JSON.stringify(state));
    } catch (error) {
      console.error('QueueContext: Failed to save to localStorage:', error);
    }
  }, [state]);

  // Cross-tab sync via storage event
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'martinez-walker-queue-state' && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          newState.customers = newState.customers.map(c => ({
            ...c,
            timestamp: new Date(c.timestamp),
            servedAt: c.servedAt ? new Date(c.servedAt) : null,
          }));
          dispatch({ type: 'SYNC_FROM_STORAGE', payload: newState });
        } catch (error) {
          console.error('QueueContext: Error syncing from other tab:', error);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addCustomer = async (customerData) => {
    const newCustomer = {
      ...customerData,
      id: Date.now().toString(),
      ticketNumber: `MWQ-${state.nextTicketNumber.toString().padStart(3, '0')}`,
      timestamp: new Date(),
      position: state.customers.filter(c => !c.served && !c.preparer).length + 1,
      served: false,
      preparer: null,
      servedAt: null,
    };
    dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
    return newCustomer;
  };

  const assignToPreparer = async (preparerName) => {
    dispatch({ type: 'ASSIGN_TO_PREPARER', payload: { preparerName } });
  };

  const completeService = (preparerName, status = 'completed') => {
    dispatch({ type: 'COMPLETE_SERVICE', payload: { preparerName, status } });
  };

  const getEstimatedWaitTime = (position) => position * 15;

  const getWaitingCustomers = () => state.customers.filter(c => !c.served && !c.preparer);

  const getServedCustomers = () => state.customers.filter(c => c.served);

  const getCurrentlyServing = () => Object.values(state.preparers).filter(Boolean);

  const getPreparerList = () => preparers;

  return (
    <QueueContext.Provider value={{
      ...state,
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
