const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const { Person } = require("./models/person");
const mongoose = require("mongoose");
require("dotenv").config();

morgan.token("header", function (req, res) {
  return Object.keys(req.body).length === 0 ? "-" : JSON.stringify(req.body);
});

// Middlewares -
app.use(express.json());
app.use(cors());
app.use(express.static("dist"));
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :header "
  )
);

let data = [];

// Mongoose Connection here.
const url = process.env.MONGODB_URI;
mongoose.set("strictQuery", false);

mongoose
  .connect(url)
  .then((res) => {
    console.log("connected to Database");
  })
  .catch((err) => {
    console.log("error connecting to MongoDB", err.message);
  });

app.get("/", (req, res) => {
  res.send("<h1>Go to /api/person route</h1>");
});

app.get("/api/persons", async (req, res) => {
  data = await Person.find({});
  res.status(200).json(data);
});

app.get("/info", (req, res) => {
  const d = new Date();
  res.send(`<p>Phonebook has info of ${data.length} people</p> <p>${d}</p>`);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  Person.find(id).then(person => {
    res.json(person);
  })
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  data = data.filter((person) => person.id !== id);
  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name || body.name.trim() === "" || body.name === undefined) {
    return res.status(400).send({ error: "Name is missing" });
  }

  if (!body.number || body.number.trim() === "" || body.number === undefined) {
    return res.status(400).json({ error: "Number is missing" });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    res.json(savedPerson);
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
