import express from "express";
import { query } from "../db/index.js";

let errorMessage = null;

function capitalizeFirstLetter(title) {
  if (!title) return "";
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export async function getItems(req, res, next) {
  try {
    const items = await query("SELECT * FROM items ORDER BY id ASC");
    res.locals.items = items.rows;
    next();
  } catch (error) {
    console.log(error);
    errorMessage = error;
    next();
  }
}

export function showList(req, res) {
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: res.locals.items,
    error: errorMessage,
  });
}

export async function addItem(req, res) {
  const item = req.body.newItem.trim();

  try {
    const checkResult = await query(
      "SELECT * FROM items WHERE title ILIKE $1",
      [item],
    );

    if (checkResult.rows.length > 0) {
      errorMessage = "Duplicate, item already exists.";
    } else {
      const cleanItem = capitalizeFirstLetter(item);

      await query("INSERT INTO items (title) VALUES ($1)", [cleanItem]);
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