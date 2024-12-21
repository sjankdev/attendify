export interface AgendaItemDTO {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

export interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  eventDate: string;
  eventEndDate: string;
  joinDeadline?: string;
  attendeeLimit: number | null;
  availableSeats: number;
  joinApproval: boolean;
  companyName: string;
  organizerName: string;
  participants: Participant[];
  agendaItems: AgendaItemDTO[];
  pendingRequests: number;
  acceptedParticipants: number;
}


export interface Participant {
  participantId: number;
  participantName: string;
  participantEmail: string;
  status: string;
  joinedEventCount: number; 
  eventLinks: string[];    
}

export interface EventStatistics {
  averageAge: number | null;
  highestAge: number | null;
  lowestAge: number | null;
  maleCount: number;
  femaleCount: number;
  otherCount: number;
  averageExperience: number; 
  highestExperience: number;  
  lowestExperience: number;  
  educationLevelStats: Record<string, number>; 
}
