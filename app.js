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
  employee: String
};
const empSchema = {
  profile: userSchema,
  patients: [{
    userSchema
  }]
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
    employee: status
  });

  user.save();

  if (status === "on"){
    const employee = new Employee({
      _id: id,
      emp: user
    });
    employee.save();
  } else {
    const patient = new Patient({
      _id: id,
      patient: user
    });
    patient.save();
  }

  res.redirect("/");

});

app.get("/login", function(req, res){
  res.sendFile(__dirname+"/views/login.html");
});

app.post("/login", function(req, res){
  var userID = req.body.userid;
  var password = req.body.password;
  var employee = req.body.employee;
  
  User.findOne({_id: userID}, function(err, user){
    if (err){
      console.log(err);
    } else{
      if(user.firstname === "admin"){
        console.log("admin account found");
        res.redirect("/adminPage");
      } else if (user.password === password){
        let name = user.firstname + " " + user.lastname;
        const portal = {name};

        portals.push(portal);
          currentuser = user;
        res.redirect("/:portalName");
      } else {
        console.log("fail");
      }
    }
  });
});

app.get("/adminPage", function(req, res){
  User.find({}).exec( function(err, user){
    res.render("adminPortal", {
      users: user,
      employment: user.employee
    });
  });
});

app.post("/promote", function(req, res){
  var promotees = { _id: req.body.patients };
  User.updateMany(
    { _id: promotees._id },
    {$set: {employee: "on"} },
    {},
    (err,writeResult) => {}
  );
  console.log("--------------------");
  res.redirect("/adminPage");
});

app.post("/demote", function(req, res){
  var demotees = { _id: req.body.employees };
  User.updateMany(
    { _id: demotees._id },
    {$set: {employee: "off"} },
    {},
    (err,writeResult) => {}
  );
  res.redirect("/adminPage");
});

app.get("/:portalName", function(req, res){
portals.forEach(function(portal){
  console.log(portal);
  if(currentuser.employee === "on") {
    res.render("employeeportal", {
      name: portal.name,
      content: "employee",
      prescriptions: prescriptions,
      user: currentuser
    });
    portals.pop();
  } else {
    Patient.find({'patient._id': currentuser._id}, function(err, user){
      currentuser = user;
    });
      prescriptions.push("Ibuprofen");
        res.render("patientportal", {
          name: portal.name,
          content: "patient",
          prescriptions: prescriptions,
          user: currentuser,
        });
        portals.pop();
  }

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
  });
  res.redirect("/:portalName");
});
app.get("/schedule", function(req, res){
  res.sendFile(__dirname+"schedule-template-master/index.html");
});




app.listen(3000, function(){
  console.log("Server started on port 3000");
});
