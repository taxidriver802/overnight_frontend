import { z } from "zod";

export const meUserSchema = z.object({
  id: z.string(),
  employee_id: z.string(),
  name: z.string(),
  role: z.string(),
});

export const loginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  user: meUserSchema,
});

export type MeUser = z.infer<typeof meUserSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
