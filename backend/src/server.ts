import { Server } from "http";
import express, { json, urlencoded } from "express";
import cors from "cors";
import cookie from "cookie-parser";
import { log } from "@/middlewares/log";
import { port, corsConfig } from "config";
import routes from "@/routes";

const app = express();

app.use(cors(corsConfig));
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cookie());
app.use(log);
app.use("/api", routes);

const server = new Server(app);
server.listen(port, () => console.info(`Server on http://localhost:${port}/`));
