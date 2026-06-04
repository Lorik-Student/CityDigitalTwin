import express, { type Application } from 'express';
import cors from 'cors';
import 'dotenv/config';
import router from "./router.js";
import errorHandler from "./middlewares/errorHandler.js";


const HOSTNAME = process.env.HOST || 'localhost';
const PORT = Number(process.env.PORT) || 5000;
const DEFAULT_FRONTEND_ORIGINS = ["http://localhost:5173", "http://localhost:5174"];
const CONFIGURED_FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);
const FRONTEND_ORIGINS = new Set([...DEFAULT_FRONTEND_ORIGINS, ...CONFIGURED_FRONTEND_ORIGINS]);
const app: Application = express();

app.use(cors({
  origin(origin, callback) {
    if (!origin || FRONTEND_ORIGINS.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use("/api", router)
app.use(errorHandler);

// app.get('/api/cities', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM cities');
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: 'Database error' });
//   }
// });


app.listen(PORT, async () => {
  console.log(`Server running on http://${HOSTNAME}:${PORT}`);
});
