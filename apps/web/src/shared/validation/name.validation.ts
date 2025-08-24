import z from "zod";

export const fullNameSchema = z
  .string()
  .min(2, 'Too short')
  .max(30, 'Max length is 30 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Only letters and spaces allowed')
