import express, { type Request, type Response } from "express";
import routes from "./routes";
import cookieParser from "cookie-parser";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(routes);

app.get("/", (_: Request, res: Response) => {
  res.send("/");
});

app.listen(PORT, () => {
  console.log("Server listening on http://localhost:3000");
});
