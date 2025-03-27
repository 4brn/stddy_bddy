export const corsConfig = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
};

export const port = process.env.PORT || 1337;
