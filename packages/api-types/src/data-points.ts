import z from "zod";

export const cityProfileSchema = z.object({
    uuid: z.uuid(),
    name: z.string().trim().min(2).max(100),
    lat: z.number().refine((val) => val >= -90 && val <= 90, {
        message: "Latitude must be between -90 and 90"
    }),
    lng: z.number().refine((val) => val >= -180 && val <= 180, {
        message: "Longitude must be between -180 and 180"
    }),
    weatherConditions: z.string().trim().max(255).optional(),
    population: z.number().int().nonnegative().optional(),
    area: z.number().positive().optional(),
    
})

export const citySchema = cityProfileSchema.extend({
    createdAt: z.string(),
    updatedAt: z.string()
})

export type CityProfile = z.infer<typeof cityProfileSchema>;
export type City = z.infer<typeof citySchema>;

