import logger from "@/utils/logger";
import type { Request, Response, NextFunction } from "express";

export function log(req: Request, res: Response, next: NextFunction) {
  logger.info(`${req.method} - ${req.url}`);
  next();
}
