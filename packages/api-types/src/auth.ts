import z from 'zod';

export const loginInfoSchema = z.object({
    email: z.email().trim().max(255),
    password: z.string().min(9).max(255).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,}$/),
})

export const signupInfoSchema = z.object({
    name: z.string().trim().min(2).max(20),
    lastName: z.string().trim().min(2).max(20),
    email: z.email().trim().max(255),
    phoneNumber: z.string().trim().max(20).optional(),
    password: z.string().min(9).max(255).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,}$/),
    confirmPassword: z.string().min(9).max(255).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,}$/)
}).refine((data) => data.password === data.confirmPassword, {
    message: "Fjalëkalimi dhe konfirmimi i fjalëkalimit duhet të përputhen",

}) 

export const authSessionSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string()
})

export type LoginInfo = z.infer<typeof loginInfoSchema>;
export type SignupInfo = z.infer<typeof signupInfoSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;