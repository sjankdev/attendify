export interface AgendaItemDTO {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

export interface FeedbackDTO {
  participantName: string;
  rating: number;
  comments: string;
}

export interface FeedbackSummaryDTO {
  feedbacks: FeedbackDTO[];
  averageRating: number;
}

export interface UpcomingEvent {
  id: number;
  name: string;
  eventStartDate: string; 
  eventEndDate: string;
}

export interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  eventStartDate: string;
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
  availableForAllDepartments: boolean; 
  departments: DepartmentDTO[]; 
  feedbacks?: FeedbackDTO[];
}

export interface DepartmentDTO {
  id: number;
  name: string;
  participants: Participant[];
  events: Event[]; 
}

export interface Participant {
  participantId: number;
  participantName: string;
  participantEmail: string;
  status: string;
  joinedEventCount: number;
  eventLinks: string[];
  departmentName: string; 
}

export interface OccupationStatsDTO {
  count: number;
  percentage: number;
}

export interface EventStatistics {
  averageAge: number;
  highestAge: number;
  lowestAge: number;
  maleCount: number;
  femaleCount: number;
  otherCount: number;
  averageExperience: number;
  highestExperience: number;
  lowestExperience: number;
  educationLevelStats: Record<string, OccupationStatsDTO>;
  occupationStats: Record<string, OccupationStatsDTO>; 
  departmentStats: Record<string, number>; 
}

export interface CreateEventDto {
  name: string;
  description: string;
  location: string;
  attendeeLimit: number | null;
  organizerId: number | null;
}