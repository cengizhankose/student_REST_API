const express = require("express");
const app = express();
const fs = require("fs");
const PORT = 8080;

app.use(express.json()); // JSON parse middleware

app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.status(200).send("Student REST API");
});

app.get("/student", (req, res) => {
  let rawdata = fs.readFileSync("./db.json");
  let data = JSON.parse(rawdata);
  res.status(200).send(data);
});

app.post("/student/:id", (req, res) => {
  const { id } = req.params;
  const { name, surname, classes, school } = req.body;

  if (!name || !surname || !classes || !school) {
    res.status(400).send({ message: "Missing body value" });
  }

  let student = {
    id,
    name,
    surname,
    classes,
    school,
  };

  let rawdata = fs.readFileSync("./db.json");
  let data = JSON.parse(rawdata);

  getStudent(data, id)
    ? res.status(400).send({ message: "Change your id and try again" })
    : data.push(student);

  fs.writeFileSync("./db.json", JSON.stringify(data));
  qq;
  res.send({ student: `Welcome ${name} ID:${id}` });
});

app.delete("/student/:id", function (req, res) {
  const { id } = req.params;

  let rawdata = fs.readFileSync("./db.json");
  let data = JSON.parse(rawdata);

  data.filter(function (value, index, arr) {
    if (value.id === id) {
      data.splice(index, 1);
    }
  });
  console.log(data);
  fs.writeFileSync("./db.json", JSON.stringify(data));
  res.send({
    message: `student succesfully deleted ID:${id}`,
  });
});

app.put("/student/updateStudent/:id", function (req, res) {
  const { id } = req.params;
  const { classToAdd, name, surname, school } = req.body;

  if (!name || !surname || !classToAdd || !school) {
    res.status(400).send({ message: "Missing body value" });
  }
  const newStudent = {
    name,
    surname,
    school,
  };

  let rawdata = fs.readFileSync("./db.json");
  let data = JSON.parse(rawdata);

  let student = getStudent(data, id);

  console.log("1.-----------", student);

  if (student) {
    student.name = newStudent.name;
    student.surname = newStudent.surname;
    student.school = newStudent.school;
    student.classes.push(classToAdd);
    console.log("2.-----------", student);

    fs.writeFileSync("./db.json", JSON.stringify(data));
    res.send({ message: `${classToAdd} class succesfully added to ID:${id}` });
  } else {
    res.status(400).send({ message: "No matching students" });
  }
});

const getStudent = (data, id) => data.find((student) => student.id === id);
