const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = 3000;

app.use(bodyParser.json());

let listings = [
  {
    id: "1",
    title: "Smartphone",
    description: "Latest model with high-end specs.",
    seller: "TechStore",
    rating: 4.5,
  },
  {
    id: "2",
    title: "Laptop",
    description: "Powerful laptop with large storage and fast processor.",
    seller: "GadgetWorld",
    rating: 4.2,
  },
  {
    id: "3",
    title: "Wireless Headphones",
    description: "Noise-cancelling headphones with long battery life.",
    seller: "SoundTech",
    rating: 4.7,
  },
  {
    id: "4",
    title: "Smart Watch",
    description: "A smart watch with fitness tracking features.",
    seller: "FitStore",
    rating: 4.9,
  },
];

app.get("/", (req, res) => {
  res.send("Welcome to the Shopping API! Use /listing to get listings.");
});

app.get("/listing", (req, res) => {
  res.json({ data: listings });
});

app.get("/listing/:id", (req, res) => {
  const { id } = req.params;
  const item = listings.find((listing) => listing.id === id);

  if (item) {
    res.json({ data: item });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

app.post("/listing", (req, res) => {
  const { title, description, seller, rating } = req.body;
  const newItem = {
    id: uuidv4(),
    title,
    description,
    seller,
    rating: rating || 0,
  };
  listings.push(newItem);
  res.status(201).json({ data: newItem });
});

app.put("/listing/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, rating } = req.body;

  let item = listings.find((listing) => listing.id === id);

  if (item) {
    item = {
      ...item,
      title,
      description,
      rating: rating !== undefined ? rating : item.rating,
    };
    listings = listings.map((listing) => (listing.id === id ? item : listing));
    res.json({ data: item });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

app.delete("/listing/:id", (req, res) => {
  const { id } = req.params;
  const index = listings.findIndex((listing) => listing.id === id);

  if (index !== -1) {
    listings.splice(index, 1);
    res.status(200).json({ message: "Item deleted successfully" });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
