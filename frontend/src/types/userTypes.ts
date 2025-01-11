import { EducationLevel, Gender, Occupation } from "./Enums";

export interface RegisterUserDto {
  email: string;
  password: string;
  fullName: string;
  role: string;
  companyName: string;
  companyDescription: string;
  departmentNames: string[]; 
}

  export interface RegisterParticipantDto {
    name: string;
    email: string;
    password: string;
    token: string;
    age: number | null;
    yearsOfExperience: number | null;
    gender: Gender | null; 
    educationLevel: EducationLevel | null;
    occupation: Occupation | null; 
  }
  