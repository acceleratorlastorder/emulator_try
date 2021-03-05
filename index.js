import express, { static } from "express";
const app = express();
const port = 42069;/* only the elite may understand ;) */

app.use("/", static("static"));

app.listen(port, () => {
  console.log(`app started and is listening at http://localhost:${port}`)
})
