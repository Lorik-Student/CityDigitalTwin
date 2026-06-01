import z from "zod";

export const cityProfileSchema = z.object({
    id: z.uuid(),
    name: z.string().trim().min(2).max(100).nonoptional(),
    lat: z.number().refine((val) => val >= -90 && val <= 90, {
        message: "Latitude must be between -90 and 90"
    }),
    lng: z.number().refine((val) => val >= -180 && val <= 180, {
        message: "Longitude must be between -180 and 180"
    }),
    weatherCondition: z.string().trim().max(255).optional(),
    population: z.number().int().nonnegative().optional(),
    area: z.number().positive().optional(),
    description: z.string().min(30).max(1024)
    
})

export const citySchema = cityProfileSchema.extend({
    createdAt: z.string(),
    updatedAt: z.string()
})

export type CityProfile = z.infer<typeof cityProfileSchema>;
export type City = z.infer<typeof citySchema>;

