import z from "zod";

export const transformChannelName = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric chars with dash
    .replace(/-+/g, "-") // collapse multiple dashes
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
};

export const channelNameSchema = z.object({
  name: z
    .string()
    .min(2, "Channel must be at least 2 characters")
    .max(50, "Channel must be at most 50 characters")
    .transform((name, ctx) => {
      const transformed = transformChannelName(name);
      if (transformed.length < 2) {
        ctx.addIssue({
          code: "custom",
          message:
            "Channel name must contain at least 2 characters after formatting",
        });
        return z.NEVER;
      }
      return transformed;
    }),
});
export type ChannelFormData = z.infer<typeof channelNameSchema>;
