import React, { createContext, useContext, useReducer, useEffect } from 'react';
// NO Google Sheets imports - all logging happens directly in components

const QueueContext = createContext();

const preparers = ['Ingrid', 'Kevin', 'Ruben'];

// Load initial state from localStorage if available
const loadInitialState = () => {
  try {
    const savedState = localStorage.getItem('martinez-walker-queue-state');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      // Convert timestamp strings back to Date objects
      parsed.customers = parsed.customers.map(customer => ({
        ...customer,
        timestamp: new Date(customer.timestamp),
        servedAt: customer.servedAt ? new Date(customer.servedAt) : null
      }));
      console.log('📁 QueueContext: Loaded state from localStorage:', {
        customersCount: parsed.customers.length,
        nextTicketNumber: parsed.nextTicketNumber
      });
      return parsed;
    }
  } catch (error) {
    console.error('❌ QueueContext: Error loading state from localStorage:', error);
  }
  
  return {
    customers: [],
    preparers: {
      'Ingrid': null,
      'Kevin': null,
      'Ruben': null
    },
    nextTicketNumber: 1,
  };
};

const initialState = loadInitialState();

function queueReducer(state, action) {
  console.log('🔄 QueueReducer: Action dispatched:', action.type, action.payload);
  console.log('🔄 QueueReducer: State before:', {
    customersCount: state.customers.length,
    nextTicketNumber: state.nextTicketNumber
  });
  
  switch (action.type) {
    case 'ADD_CUSTOMER': {
      // action.payload now contains the complete customer object
      const newCustomer = action.payload;

      const newState = {
        ...state,
        customers: [...state.customers, newCustomer],
        nextTicketNumber: state.nextTicketNumber + 1,
      };
      
      console.log('✅ QueueReducer: New customer added to state:', newCustomer);
      console.log('✅ QueueReducer: State after:', {
        customersCount: newState.customers.length,
        nextTicketNumber: newState.nextTicketNumber,
        allCustomers: newState.customers.map(c => ({ name: c.name, id: c.id, ticketNumber: c.ticketNumber }))
      });

      return newState;
    }

    case 'ASSIGN_TO_PREPARER': {
      const { preparerName } = action.payload;
      const waitingCustomers = state.customers.filter(c => !c.served && !c.preparer);
      if (waitingCustomers.length === 0) return state;

      const nextCustomer = waitingCustomers[0];
      const updatedCustomers = state.customers.map(c =>
        c.id === nextCustomer.id ? { 
          ...c, 
          preparer: preparerName,
          servedAt: new Date()
        } : c
      );

      const updatedPreparers = {
        ...state.preparers,
        [preparerName]: nextCustomer
      };

      return {
        ...state,
        customers: updatedCustomers,
        preparers: updatedPreparers,
      };
    }

    case 'COMPLETE_SERVICE': {
      const { preparerName, status } = action.payload;
      const currentCustomer = state.preparers[preparerName];
      if (!currentCustomer) return state;

      const updatedCustomers = state.customers.map(c =>
        c.id === currentCustomer.id ? { 
          ...c, 
          served: true, 
          completionStatus: status,
          completedAt: new Date()
        } : c
      );

      const updatedPreparers = {
        ...state.preparers,
        [preparerName]: null
      };

      return {
        ...state,
        customers: updatedCustomers,
        preparers: updatedPreparers,
      };
    }

    case 'SYNC_FROM_STORAGE': {
      console.log('📡 QueueReducer: Syncing state from localStorage');
      return action.payload;
    }

    default:
      return state;
  }
}

