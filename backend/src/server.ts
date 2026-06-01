import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import router from "./router.js";
import errorHandler from "./middlewares/errorHandler.js";


const HOSTNAME = process.env.HOST || 'localhost';
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const app: express.Application = express();

app.use(cors({ origin: FRONTEND_ORIGIN }));
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
