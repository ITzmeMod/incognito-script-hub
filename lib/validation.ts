import { z } from "zod"

// Script schema for validation
export const scriptSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  link: z.string().url("Must be a valid URL"),
  downloads: z.number().int().nonnegative(),
  category: z.string().min(1, "Category is required"),
  isNew: z.boolean().optional(),
  featured: z.boolean().optional(),
})

// YouTube URL schema
export const youtubeUrlSchema = z.string().url("Must be a valid URL").includes("youtube.com", {
  message: "Must be a YouTube URL",
})

// Validate script data
export function validateScript(data: unknown) {
  try {
    return {
      success: true,
      data: scriptSchema.parse(data),
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }
    return {
      success: false,
      error: "Invalid data",
    }
  }
}

// Sanitize HTML to prevent XSS
export function sanitizeHtml(html: string): string {
  return html.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}
