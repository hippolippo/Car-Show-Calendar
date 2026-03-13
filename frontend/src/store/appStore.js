// T030: Zustand store (user, location, events, rsvps state)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      logout: () => set({ user: null, isAuthenticated: false, rsvps: [] }),
      
      // Location state
      userLocation: null,
      
      setUserLocation: (location) => set({ userLocation: location }),
      
      // Events state
      events: [],
      currentEvent: null,
      eventsLoading: false,
      eventsError: null,
      
      setEvents: (events) => set({ events, eventsLoading: false, eventsError: null }),
      
      setCurrentEvent: (event) => set({ currentEvent: event }),
      
      setEventsLoading: (loading) => set({ eventsLoading: loading }),
      
      setEventsError: (error) => set({ eventsError: error, eventsLoading: false }),
      
      addEvent: (event) => set((state) => ({
        events: [event, ...state.events]
      })),
      
      updateEvent: (eventId, updates) => set((state) => ({
        events: state.events.map(e => e.id === eventId ? { ...e, ...updates } : e),
        currentEvent: state.currentEvent?.id === eventId 
          ? { ...state.currentEvent, ...updates } 
          : state.currentEvent
      })),
      
      removeEvent: (eventId) => set((state) => ({
        events: state.events.filter(e => e.id !== eventId),
        currentEvent: state.currentEvent?.id === eventId ? null : state.currentEvent
      })),
      
      // RSVP state
      rsvps: [], // Array of event IDs user has RSVP'd to
      
      addRsvp: (eventId) => set((state) => ({
        rsvps: [...state.rsvps, eventId]
        // Don't modify rsvpCount here - let the API data be the source of truth
        // The HomePage will refetch events to get updated counts
      })),
      
      removeRsvp: (eventId) => set((state) => ({
        rsvps: state.rsvps.filter(id => id !== eventId)
        // Don't modify rsvpCount here - let the API data be the source of truth
        // The HomePage will refetch events to get updated counts
      })),
      
      setRsvps: (eventIds) => set({ rsvps: eventIds }),
      
      // Sort preferences
      sortBy: 'distance',
      sortWeights: {
        distance: 0.3,
        date: 0.3,
        popularity: 0.2,
        reputation: 0.2
      },
      
      setSortBy: (sortBy) => set({ sortBy }),
      
      setSortWeights: (weights) => set({ sortWeights: weights }),
      
      // Notifications
      unreadNotifications: 0,
      
      setUnreadNotifications: (count) => set({ unreadNotifications: count }),
    }),
    {
      name: 'car-calendar-storage',
      // Only persist auth and preferences, not dynamic data
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        userLocation: state.userLocation,
        rsvps: state.rsvps,
        sortBy: state.sortBy,
        sortWeights: state.sortWeights,
      })
    }
  )
);

export default useAppStore;
