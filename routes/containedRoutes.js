import express from "express";
import {
  showList,
  addItem,
  editItem,
  deleteItem,
} from "../controller/containedControllers.js";

const router = express.Router();

router.get("/", showList);

router.post("/add", addItem);

router.post("/edit", editItem);

router.post("/delete", deleteItem);

export default router;
