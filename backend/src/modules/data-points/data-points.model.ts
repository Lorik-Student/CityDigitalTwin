import pg  from '../../db.js'
import type { City, CityProfile } from "@shared/api-types/data-points"
import { v4 as uuidv4 } from 'uuid'
import { toCamelCase } from '../../db.js'
import type { UUID } from "@shared/api-types"

export async function getAllCityProfiles(): Promise<CityProfile[]> { 
    const query = `SELECT   id, name, lat, lng,
                            weather_condition, population, area, description
                            FROM Cities
                        `
    const { rows } = await pg.query<CityProfile>(query);
    return rows.map(toCamelCase<CityProfile>);
}

export async function getCityProfile(id: string): Promise<CityProfile> { 
    const query = `SELECT   id, name, lat, lng,
                            weather_condition, population, area, description
                            FROM Cities
                            WHERE id = $1
                        `
    const { rows } = await pg.query<CityProfile>(query, [id]);
    return toCamelCase<CityProfile>(rows[0]);
}

export async function getAllCities(): Promise<City[]> {
    const query = `SELECT * FROM Cities`;
    const { rows }  =  await pg.query<City>(query);
    return rows.map(toCamelCase<City>);

}

export async function getCity(id: string): Promise<City> {
    const query =  `SELECT * FROM Cities WHERE id = $1`;
    const { rows } = await pg.query<City>(query, [id]);
    return toCamelCase<City>(rows[0]);
}
