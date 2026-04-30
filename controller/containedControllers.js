import { parseISO, startOfDay, addDays, addWeeks, addMonths } from "date-fns";
import items from "../data/items.json" with { type: "json" };
import people from "../data/users.json" with { type: "json" };

let list = items;
let peoples = people;

function nextItemId() {
  const nextId =
    list.length > 0 ? Math.max(...list.map((item) => item.id)) + 1 : 1;

  return nextId;
}

function nextUserId() {
  const nextId =
    peoples.length > 0 ? Math.max(...peoples.map((item) => item.id)) + 1 : 1;

  return nextId;
}

function capitalizeFirstLetter(title) {
  if (!title) return "";
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function capitalizeName(name) {
  return name
    .toLowerCase()
    .replace(/(^|[\s\-\'])\S/g, (match) => match.toUpperCase());
}

function title(type) {
  if (type === "daily") {
    return "Today";
  } else if (type === "weekly") {
    return "This Week";
  } else {
    return "This Month";
  }
}

function getListType(req) {
  if (!req.session.listType) {
    req.session.listType = "daily";
  }

  return req.session.listType;
}

export async function getItems(req, res, next) {
  const now = new Date();
  const upcomingWeekStart = startOfDay(addDays(now, 7));
  const upcomingMonthStart = startOfDay(addMonths(now, 1));
  const currentUserId = req.session.currentUserId;
  const listType = getListType(req);

  if (!currentUserId) {
    res.locals.listTitle = "Choose a user or add new one";
    res.locals.items = [];
    return next();
  }

  const filteredItems = list.filter((item) => {
    const itemDate = parseISO(item.created_at);
    const matchesUser = item.user_id === currentUserId;

    if (listType === "weekly") {
      return (
        matchesUser &&
        itemDate >= upcomingWeekStart &&
        itemDate < upcomingMonthStart
      );
    }

    if (listType === "monthly") {
      return matchesUser && itemDate >= upcomingMonthStart;
    }

    return matchesUser && itemDate < upcomingWeekStart;
  });

  // 3. Set results
  res.locals.items = filteredItems;
  res.locals.listTitle =
    filteredItems.length < 1 ? "Add some todo's" : title(listType);

  next();
}

export function showList(req, res) {
  const listType = getListType(req);

  res.render("index.ejs", {
    listTitle: res.locals.listTitle,
    listItems: res.locals.items,
    listType: listType,
    users: peoples,
    currentUserId: req.session.currentUserId,
    currentUser: req.session.currentUser,
    error: req.session.errorMessage,
  });
}

export async function addItem(req, res) {
  const userId = Number(req.session.currentUserId ?? req.body.userId);
  const newItem = req.body.newItem.trim();
  const listType = getListType(req);

  let date = null;

  const exist = list.some(
    (item) => item.title.toLowerCase() === newItem.toLowerCase(),
  );

  if (!exist) {
    const nextId = nextItemId();
    const cleanItem = capitalizeFirstLetter(newItem);

    if (listType === "weekly") {
      date = addWeeks(new Date(), 1);
    } else if (listType === "monthly") {
      date = addMonths(new Date(), 1);
    } else {
      date = new Date();
    }

    list.push({
      id: nextId,
      title: cleanItem,
      created_at: date.toISOString(),
      user_id: userId,
    });

    req.session.errorMessage = null;
  } else {
    req.session.errorMessage = newItem + " already exist.";
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

  req.session.errorMessage = null;
  res.redirect("/");
}

export async function deleteItem(req, res) {
  const deleteItemId = req.body.deleteItemId;

  list = list.filter((item) => item.id !== Number(deleteItemId));
  req.session.errorMessage = null;

  res.redirect("/");
}

export function dateType(req, res) {
  const type = req.body.dateType;

  req.session.listType = ["daily", "weekly", "monthly"].includes(type)
    ? type
    : "daily";

  res.redirect("/");
}

export function newUser(req, res) {
  res.render("newUser.ejs");
}

export async function addNewUser(req, res) {
  const newUser = req.body.name.trim();
  const cleanName = capitalizeName(newUser);

  const exist = peoples.some(
    (item) => item.name.toLowerCase() === newUser.toLowerCase(),
  );

  const nextId = nextUserId();
  if (!exist) {
    peoples.push({
      id: nextId,
      name: cleanName,
    });

    req.session.currentUserId = nextId;
    req.session.currentUser = cleanName;
    req.session.listType = "daily";
    req.session.errorMessage = null;

    res.redirect("/");
  } else {
    res.render("newUser.ejs", {
      error: cleanName + " is already a traveler.",
    });
  }
}

export async function findUser(req, res) {
  const userId = Number(req.body.user);
  const deleteUserId = Number(req.body.deleteUser);

  if (userId) {
    const user = peoples.find((item) => item.id === userId);

    if (user) {
      req.session.currentUserId = user.id;
      req.session.currentUser = user.name;
      req.session.listType = "daily";
      req.session.errorMessage = null;

      res.redirect("/");
      return;
    }
  } else if (deleteUserId) {
    const removeUser = peoples.filter((item) => item.id !== deleteUserId);
    const removeItem = list.filter((item) => item.user_id !== deleteUserId);

    list = removeItem;
    peoples = removeUser;

    if (req.session.currentUserId === deleteUserId) {
      req.session.currentUserId = null;
      req.session.currentUser = null;
      req.session.listType = "daily";
    }

    req.session.errorMessage = null;

    res.redirect("/");
    return;
  }

  res.render("newUser.ejs");
}
