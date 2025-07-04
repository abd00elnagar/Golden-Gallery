"use server"

import { z } from "zod";
import { sendContactEmail } from "@/lib/email";

export type State = {
  errors?: {
    name?: string[];
    email?: string[];
    subject?: string[];
    message?: string[];
  };
  message?: string | null;
  success?: boolean;
};

const ContactSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }).max(15, { message: "Name must be 15 characters or less" }),
  email: z.string().email({ message: "Invalid email address" }),
  subject: z.string().min(2, { message: "Subject is required" }).max(30, { message: "Subject must be 30 characters or less" }),
  category: z.string().optional(),
  message: z.string().min(5, { message: "Message is required" }).max(500, { message: "Message must be 500 characters or less" }),
});

export async function contactAction(prevState: State, formData: FormData): Promise<State> {
  const validated = ContactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    category: formData.get("category") || undefined,
    message: formData.get("message"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
      success: false,
    };
  }

  const result = await sendContactEmail(validated.data);
  if (result.success) {
    return {
      message: "Message sent! We'll get back to you within 24 hours.",
      success: true,
    };
  } else {
    return {
      message: result.error || "Failed to send message. Please try again later.",
      success: false,
    };
  }
} 