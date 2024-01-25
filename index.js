const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require('cors')

morgan.token("header", function (req, res) {
  return Object.keys(req.body).length === 0 ? "-" : JSON.stringify(req.body);
});

// Middlewares -
app.use(express.json());
app.use(cors());
app.use(express.static('dist'))
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :header "
  )
);

let data = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (req, res) => {
  res.send("<h1>Go to /api/person route</h1>");
});

app.get("/api/persons", (req, res) => {
  res.json(data);
});

app.get("/info", (req, res) => {
  const d = new Date();
  console.log(d);
  res.send(`<p>Phonebook has info of ${data.length} people</p> <p>${d}</p>`);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = data.find((person) => person.id === id);
  res.json(person);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  data = data.filter((person) => person.id !== id);
  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const person = req.body;
  
  if (!person.name || person.name.trim() === "" || person.name === undefined) {
    return res.status(400).send({ error: "Name is missing" });
  }

  if (
    !person.number ||
    person.number.trim() === "" ||
    person.number === undefined
  ) {
    return res.status(400).json({ error: "Number is missing" });
  }

  if (data.some((p) => p.name === person.name)) {
    return res.status(400).send({ error: "name must be unique" });
  }

  person.id = Math.round(Math.random() * 1000000000);
  data = data.concat(person);
  res.json(data);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
