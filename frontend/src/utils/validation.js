const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const PHONE_E164_RE = /^\+[1-9]\d{1,14}$/;
const PINCODE_RE = /^[1-9]\d{5}$/;
const UPI_RE = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/;

export const isEmail = (value) => EMAIL_RE.test(value ?? '');
export const isPhone = (value) => PHONE_RE.test((value ?? '').replace(/\s+/g, ''));
export const isE164Phone = (value) => PHONE_E164_RE.test((value ?? '').replace(/\s+/g, ''));
export const isPincode = (value) => PINCODE_RE.test(value ?? '');
export const isUpi = (value) => UPI_RE.test(value ?? '');

export function required(value, label = 'field') {
  return value && String(value).trim().length > 0 ? null : `${label} is required`;
}

export function validateEmail(value, label = 'Email') {
  if (!value || !isEmail(value)) return `${label} is invalid`;
  return null;
}

export function validatePhone(value, label = 'Phone number') {
  if (!value || !isPhone(value)) return `${label} must be 10 digits starting with 6-9`;
  return null;
}

export function validatePhoneE164(value, label = 'Phone number') {
  if (!value || !isE164Phone(value)) return `${label} must be in international format, e.g. +919876543210`;
  return null;
}

export function validatePincode(value, label = 'Pincode') {
  if (!value || !isPincode(value)) return `${label} must be a valid 6-digit pin`;
  return null;
}

export function validatePositiveNumber(value, label = 'Value') {
  const num = Number(value);
  if (value == null || value === '' || Number.isNaN(num) || num <= 0) {
    return `${label} must be a positive number`;
  }
  return null;
}

export function validatePassword(value, label = 'Password') {
  if (!value) return `${label} is required`;
  if (value.length < 8) return `${label} must be at least 8 characters`;
  if (!/[A-Za-z]/.test(value)) return `${label} must include at least one letter`;
  if (!/\d/.test(value)) return `${label} must include at least one number`;
  return null;
}

export function getPasswordStrength(value) {
  const v = value ?? '';
  if (!v) return { score: 0, label: '' };
  let score = 0;
  if (v.length >= 8) score += 1;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score += 1;
  if (/\d/.test(v)) score += 1;
  if (/[^A-Za-z0-9]/.test(v)) score += 1;
  const label = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong';
  return { score, label };
}

export function validateConfirmPassword(value, password, label = 'Confirm password') {
  if (!value) return `${label} is required`;
  if (value !== password) return `${label} does not match`;
  return null;
}

export function validateForm(values, rules) {
  const errors = {};
  Object.keys(rules).forEach((field) => {
    const error = rules[field](values[field], values);
    if (error) errors[field] = error;
  });
  return errors;
}