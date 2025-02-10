import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import routes from "./routes";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(routes);

app.get("/", (_: Request, res: Response) => {
  res.send("Ayo, chill the fuck out yo.");
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
