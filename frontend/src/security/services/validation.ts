import { EducationLevel, Gender, Occupation } from "../../types/Enums";
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