export function QueueProvider({ children }) {
  const [state, dispatch] = useReducer(queueReducer, initialState);
  
  console.log('🏪 QueueProvider: Provider initialized with state:', {
    customersCount: state.customers.length,
    nextTicketNumber: state.nextTicketNumber,
    preparers: Object.keys(state.preparers)
  });

  // Save state to localStorage and log changes
  useEffect(() => {
    console.log('🔄 QueueProvider: State updated! Current state:', {
      customersCount: state.customers.length,
      waitingCustomers: state.customers.filter(c => !c.served && !c.preparer).length,
      servedCustomers: state.customers.filter(c => c.served).length,
      customers: state.customers.map(c => ({ 
        name: c.name, 
        id: c.id, 
        ticketNumber: c.ticketNumber, 
        served: c.served, 
        preparer: c.preparer 
      }))
    });
    
    // Save to localStorage for cross-tab persistence
    try {
      localStorage.setItem('martinez-walker-queue-state', JSON.stringify(state));
      console.log('💾 QueueProvider: State saved to localStorage');
    } catch (error) {
      console.error('❌ QueueProvider: Failed to save state to localStorage:', error);
    }
  }, [state]);

  // Listen for localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'martinez-walker-queue-state' && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          // Convert timestamp strings back to Date objects
          newState.customers = newState.customers.map(customer => ({
            ...customer,
            timestamp: new Date(customer.timestamp),
            servedAt: customer.servedAt ? new Date(customer.servedAt) : null
          }));
          console.log('📡 QueueProvider: Received state update from another tab');
          // Force re-render by dispatching a sync action
          dispatch({ type: 'SYNC_FROM_STORAGE', payload: newState });
        } catch (error) {
          console.error('❌ QueueProvider: Error syncing from other tab:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);

  const addCustomer = async (customerData) => {
    console.log('🏪 QueueContext: Adding customer to state:', customerData);
    console.log('📊 QueueContext: Current state before add:', {
      totalCustomers: state.customers.length,
      waitingCustomers: state.customers.filter(c => !c.served && !c.preparer).length,
      nextTicketNumber: state.nextTicketNumber
    });
    
    // Create the customer object once for consistency
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
    
    console.log('✅ QueueContext: New customer object created:', newCustomer);
    
    // Dispatch the complete customer object to reducer
    dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
    
    // NO automatic Google Sheets sync - handled separately by CheckIn component
    console.log('✅ Customer added to local state only:', newCustomer.ticketNumber);
    
    return newCustomer;
  };

  const assignToPreparer = async (preparerName) => {
    console.log(`🎯 ASSIGN: ${preparerName} - LOCAL STATE ONLY`);
    const waitingCustomers = state.customers.filter(c => !c.served && !c.preparer);
    if (waitingCustomers.length === 0) {
      console.log(`🎯 NO WAITING CUSTOMERS`);
      return;
    }

    const nextCustomer = waitingCustomers[0];
    
    // ONLY local state update - ZERO Google Sheets calls
    console.log(`🎯 ASSIGNING: ${nextCustomer.ticketNumber} → ${preparerName} (LOCAL ONLY)`);
    dispatch({ type: 'ASSIGN_TO_PREPARER', payload: { preparerName } });
  };

  const completeService = (preparerName, status = 'completed') => {
    // ONLY update local state - NO Google Sheets logging here
    dispatch({ type: 'COMPLETE_SERVICE', payload: { preparerName, status } });
    console.log(`✅ Service ${status} - local state updated only`);
  };

  const getEstimatedWaitTime = (position) => {
    return position * 15; // 15 minutes per customer
  };

  const getWaitingCustomers = () => {
    const waiting = state.customers.filter(c => !c.served && !c.preparer);
    console.log('📋 QueueContext: Getting waiting customers:', waiting.length, waiting.map(c => c.name));
    return waiting;
  };

  const getServedCustomers = () => {
    return state.customers.filter(c => c.served);
  };

  const getCurrentlyServing = () => {
    return Object.values(state.preparers).filter(customer => customer !== null);
  };

  const getPreparerList = () => {
    return preparers;
  };

  return (
    <QueueContext.Provider
      value={{
        ...state,
        addCustomer,
        assignToPreparer,
        completeService,
        getEstimatedWaitTime,
        getWaitingCustomers,
        getServedCustomers,
        getCurrentlyServing,
        getPreparerList,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}