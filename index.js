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
  const id = req.params.id;
  Person.findById({ _id: id })
    .then((person) => {
      if (person) res.json(person);
      else res.status(404).end();
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send({ error: "malformatted id" });
    });
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findByIdAndDelete({ _id: id })
    .then((r) => {
      res.status(204).end();
    })
    .catch((err) => {
      next(err);
    });
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  if (!body.name || body.name.trim() === "" || body.name === undefined) {
    return res.status(400).send({ error: "name missing" });
  }

  if (!body.number || body.number.trim() === "" || body.number === undefined) {
    return res.status(400).json({ error: "number missing" });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    res.json(savedPerson);
  }).catch(err => next(err))
});

app.put("/api/persons/:id", async (req, res, next) => {
  const id = req.params.id;
  const newData = req.body;

  try {
    const result = await Person.findByIdAndUpdate({ _id: id }, newData, {
      new: true,
      runValidators: true,
      context: "query",
    });
    res.status(200).json(result);
  } catch (err) {
    throw err;
  }
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "Unknown Endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.error(error.stack);
  const statusCode = error.statusCode || 500;
  res
    .status(statusCode)
    .json({ error: { message: error.message || "Internal Server Error" } });
};

app.use(errorHandler);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});