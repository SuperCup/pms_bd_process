import { create } from 'zustand'
import type { Opportunity, OpportunityFilter } from '@/types'

interface OpportunityState {
  filter: OpportunityFilter
  setFilter: (filter: Partial<OpportunityFilter>) => void
  resetFilter: () => void
  selectedOpportunity: Opportunity | null
  setSelectedOpportunity: (opportunity: Opportunity | null) => void
}

const initialFilter: OpportunityFilter = {
  keyword: undefined,
  year: undefined,
  createTimeStart: undefined,
  createTimeEnd: undefined,
  customerIds: undefined,
  followerIds: undefined,
  status: undefined,
  importance: undefined,
  type: undefined,
}

export const useOpportunityStore = create<OpportunityState>((set) => ({
  filter: initialFilter,
  setFilter: (newFilter) =>
    set((state) => ({
      filter: { ...state.filter, ...newFilter },
    })),
  resetFilter: () => set({ filter: initialFilter }),
  selectedOpportunity: null,
  setSelectedOpportunity: (opportunity) => set({ selectedOpportunity: opportunity }),
}))

