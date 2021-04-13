const express = require("express");
const app = express();
const fs = require("fs");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const PORT = 8080;

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Student API",
      description: "Student API",
      contact: {
        name: "Cengizhan KÖSE",
      },
      servers: ["http://localhost:8080"],
    },
  },
  apis: ["./index.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json()); // JSON parse middleware

app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});

// Routes

/**
 * @swagger
 * /:
 *  get:
 *    summary: "default endpoint"
 *    description: Main screen endpoint this endpoint doesn't do much
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.get("/", (req, res) => {
  res.status(200).send("Student REST API");
});

/**
 * @swagger
 * /student:
 *  get:
 *    tags:
 *    - "student"
 *    summary: "Get all student data"
 *    description: Use to request all students
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.get("/student", (req, res) => {
  let rawdata = fs.readFileSync("./db.json");
  let data = JSON.parse(rawdata);
  res.status(200).send(data);
});

/**
 * @swagger
 * /student/{id}:
 *  post:
 *     tags:
 *     - "student"
 *     summary: "Add a new student"
 *     description: "Use to add a new student."
 *     operationId: "AddStudent"
 *     produces:
 *     - "application/json"
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "id of the student that you want to update"
 *       required: true
 *       type: "string"
 *     - in: "body"
 *       name: "body"
 *       description: "Add a new student object"
 *       required: true
 *       schema:
 *         type: "object"
 *         properties:
 *           name:
 *             type: "string"
 *           surname:
 *             type: "string"
 *           classes:
 *             type: "array"
 *             items:
 *               type: "string"
 *           school:
 *             type: "string"
 *     responses:
 *       "200":
 *         description: "Successfully added user"
 *       "400":
 *         description: "Missing body value"
 *       "404":
 *         description: "invalid id"
 */
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
    ? res.status(404).send({ message: "Change your id and try again" })
    : data.push(student);

  fs.writeFileSync("./db.json", JSON.stringify(data));
  res
    .status(201)
    .send({
      student: `Student named ${name} successfully added with ID:${id}`,
    });
});

/**
 * @swagger
 * /student/{id}:
 *  delete:
 *     tags:
 *     - "student"
 *     summary: "Delete student"
 *     description: "Use to delete a student."
 *     operationId: "deleteStudent"
 *     produces:
 *     - "application/json"
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "id of the student that you want to delete"
 *       required: true
 *       type: "string"
 *     responses:
 *       "204":
 *         description: "Successfully deleted user"
 *       "400":
 *         description: "Missing id"
 *       "404":
 *         description: "There is no equal match to entered id"
 */

//TODO HTTP response "400","404":

app.delete("/student/:id", (req, res) => {
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
  res.status(204).send({
    message: `student successfully deleted ID:${id}`,
  });
});

/**
 * @swagger
 * /student/{id}:
 *  put:
 *     tags:
 *     - "student"
 *     summary: "Update student"
 *     description: "Use to update a student."
 *     operationId: "updateStudent"
 *     produces:
 *     - "application/json"
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "id of the student that you want to update"
 *       required: true
 *       type: "string"
 *     - in: "body"
 *       name: "body"
 *       description: "Updated student object"
 *       required: true
 *       schema:
 *         type: "object"
 *         properties:
 *           name:
 *             type: "string"
 *           surname:
 *             type: "string"
 *           classes:
 *             type: "array"
 *             items:
 *               type: "string"
 *           school:
 *             type: "string"
 *     responses:
 *       "200":
 *         description: "Successfully updated user"
 *       "400":
 *         description: "Missing body value"
 *       "404":
 *         description: "There is no equal match to entered id"
 */
app.put("/student/:id", (req, res) => {
  const { id } = req.params;
  const { classes, name, surname, school } = req.body;

  if (!name || !surname || !classes || !school) {
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

  if (student) {
    student.name = newStudent.name;
    student.surname = newStudent.surname;
    student.school = newStudent.school;
    student.classes = newStudent.classes;
    fs.writeFileSync("./db.json", JSON.stringify(data));
    res.status(200).send({ message: `ID:${id} student updated successfully` });
  } else {
    res.status(404).send({ message: "No matching students" });
  }
});

const getStudent = (data, id) => data.find((student) => student.id === id);
