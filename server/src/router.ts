import express from "express";
const router = express.Router();

router.get("/server", (req, res) => {
  res.send("server is up and running");
});

export default router;
