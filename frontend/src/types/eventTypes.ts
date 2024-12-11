export interface Participant {
    participantName: string;
    participantEmail: string;
  }
  
  export interface Event {
    id: number;
    name: string;
    description: string;
    location: string;
    eventDate: string;
    joinDeadline?: string;
    attendeeLimit?: number;
    joinApproval: boolean;
    participants?: Participant[];
  }
  