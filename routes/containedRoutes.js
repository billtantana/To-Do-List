import express from "express";
import {
  showList,
  addItem,
  editItem,
  deleteItem,
  newUser,
  dateType,
  addNewUser,
  findUser,
  getItems,
} from "../controller/containedControllers.js";

const router = express.Router();

router.get("/", getItems, showList);

router.get("/new", newUser);

router.post("/add", addItem);

router.post("/edit", editItem);

router.post("/delete", deleteItem);

router.post("/date-type", dateType);

router.post("/new-user", addNewUser);

router.post("/user", findUser);

export default router;
