import express from "express";
import { query } from "../db/index.js";
import { addWeeks, addMonths } from "date-fns";

const app = express();

const LOW_CONTRAST_COLORS = ["pink", "yellow"];

let listType = "daily";
let listTitle = "Today";
let currentUserId = null;
let currentUser = null;
let errorMessage = null;

function capitalizeFirstLetter(title) {
  if (!title) return "";
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function capitalizeName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/(^|[\s\-\'])\S/g, (match) => match.toUpperCase());
}

function title(type) {
  if (type === "daily") {
    listTitle = "Today";
  } else if (type === "weekly") {
    listTitle = "This Week";
  } else {
    listTitle = "This Month";
  }
}

async function getUsers() {
  try {
    const result = await query("SELECT * FROM users ORDER BY name ASC");

    return result.rows;
  } catch (error) {
    console.log("There was an error looking for users: ", error);
    errorMessage = "There was an error looking for users";
  }
}

export async function getItems(req, res, next) {
  let queryType = null;

  if (!currentUserId) {
    listTitle = "Choose a user or add new one";
    res.locals.items = [];
    next();
    return;
  }

  if (listType === "weekly") {
    queryType =
      "SELECT * FROM items WHERE created_at::date BETWEEN (CURRENT_DATE + INTERVAL '7 days')::date AND (CURRENT_DATE + INTERVAL '1 month' - INTERVAL '1 day')::date AND user_id = $1 ORDER BY created_at ASC";
  } else if (listType === "monthly") {
    queryType =
      "SELECT * FROM items WHERE created_at::date >= (CURRENT_DATE + INTERVAL '1 month')::date AND user_id = $1 ORDER BY created_at ASC";
  } else {
    queryType =
      "SELECT * FROM items WHERE created_at::date >= CURRENT_DATE AND created_at::date < (CURRENT_DATE + INTERVAL '7 days')::date AND user_id = $1 ORDER BY created_at ASC";
  }

  try {
    const items = await query(queryType, [currentUserId]);
    res.locals.items = items.rows;

    if (res.locals.items.length < 1) {
      listTitle = "Add some todo's";
    }

    next();
  } catch (error) {
    console.log(error);
    errorMessage = error;
    next();
  }
}

export async function showList(req, res) {
  try {
    const users = await getUsers();

    res.render("index.ejs", {
      listTitle: listTitle,
      listItems: res.locals.items,
      listType: listType,
      users: users,
      currentUserId: currentUserId,
      currentUser: currentUser,
      error: errorMessage,
    });
  } catch (error) {
    console.log("There was an error staring Travelers Tracker: ", error);
    errorMessage = "There was an error staring Travelers Tracker";
  }
}

export async function addItem(req, res) {
  const userId = req.body.userId;
  const item = req.body.newItem.trim();

  let date = null;

  try {
    const checkResult = await query(
      "SELECT * FROM items WHERE title ILIKE $1",
      [item],
    );

    if (checkResult.rows.length > 0) {
      errorMessage = "Duplicate, item already exists.";
    } else {
      const cleanItem = capitalizeFirstLetter(item);

      if (listType === "weekly") {
        date = addWeeks(new Date(), 1);
      } else if (listType === "monthly") {
        date = addMonths(new Date(), 1);
      } else {
        date = new Date();
      }

      await query(
        "INSERT INTO items (title, created_at, user_id) VALUES ($1, $2, $3)",
        [cleanItem, date, userId],
      );
      errorMessage = null;
    }
  } catch (error) {
    console.log(error);
    errorMessage = "Could not add new item.";
  }
  res.redirect("/");
}

export async function editItem(req, res) {
  const id = req.body.updatedItemId;
  const title = req.body.updatedItemTitle.trim();
  const cleanTitle = capitalizeFirstLetter(title);

  try {
    await query("UPDATE items SET title = $1 WHERE id = $2", [cleanTitle, id]);

    errorMessage = null;
  } catch (error) {
    console.log(error);
    errorMessage = "Could not update the list.";
  }

  res.redirect("/");
}

export async function deleteItem(req, res) {
  const deleteItemId = req.body.deleteItemId;

  try {
    await query("DELETE FROM items WHERE id = $1", [deleteItemId]);

    errorMessage = null;
  } catch (error) {
    console.log(error);
    errorMessage = "Could not delete the item.";
  }

  res.redirect("/");
}

export function dateType(req, res) {
  const type = req.body.dateType;

  listType = type;

  title(type);

  res.redirect("/");
}

export function newUser(req, res) {
  res.render("newUser.ejs");
}

export async function addNewUser(req, res) {
  const newUser = req.body.name.trim();
  const cleanName = capitalizeName(newUser);

  try {
    const result = await query(
      "SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(name) = LOWER($1))",
      [newUser],
    );
    const userExist = result.rows[0].exists; // Returns true or false

    if (!userExist) {
      const user = await query(
        "INSERT INTO users (name) VALUES ($1) RETURNING *",
        [cleanName],
      );

      currentUserId = user.rows[0].id;
      currentUser = user.rows[0].name;
      listType = "daily";
      errorMessage = null;

      res.redirect("/");
      return;
    } else {
      errorMessage = "Email already exist.";

      res.render("newUser.ejs", {
        error: errorMessage,
      });
      return;
    }
  } catch (error) {
    console.log("There was an error adding a new user: ", error);
    errorMessage = "There was an error adding a new user.";

    res.render("newUser.ejs", {
      error: errorMessage,
    });
  }
}

export async function findUser(req, res) {
  const user = Number(req.body.user);
  const deleteUser = Number(req.body.deleteUser);

  if (user) {
    try {
      const userInfo = await query("SELECT * FROM users WHERE id = $1", [user]);

      currentUserId = user;
      currentUser = userInfo.rows[0].name;
      listType = "daily";

      errorMessage = null;

      title("daily");

      res.redirect("/");
      return;
    } catch (error) {
      console.log("There an error looking for a user: ", error);
      errorMessage = "There an error looking for a user.";

      res.redirect("/");
      return;
    }
  } else if (deleteUser) {
    try {
      await query("DELETE FROM items WHERE user_id = $1", [deleteUser]);

      await query("DELETE FROM users WHERE id = $1", [deleteUser]);

      currentUserId = null;
      currentUser = null;

      res.redirect("/");
      return;
    } catch (error) {
      console.log("There an error deleting a user: ", error);
      errorMessage = "There an error deleting a user.";

      res.redirect("/");
      return;
    }
  }

  res.render("newUser.ejs");
}
