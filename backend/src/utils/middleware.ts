import logger from "./logger";
import type { Request, Response, NextFunction } from "express";

export function log(req: Request, res: Response, next: NextFunction) {
  logger.info(`${req.method} - ${req.route}`);
  next();
}
