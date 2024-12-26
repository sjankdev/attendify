import { EducationLevel, Gender, Occupation } from "../../types/Enums";
import { AgendaItemDTO, CreateEventDto } from "../../types/eventTypes";
import { RegisterParticipantDto, RegisterUserDto } from "../../types/userTypes";

export const validateFormOrganizerRegistration = (formData: RegisterUserDto, setError: React.Dispatch<React.SetStateAction<string | null>>): boolean => {
  if (
    !formData.email ||
    !formData.password ||
    !formData.fullName ||
    !formData.companyName ||
    !formData.companyDescription
  ) {
    setError("All fields are required");
    return false;
  }

  if (formData.fullName.length < 8) {
    setError("Full name must be at least 8 characters long");
    return false;
  }

  if (formData.password.length < 8) {
    setError("Password must be at least 8 characters long");
    return false;
  }

  if (formData.companyName.length < 3) {
    setError("Company Name must be at least 3 characters long");
    return false;
  }

  if (formData.companyDescription.length < 10) {
    setError("Company Description must be at least 10 characters long");
    return false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(formData.email)) {
    setError("Invalid email format");
    return false;
  }

  return true;
};


export const validateFormParticipantRegistration = (formData: RegisterParticipantDto, setError: React.Dispatch<React.SetStateAction<string | null>>): boolean => {
  if (
    !formData.name ||
    !formData.email ||
    !formData.password ||
    !formData.token ||
    formData.age === null ||
    formData.yearsOfExperience === null ||
    formData.gender === null ||
    formData.educationLevel === null ||
    formData.occupation === null
  ) {
    setError("All fields are required");
    return false;
  }

  if (formData.name.length < 8) {
    setError("Full Name must be at least 8 characters long");
    return false;
  }

  if (formData.password.length < 8) {
    setError("Password must be at least 8 characters long");
    return false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(formData.email)) {
    setError("Invalid email format");
    return false;
  }

  if (formData.age <= 0 || formData.age < 16) {
    setError("Age must be 16 or above and a positive number");
    return false;
  }
  
  if (formData.yearsOfExperience == null || formData.yearsOfExperience < 0) {
    setError("Years of Experience cannot be negative or null");
    return false;
  }

  if (!formData.token) {
    setError("Token cannot be empty");
    return false;
  }

  if (!Object.values(Gender).includes(formData.gender)) {
    setError("Invalid gender selection");
    return false;
  }

  if (!Object.values(EducationLevel).includes(formData.educationLevel)) {
    setError("Invalid education level selection");
    return false;
  }

  if (!Object.values(Occupation).includes(formData.occupation)) {
    setError("Invalid occupation selection");
    return false;
  }

  return true;
};

export const validateEventForm = (
  formData: CreateEventDto,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  agendaItems: AgendaItemDTO[],  
  isAttendeeLimitChecked: boolean,
  attendeeLimit: number | null,
  eventStartDate: string,
  eventEndDate: string,
  joinDeadline: string | null
): boolean => {
  if (!formData.name || formData.name.length < 10) {
    setError("Event name must be at least 10 characters long.");
    return false;
  }

  if (!formData.description || formData.description.length < 50) {
    setError("Description must be at least 50 characters long.");
    return false;
  }

  if (!formData.location || formData.location.length < 5) {
    setError("Location must be at least 5 characters long.");
    return false;
  }

  if (formData.attendeeLimit !== null && formData.attendeeLimit < 1) {
    setError("Attendee limit must be at least 1.");
    return false;
  }

  if (!formData.organizerId) {
    setError("Organizer ID is required.");
    return false;
  }

  if (!eventStartDate || !eventEndDate) {
    setError("Event start and end dates are required.");
    return false;
  }

  if (joinDeadline === null || joinDeadline.trim() === "") {
    setError("Join deadline is required.");
    return false;
  }

  const validateDates = (): boolean => {
    const errors: string[] = [];
    const eventStart = new Date(eventStartDate);
    const eventEnd = new Date(eventEndDate);
    const join = new Date(joinDeadline);  

    if (isAttendeeLimitChecked && (attendeeLimit === null || attendeeLimit < 1)) {
      errors.push("Attendee limit must be at least 1.");
    }

    if (isNaN(eventStart.getTime()) || isNaN(eventEnd.getTime())) {
      errors.push("Invalid event start or end date.");
    } else if (eventStart >= eventEnd) {
      errors.push("Event start date must be before the event end date.");
    }

    if (isNaN(join.getTime())) {
      errors.push("Invalid join deadline.");
    } else if (join >= eventStart) {
      errors.push("Join deadline must be before the event start date.");
    }

    agendaItems.forEach((item, index) => {
      const start = new Date(item.startTime);
      const end = new Date(item.endTime);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        errors.push(`Agenda item ${index + 1}: Invalid start or end time.`);
      } else {
        if (start < eventStart || end > eventEnd) {
          errors.push(
            `Agenda item ${index + 1}: Times must be within event duration.`
          );
        }

        if (start >= end) {
          errors.push(
            `Agenda item ${index + 1}: Start time must be before end time.`
          );
        }
      }
    });

    setError(errors.length > 0 ? errors[0] : null);
    return errors.length === 0;
  };

  return validateDates();
};