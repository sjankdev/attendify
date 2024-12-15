export interface Participant {
  participantId: number;
  participantName: string;
  participantEmail: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

export interface AgendaItem {
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
  attendeeLimit?: number | null;
  joinApproval: boolean;
  agendaItems: AgendaItem[]; 
  participants?: Participant[];
}
