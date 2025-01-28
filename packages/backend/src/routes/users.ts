import { db } from "../db";
import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { userTable } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const router = Router();

router.get("/api/users", async (_: Request, res: Response) => {
  const users = await db.select().from(userTable);
  res.send(users);
});

router.post("/api/users", async (req: Request, res: Response) => {
  const { username, password, isAdmin } = req.body;
  if (!username && !password) res.sendStatus(400);

  const hash = await bcrypt.hash(password, 10);

  const user = {
    username,
    password: hash,
    isAdmin: isAdmin || false, // false when isAdmin is missing from body
  };
  await db.insert(userTable).values(user);

  res.send(user);
});

router.put("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, password } = req.body;

  const userId = Number(id);
  if (isNaN(userId)) res.send(400);

  if (!username && !password) res.send(400);

  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId));

  const hash = await bcrypt.hash(password, 10);

  await db
    .update(userTable)
    .set({
      username,
      password: hash,
    })
    .where(eq(userTable.id, userId));
});

router.delete("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Number(id);
  if (isNaN(userId)) res.send(400);

  await db.delete(userTable).where(eq(userTable.id, Number(id)));
  res.send(200);
});

export default router;
