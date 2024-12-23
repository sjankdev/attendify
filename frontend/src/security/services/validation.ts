import { RegisterUserDto } from "../../types/userTypes";

export const validateForm = (formData: RegisterUserDto, setError: React.Dispatch<React.SetStateAction<string | null>>): boolean => {
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
