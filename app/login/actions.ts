"use server";

import { z } from "zod";
import { createSession, deleteSession } from "../lib/session";
import { redirect } from "next/navigation";
import prisma from "../lib/prisma";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .trim(),
});

export async function login(prevState: any, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  const user = await prisma.usuarios.findFirst({
    where: {
      mail: email,
    },
  });

  if (!user || user==undefined) {
    return {
      errors: {
        email: ["Invalid email or password"],
      },
    };
  }

  if (email !== user.mail || password !== user.contrasena) {
    return {
      errors: {
        email: ["Invalid email or password"],
      },
    };
  }

  await createSession(user.id.toString());

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
