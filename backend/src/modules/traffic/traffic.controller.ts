import type { Request, Response } from "express";
import type { Id } from "@shared/api-types";
import * as TrafficModel from "./traffic.model.js";
import { generateTrafficReadings } from "./traffic.service.js";

export const getTrafficSensors = async (req: Request, res: Response) => {
    const sensors = await TrafficModel.getTrafficSensors(req.params.cityId as Id);
    res.status(200).json(sensors);
};

export const streamTrafficReadings = async (req: Request, res: Response) => {
    const sensors = await TrafficModel.getTrafficSensors(req.params.cityId as Id);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const sendReadings = () => {
        res.write(`event: traffic\n`);
        res.write(`data: ${JSON.stringify(generateTrafficReadings(sensors))}\n\n`);
    };

    sendReadings();
    const intervalId = setInterval(sendReadings, 3000);

    req.on("close", () => {
        clearInterval(intervalId);
        res.end();
    });
};
