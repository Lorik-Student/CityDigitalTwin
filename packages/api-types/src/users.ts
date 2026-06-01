import z from "zod"

export const userProfileSchema = z.object({
    uuid: z.uuid(),
    name: z.string().trim().min(2).max(20),
    lastName: z.string().trim().min(2).max(20),
    email: z.email().trim().max(255),
    phoneNumber: z.string().trim().max(20).optional(),
    picture: z.url().trim().max(1024).optional()
})

export const userSchema = userProfileSchema.extend({
    password: z.string().min(9).max(255).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,}$/),
    confirmPassword: z.string().min(9).max(255).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,}$/),
    picture: z.url().trim().max(1024).optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    status: z.enum(["ACTIVE", "INACTIVE", "BANNED"])
}).refine((data) => data.password === data.confirmPassword, {
    message: "Fjalëkalimi dhe konfirmimi i fjalëkalimit duhet të përputhen",
})

export const userIdParamsSchema = z.object({
    id: z.uuid()
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type User = z.infer<typeof userSchema>;
export type UserIdParams = z.infer<typeof userIdParamsSchema>;
