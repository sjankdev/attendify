export interface Participant {
  participantId: number;
  participantName: string;
  participantEmail: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

export interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  eventDate: string;
  eventEndDate: string;
  joinDeadline?: string;
  attendeeLimit?: number;
  joinApproval: boolean;
  participants?: Participant[];
}
