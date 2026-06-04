export * from "./errors.js";
export * from "./data-points.js";
export * from "./users.js";
export * from "./auth.js";
export * from "./weather.js";

export type Id = string & { readonly __brand: "Id" };

export interface Response<T> extends Omit<globalThis.Response, "json"> {
    json: () => Promise<T>;
}
