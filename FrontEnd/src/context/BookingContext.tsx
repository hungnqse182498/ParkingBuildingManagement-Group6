import { createContext, useContext, type ReactNode } from 'react'

const BookingContext = createContext({})

export function BookingProvider({ children }: { children: ReactNode }) {
  return <BookingContext.Provider value={{}}>{children}</BookingContext.Provider>
}

export function useBooking() {
  return useContext(BookingContext)
}
