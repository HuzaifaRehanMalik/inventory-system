import { z } from "zod";

const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;
const NAME_CHARACTERS = /^[\p{L}\p{M}' -]+$/u;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,128}$/;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(320, "Email address is too long.")
  .email("Enter a valid email address.");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Full name must be at least 2 characters.")
  .max(100, "Full name must be at most 100 characters.")
  .refine((value) => !CONTROL_CHARACTERS.test(value), "Full name contains invalid characters.")
  .refine((value) => NAME_CHARACTERS.test(value), "Use letters, spaces, apostrophes, or hyphens only.");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters.")
  .max(128, "Password must be at most 128 characters.")
  .regex(/[a-z]/, "Include at least one lowercase letter.")
  .regex(/[A-Z]/, "Include at least one uppercase letter.")
  .regex(/[0-9]/, "Include at least one number.")
  .regex(/[^A-Za-z0-9]/, "Include at least one special character.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required.").max(128),
  rememberMe: z.boolean(),
  callbackUrl: z.string().max(500).optional(),
});

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().regex(TOKEN_PATTERN, "Invalid reset link."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required.").max(128),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.password, {
    message: "New password must be different from the current password.",
    path: ["password"],
  });

export const tokenSchema = z.object({
  token: z.string().trim().regex(TOKEN_PATTERN, "Invalid or malformed token."),
});

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

export const updateProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
