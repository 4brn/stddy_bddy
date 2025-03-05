import { Server } from "http";
import express, { json, urlencoded } from "express";
import cors from "cors";
import cookie from "cookie-parser";
import { log } from "@/utils/middleware";
import logger from "@/utils/logger";
import routes from "@/routes";

const options = {
  origin: "http://localhost:5173",
  // methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
};

const app = express();

app.use(cors(options));
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cookie());
app.use(log);

app.use("/api", routes);

const PORT = process.env.PORT || 1337;
const server = new Server(app);

server.listen(PORT, () => {
  logger.info(`Server on http://localhost:${PORT}/`);
});
