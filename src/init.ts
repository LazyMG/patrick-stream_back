import "dotenv/config";
import "./db";
import app from "./server";

const port = 5000;

app.listen(port, "0.0.0.0", () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
