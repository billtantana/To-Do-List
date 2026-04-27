import express from "express";
import {
  getItems,
  showList,
  addItem,
  editItem,
  deleteItem,
} from "../controller/postgresControllers.js";

const router = express.Router();

router.get("/", getItems, showList);

router.post("/add", addItem);

router.post("/edit", editItem);

router.post("/delete", deleteItem);

export default router;
