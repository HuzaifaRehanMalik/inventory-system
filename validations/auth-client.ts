import type {
  FieldErrors,
  FieldValues,
  Resolver,
} from "react-hook-form";

const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_CHARACTERS = /^[\p{L}\p{M}' -]+$/u;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,128}$/;

type ValidationErrors<T> = Partial<Record<keyof T, string>>;

type ValidationResult<T> = {
  values: T;
  errors: ValidationErrors<T>;
};

function createResolver<T extends FieldValues>(
  validate: (input: T) => ValidationResult<T>,
): Resolver<T> {
  return (input) => {
    const result = validate(input);
    const errors = Object.fromEntries(
      Object.entries(result.errors)
        .filter((entry): entry is [string, string] => {
          return typeof entry[1] === "string";
        })
        .map(([field, message]) => [
          field,
          { type: "validate", message },
        ]),
    ) as FieldErrors<T>;

    if (Object.keys(errors).length > 0) {
      return { values: {}, errors };
    }

    return { values: result.values, errors: {} };
  };
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function emailError(value: string) {
  if (value.length > 320) {
    return "Email address is too long.";
  }

  if (!EMAIL_PATTERN.test(value)) {
    return "Enter a valid email address.";
  }
}

function nameError(value: string) {
  if (value.length < 2) {
    return "Full name must be at least 2 characters.";
  }

  if (value.length > 100) {
    return "Full name must be at most 100 characters.";
  }

  if (CONTROL_CHARACTERS.test(value)) {
    return "Full name contains invalid characters.";
  }

  if (!NAME_CHARACTERS.test(value)) {
    return "Use letters, spaces, apostrophes, or hyphens only.";
  }
}

function passwordError(value: string) {
  if (value.length < 6) {
    return "Password must be at least 6 characters.";
  }

  if (value.length > 128) {
    return "Password must be at most 128 characters.";
  }

  if (!/[a-z]/.test(value)) {
    return "Include at least one lowercase letter.";
  }

  if (!/[A-Z]/.test(value)) {
    return "Include at least one uppercase letter.";
  }

  if (!/[0-9]/.test(value)) {
    return "Include at least one number.";
  }

  if (!/[^A-Za-z0-9]/.test(value)) {
    return "Include at least one special character.";
  }
}

export type LoginInput = {
  email: string;
  password: string;
  rememberMe: boolean;
  callbackUrl?: string;
};

export const loginResolver = createResolver<LoginInput>((input) => {
  const values = { ...input, email: normalizeEmail(input.email) };
  const errors: ValidationErrors<LoginInput> = {};

  errors.email = emailError(values.email);

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length > 128) {
    errors.password = "Password must be at most 128 characters.";
  }

  if (values.callbackUrl && values.callbackUrl.length > 500) {
    errors.callbackUrl = "Callback URL is too long.";
  }

  return { values, errors };
});

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const registerResolver = createResolver<RegisterInput>((input) => {
  const values = {
    ...input,
    name: input.name.trim(),
    email: normalizeEmail(input.email),
  };
  const errors: ValidationErrors<RegisterInput> = {
    name: nameError(values.name),
    email: emailError(values.email),
    password: passwordError(values.password),
  };

  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return { values, errors };
});

export type ForgotPasswordInput = { email: string };

export const emailResolver = createResolver<ForgotPasswordInput>((input) => {
  const values = { email: normalizeEmail(input.email) };

  return {
    values,
    errors: { email: emailError(values.email) },
  };
});

export type ResetPasswordInput = {
  token: string;
  password: string;
  confirmPassword: string;
};

export const resetPasswordResolver = createResolver<ResetPasswordInput>(
  (input) => {
    const values = { ...input, token: input.token.trim() };
    const errors: ValidationErrors<ResetPasswordInput> = {
      password: passwordError(values.password),
    };

    if (!TOKEN_PATTERN.test(values.token)) {
      errors.token = "Invalid reset link.";
    }

    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    return { values, errors };
  },
);

export type ChangePasswordInput = {
  currentPassword: string;
  password: string;
  confirmPassword: string;
};

export const changePasswordResolver = createResolver<ChangePasswordInput>(
  (values) => {
    const errors: ValidationErrors<ChangePasswordInput> = {
      password: passwordError(values.password),
    };

    if (!values.currentPassword) {
      errors.currentPassword = "Current password is required.";
    } else if (values.currentPassword.length > 128) {
      errors.currentPassword = "Password must be at most 128 characters.";
    }

    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (values.currentPassword === values.password) {
      errors.password =
        errors.password ??
        "New password must be different from the current password.";
    }

    return { values, errors };
  },
);

export type UpdateProfileInput = {
  name: string;
  email: string;
};

export const updateProfileResolver = createResolver<UpdateProfileInput>(
  (input) => {
    const values = {
      name: input.name.trim(),
      email: normalizeEmail(input.email),
    };

    return {
      values,
      errors: {
        name: nameError(values.name),
        email: emailError(values.email),
      },
    };
  },
);
