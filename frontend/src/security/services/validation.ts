import { EducationLevel, Gender, Occupation } from "../../types/Enums";
import { AgendaItemDTO, CreateEventDto } from "../../types/eventTypes";
import {
  FieldErrors,
  RegisterParticipantDto,
  RegisterUserDto,
} from "../../types/userTypes";

export const validateFormOrganizerRegistration = (
  formData: RegisterUserDto
): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  if (!formData.email) {
    errors.email = "Email is required";
  } else {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      errors.email = "Invalid email format";
    }
  }

  if (!formData.password) {
    errors.password = "Password is required";
  } else if (formData.password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  }

  if (!formData.fullName) {
    errors.fullName = "Full Name is required";
  } else if (formData.fullName.length < 8) {
    errors.fullName = "Full name must be at least 8 characters long";
  }

  if (!formData.companyName) {
    errors.companyName = "Company Name is required";
  } else if (formData.companyName.length < 3) {
    errors.companyName = "Company Name must be at least 3 characters long";
  }

  if (!formData.companyDescription) {
    errors.companyDescription = "Company Description is required";
  } else if (formData.companyDescription.length < 10) {
    errors.companyDescription =
      "Company Description must be at least 10 characters long";
  }

  if (formData.departmentNames.length === 0) {
    errors.departmentNames = "At least one department is required";
  }

  return errors;
};

export const validateFormParticipantRegistration = (
  formData: RegisterParticipantDto,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setFieldErrors: React.Dispatch<React.SetStateAction<FieldErrors>>
): boolean => {
  setFieldErrors({});

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
    setFieldErrors((prev: FieldErrors) => ({
      ...prev,
      name: "Full Name must be at least 8 characters long",
    }));
    return false;
  }

  if (formData.password.length < 8) {
    setFieldErrors((prev: FieldErrors) => ({
      ...prev,
      password: "Password must be at least 8 characters long",
    }));
    return false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(formData.email)) {
    setFieldErrors((prev: FieldErrors) => ({
      ...prev,
      email: "Invalid email format",
    }));
    return false;
  }

  if (formData.age <= 0 || formData.age < 16) {
    setFieldErrors((prev: FieldErrors) => ({
      ...prev,
      age: "Age must be 16 or above and a positive number",
    }));
    return false;
  }

  if (formData.yearsOfExperience == null || formData.yearsOfExperience < 0) {
    setFieldErrors((prev: FieldErrors) => ({
      ...prev,
      yearsOfExperience: "Years of Experience cannot be negative or null",
    }));
    return false;
  }

  if (!formData.token) {
    setFieldErrors((prev: FieldErrors) => ({
      ...prev,
      token: "Token cannot be empty",
    }));
    return false;
  }

  if (!Object.values(Gender).includes(formData.gender)) {
    setFieldErrors((prev: FieldErrors) => ({
      ...prev,
      gender: "Invalid gender selection",
    }));
    return false;
  }

  if (!Object.values(EducationLevel).includes(formData.educationLevel)) {
    setFieldErrors((prev: FieldErrors) => ({
      ...prev,
      educationLevel: "Invalid education level selection",
    }));
    return false;
  }

  if (!Object.values(Occupation).includes(formData.occupation)) {
    setFieldErrors((prev: FieldErrors) => ({
      ...prev,
      occupation: "Invalid occupation selection",
    }));
    return false;
  }

  return true;
};

export const validateEventForm = (
  formData: CreateEventDto,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  agendaItems: AgendaItemDTO[],
  isAgendaVisible: boolean,
  isAttendeeLimitChecked: boolean,
  attendeeLimit: number | null,
  eventStartDate: string,
  eventEndDate: string,
  joinDeadline: string | null
): boolean => {
  console.log("Validating event form...");
  console.log("Agenda items:", agendaItems);
  console.log("Is agenda visible:", isAgendaVisible);

  if (!formData.name || formData.name.length < 10) {
    console.log("Event name is too short:", formData.name);
    setError("Event name must be at least 10 characters long.");
    return false;
  }

  if (!formData.description || formData.description.length < 50) {
    console.log("Description is too short:", formData.description);
    setError("Description must be at least 50 characters long.");
    return false;
  }

  if (!formData.location || formData.location.length < 5) {
    console.log("Location is too short:", formData.location);
    setError("Location must be at least 5 characters long.");
    return false;
  }

  if (formData.attendeeLimit !== null && formData.attendeeLimit < 1) {
    console.log("Attendee limit is invalid:", formData.attendeeLimit);
    setError("Attendee limit must be at least 1.");
    return false;
  }

  if (!formData.organizerId) {
    console.log("Organizer ID is missing.");
    setError("Organizer ID is required.");
    return false;
  }

  if (!eventStartDate || !eventEndDate) {
    console.log("Event start or end date is missing.");
    setError("Event start and end dates are required.");
    return false;
  }

  if (joinDeadline === null || joinDeadline.trim() === "") {
    console.log("Join deadline is missing or empty.");
    setError("Join deadline is required.");
    return false;
  }

  const validateDates = (): boolean => {
    console.log("Validating event dates...");
    const errors: string[] = [];
    const eventStart = new Date(eventStartDate);
    const eventEnd = new Date(eventEndDate);
    const join = new Date(joinDeadline);

    if (
      isAttendeeLimitChecked &&
      (attendeeLimit === null || attendeeLimit < 1)
    ) {
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

    console.log("Date validation errors:", errors);

    setError(errors.length > 0 ? errors[0] : null);
    return errors.length === 0;
  };

  const validateAgendaItems = (): boolean => {
    if (!isAgendaVisible || agendaItems.length === 0) {
      console.log("No agenda items to validate or agenda not visible.");
      return true;
    }

    console.log("Validating agenda items...");
    const errors: string[] = [];

    const eventStartDateTime = new Date(eventStartDate).getTime();
    const eventEndDateTime = new Date(eventEndDate).getTime();

    for (let i = 0; i < agendaItems.length; i++) {
      const item = agendaItems[i];

      if (!item.title || item.title.trim().length < 10) {
        errors.push(
          `Agenda item ${i + 1}: Title must be at least 10 characters long.`
        );
      }

      if (!item.description || item.description.trim().length < 50) {
        errors.push(
          `Agenda item ${
            i + 1
          }: Description must be at least 50 characters long.`
        );
      }

      const agendaStartTime = new Date(item.startTime).getTime();
      const agendaEndTime = new Date(item.endTime).getTime();

      if (agendaStartTime >= agendaEndTime) {
        errors.push(
          `Agenda item ${i + 1}: Start time must be before end time.`
        );
      }

      if (
        agendaStartTime < eventStartDateTime ||
        agendaEndTime > eventEndDateTime
      ) {
        errors.push(
          `Agenda item ${
            i + 1
          }: Agenda start and end time must be within the event duration.`
        );
      }
    }

    console.log("Agenda validation errors:", errors);

    if (errors.length > 0) {
      setError(errors[0]);
      return false;
    }

    return validateDates();
  };

  return validateDates() && validateAgendaItems();
};
