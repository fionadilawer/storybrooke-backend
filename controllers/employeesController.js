const data = {
  employees: require("../model/employees.json"),
  setEmployees: function (data) {
    this.employees = data;
  },
};

const fsPromises = require("fs").promises;
const path = require("path");

const getAllEmployees = (req, res) => {
  res.json(data.employees);
};

const createNewEmployee = async (req, res) => {
  const newEmployee = {
    id: data.employees[data.employees.length - 1].id + 1 || 1,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
  };

  if (!newEmployee.firstname || !newEmployee.lastname) {
    return res
      .status(400)
      .json({ message: "First and last names are required." });
  }

  data.setEmployees([...data.employees, newEmployee]);
  await fsPromises.writeFile(
    path.join(__dirname, "..", "model", "employees.json"),
    JSON.stringify(data.employees)
  );
  res.status(201).json(data.employees);
};

const updateEmployee = (req, res) => {
  res.json({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
  });
};

const deleteEmployee = async (req, res) => {
  res.json({
    id: req.body.id,
  });
  data.setEmployees(
    data.employees.filter((employee) => employee.id !== req.body.id)
  )
  await fsPromises.writeFile(
    path.join(__dirname, "..", "model", "employees.json"),
    JSON.stringify(data.employees)
  );
};

const getEmployee = (req, res) => {
  res.json({
    id: req.params.id,
  });
};

module.exports = {
  getAllEmployees,
  createNewEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployee,
};
