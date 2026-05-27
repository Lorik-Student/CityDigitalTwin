import pg  from '../db'
import type { City, CityProfile } from "@shared/api-types/data-points"
import { v4 as uuidv4 } from 'uuid'
import { toCamelCase } from '../db'
import type { UUID } from "@shared/api-types"

export async function getAllCityProfiles(): Promise<CityProfile[]> { 
    const query = `SELECT   uuid, name, lat, lng,
                            weather_condition, population, area
                            FROM Cities
                        `
    const { rows } = await pg.query<CityProfile>(query);
    return rows.map(toCamelCase<CityProfile>);
}

export async function getCityProfile(uuid: UUID): Promise<CityProfile> { 
    const query = `SELECT   uuid, name, lat, lng,
                            weather_condition, population, area
                            FROM Cities
                            WHERE uuid = $1
                        `
    const { rows } = await pg.query<CityProfile>(query, [uuid]);
    return toCamelCase<CityProfile>(rows[0]);
}

export async function getAllCities(): Promise<City[]> {
    const query = `SELECT * FROM Cities`;
    const { rows }  =  await pg.query<City>(query);
    return rows.map(toCamelCase<City>);

}

export async function getCity(uuid: UUID) {
    const query =  `SELECT * FROM Cities WHERE uuid = $1`;
    const { rows } = await pg.query<City>(query, [uuid]);
    return toCamelCase<City>(rows[0]);
}
