import { z } from 'zod';

const UserRegisterSchema = z.object({
  body: z.object({
    username_email: z.string().email(),
    name: z.string().min(1),
    password: z.string().min(6),
  }),
});

const UserLoginSchema = z.object({
  body: z.object({
    username_email: z.string().email(),
    password: z.string().min(6),
  }),
});

export default { UserRegisterSchema, UserLoginSchema };