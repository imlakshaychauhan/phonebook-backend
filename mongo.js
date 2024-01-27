const mongoose = require("mongoose");

const password = process.argv[2];
const url = `mongodb+srv://fullstackopen:${password}@maincluster.vaweana.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

const name = process.argv[3];
const number = process.argv[4];

if (!name && !number) {
  console.log("Phonebook:");
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
} else {
  const person = new Person({
    name: name,
    number: number,
  });

  person.save().then((result) => {
    console.log(`added ${name} number ${number} to phonebook`);
    console.log(result);
    mongoose.connection.close();
  });
}
