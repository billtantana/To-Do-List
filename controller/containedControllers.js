import express from "express";
import items from "../data/items.json" with { type: "json" };

let list = items;
let errorMessage = null;

function nextItemId() {
  const nextId =
    list.length > 0 ? Math.max(...list.map((item) => item.id)) + 1 : 1;

  return nextId;
}

function capitalizeFirstLetter(title) {
  if (!title) return "";
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export function showList(req, res) {
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: list,
    error: errorMessage,
  });
}

export async function addItem(req, res) {
  const newItem = req.body.newItem.trim();
  const cleanItem = capitalizeFirstLetter(newItem);

  const exist = list.some(
    (item) => item.title.toLowerCase() === newItem.toLowerCase(),
  );

  if (!exist) {
    const nextId = nextItemId();

    list.push({ id: nextId, title: cleanItem });
    errorMessage = null;
  } else {
    errorMessage = newItem + " already exist.";
  }

  res.redirect("/");
}

export async function editItem(req, res) {
  const id = req.body.updatedItemId;
  const title = req.body.updatedItemTitle.trim();
  const cleanTitle = capitalizeFirstLetter(title);

  list = list.map((item) => {
    if (item.id === Number(id)) {
      return { ...item, title: cleanTitle };
    }

    return item;
  });

  errorMessage = null;
  res.redirect("/");
}

export async function deleteItem(req, res) {
  const deleteItemId = req.body.deleteItemId;

  list = list.filter((item) => item.id !== Number(deleteItemId));
  errorMessage = null;

  res.redirect("/");
}
