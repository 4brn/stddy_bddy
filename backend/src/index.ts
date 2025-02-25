import { Server } from "http";
import express, { json, urlencoded } from "express";
import cors from "cors";
import cookie from "cookie-parser";
import { log } from "./utils/middleware";
import routes from "@/routes";

import logger from "./utils/logger";

const app = express();

const options = {
  origin: "http://localhost:3000",
  // methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
};

app.use(cors(options));
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cookie());
app.use(log);

app.use("/api", routes);

const server = new Server(app);

const PORT = process.env.PORT || 1337;
server.listen(PORT, () => {
  logger.info(`Listening on http://localhost:${PORT}/`);
});
