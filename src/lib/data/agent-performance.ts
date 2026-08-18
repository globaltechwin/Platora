export interface AgentPerformance {
  id: string;
  agentCode: string;
  agentName: string;
  bookings: number;
  value: number;
  commission: number;
  pendingCommission: number;
}

export const mockAgentPerformance: AgentPerformance[] = [
  {
    id: "1",
    agentCode: "SIV0001",
    agentName: "Siva",
    bookings: 1,
    value: 1040000,
    commission: 0,
    pendingCommission: 0,
  },
];
