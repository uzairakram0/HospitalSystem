//jshint esversion: 6

/*packages*/

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');
mongoose.connect("mongodb://localhost:27017/HospitalDB", {useNewUrlParser: true});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const userSchema = {
  _id: String,
  firstname: String,
  lastname: String,
  DoB: Date,
  gender: String,
  email: String,
  password: String,
};

const patientSchema = {
  _id: String,
  patient: userSchema,
  physician: userSchema,
  history: [
    {
      title: String,
      body: String
    }
  ],
  prescriptions: [
    {
      
    }
  ],
  appointments: [
    {
      date: String,
      time: String
    }
]
};

const employeeSchema = {
  _id: String,
  emp: userSchema,
  patients: [
    {
      patient: patientSchema
    }
  ],
  schedule: [
    {

    }
  ]

};



const User = mongoose.model("User", userSchema);

const Employee = mongoose.model("Employee", employeeSchema);
const Patient = mongoose.model("Patient", patientSchema);

let count = 0;
let currentuser = new User();
let currentPatients = new Patient();
let currentEmployees = new Employee();
let portals = [];
let prescriptions = [];

app.get("/", function(req, res){
  res.sendFile(__dirname+"/views/index.html");
});

app.get("/signup", function(req, res){
  res.sendFile(__dirname+"/views/signup.html");
});

app.post("/signup", function(req, res){
  var firstname = req.body.fname;
  var lastname = req.body.lname;
  var birthdate = req.body.birthdate;
  var gender = req.body.gender;
  var email = req.body.email;
  var password = req.body.password;
  var status = req.body.employee;

  var id =  firstname.charAt(0) + lastname.charAt(0) + count.toString();
  count++;

  console.log(id, firstname, lastname, birthdate, gender, email, password, status);

  const user = new User({
    _id: id,
    firstname: firstname,
    lastname: lastname,
    DoB: birthdate,
    gender: gender,
    email: email,
    password: password,
  });

  user.save();
  
  const patient = new Patient({
    _id: id,
    patient: user
  });
  patient.save();

  res.redirect("/");

});

app.get("/login", function(req, res){
  res.sendFile(__dirname+"/views/login.html");
});

app.post("/login", function(req, res){
  var userID = req.body.userid;
  var password = req.body.password;
  var employee = req.body.employee;
  if(Patient.findOne({'patient._id': userID} != null)){
    Patient.findOne({'patient._id': userID}, function(err, user){
      if (err){
        console.log(err);
      } else{
        if(user.patient.firstname === "admin"){
          console.log("admin account found");
          res.redirect("/adminPage");
        } else if (user.patient.password === password){
          currentuser = user;
          res.redirect("/patientPortal");
        } else {
          console.log("fail");
        }
      }
    });
  } else {
    Employee.findOne({'emp._id': userID}, function(err, user){
      if (err){
        console.log(err);
      } else{
        if (user.emp.password === password){
          currentuser = user;
          res.redirect("/employeePortal");
        } else {
          console.log("fail");
        }
      }
    });
  }
});

app.get("/adminPage", function(req, res){
  Patient.find({}, function(err, user){
    currentPatients = user
  
    Employee.find({},function(err, user) {
      currentEmployees = user;
  
      res.render("adminPortal", {
          users: currentPatients,
          employees: currentEmployees
      });
    });
  });
});
app.post("/promote", function(req, res){
  var promotees = req.body.patients;
  Patient.findOne({'patient._id': promotees}, function(req, user){
    console.log(user.patient);
    console.log("----------------------------------");
    var tempEmp = new Employee({
      _id: user._id,
      emp: user.patient
    });
    console.log(tempEmp);
    tempEmp.save(); 
  })
  Patient.deleteMany({'patient._id': promotees},function(){});
  console.log("--------------------");
  res.redirect("/adminPage");
});

app.post("/demote", function(req, res){
  var demotees = req.body.employees;
  Employee.findOne({'emp._id': demotees}, function(req, user){
    console.log(user.emp);
    console.log("----------------------------------");
    var tempPat = new Patient({
      _id: user._id,
      patient: user.emp
    });
    console.log(tempPat);
    tempPat.save(); 
  })
  Employee.deleteMany({'emp._id': demotees},function(){});
  console.log("--------------------");
  res.redirect("/adminPage");
});

app.get("/patientPortal", function(req, res){
    Patient.find({'patient._id': currentuser._id}, function(err, user){
      currentuser = user;
    });
    prescriptions.push("Ibuprofen");
    res.render("patientportal", {
      content: "Patient Portal",
      prescriptions: prescriptions,
      user: currentuser,
      appointments: currentuser.appointments
    });
});

app.get("/employeePortal", function(req, res){
    Employee.find({'emp._id': currentuser._id}, function(err, user){
      currentuser = user;
    });
    prescriptions.push("Ibuprofen");
    res.render("employeeportal", {
      content: "Employee Portal",
      prescriptions: prescriptions,
      user: currentuser,
      appointments: currentuser.appointments
    });
});

app.post("/makeApp", function(req, res){
  var appDate = req.body.appDate;
  var appTime = req.body.appTime;
  var tempUser = req.body.userID;
  console.log(appDate,appTime,tempUser);
  Patient.findOne({'patient._id': tempUser}, function(err, user){
    var tempApp = {date: appDate, time: appTime};
    user.appointments.push(tempApp);
    user.save();
    console.log(user);
  });

});
app.get("/schedule", function(req, res){
  res.sendFile(__dirname+"schedule-template-master/index.html");
});




app.listen(3000, function(){
  console.log("Server started on port 3000");
});
