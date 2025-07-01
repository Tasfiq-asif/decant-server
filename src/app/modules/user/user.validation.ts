import { z } from "zod";
import { USER_ROLE, USER_STATUS } from "../../constants";

const createUserValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .min(1, "Name cannot be empty")
      .max(50, "Name cannot exceed 50 characters"),
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email format"),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(6, "Password must be at least 6 characters long")
      .max(20, "Password cannot exceed 20 characters"),
    role: z
      .enum([USER_ROLE.USER, USER_ROLE.ADMIN] as [string, ...string[]], {
        required_error: "Role is required",
      })
      .default(USER_ROLE.USER),
    status: z
      .enum(
        [USER_STATUS.ACTIVE, USER_STATUS.BLOCKED] as [string, ...string[]],
        {
          required_error: "Status is required",
        }
      )
      .default(USER_STATUS.ACTIVE),
    profileImg: z.string().url("Invalid profile image URL").optional(),
  }),
});

const updateUserValidationSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "User ID is required",
      })
      .min(1, "User ID cannot be empty"),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, "Name cannot be empty")
      .max(50, "Name cannot exceed 50 characters")
      .optional(),
    email: z.string().email("Invalid email format").optional(),
    role: z
      .enum([USER_ROLE.USER, USER_ROLE.ADMIN] as [string, ...string[]])
      .optional(),
    status: z
      .enum([USER_STATUS.ACTIVE, USER_STATUS.BLOCKED] as [string, ...string[]])
      .optional(),
    profileImg: z.string().url("Invalid profile image URL").optional(),
  }),
});

const getUserByIdValidationSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "User ID is required",
      })
      .min(1, "User ID cannot be empty"),
  }),
});

const updateUserRoleValidationSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "User ID is required",
      })
      .min(1, "User ID cannot be empty"),
  }),
  body: z.object({
    role: z.enum([USER_ROLE.USER, USER_ROLE.ADMIN] as [string, ...string[]], {
      required_error: "Role is required",
    }),
  }),
});

const deleteUserValidationSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "User ID is required",
      })
      .min(1, "User ID cannot be empty"),
  }),
});

const updateProfileValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Name cannot be empty")
      .max(50, "Name cannot exceed 50 characters")
      .optional(),
    email: z.string().email("Invalid email format").optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    address: z
      .object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
      })
      .optional(),
    profileImg: z.string().url("Invalid profile image URL").optional(),
  }),
});

export const UserValidation = {
  createUserValidationSchema,
  updateUserValidationSchema,
  updateUserRoleValidationSchema,
  getUserByIdValidationSchema,
  deleteUserValidationSchema,
  updateProfileValidationSchema,
};
