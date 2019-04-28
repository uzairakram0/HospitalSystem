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

const User = mongoose.model("User", userSchema);

let count = 0;
let portals = [];

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
  var employee = req.body.employee;

  var id =  firstname.charAt(0) + lastname.charAt(0) + count.toString();
  count++;

  console.log(id, firstname, lastname, birthdate, gender, email, password, employee);

  const user = new User({
    _id: id,
    firstname: firstname,
    lastname: lastname,
    DoB: birthdate,
    gender: gender,
    email: email,
    password: password,
    employee: employee
  });

  user.save();

  var name = firstname + lastname;
  const portal = {
    name: name
  };

  portals.push(portal);

  res.redirect("/");

});

app.get("/login", function(req, res){
  res.sendFile(__dirname+"/views/login.html");
});

app.post("/login", function(req, res){
  var userID = req.body.userid;
  var password = req.body.password;
  var employee = req.body.employee;
  console.log(userID, password, employee);

  User.findOne({_id: userID}, function(err, user){
    if (err){
      console.log(err);
    } else{
      if (user.password === password){
        res.redirect("/:portalName");
        console.log("Success");
      } else {
        console.log("fail");
      }
    }

  });

});

app.get("/:portalName", function(req, res){
portals.forEach(function(portal){
  if(_.lowerCase(req.params.postName) === _.lowerCase(portal.name)){
    res.render("portal", {title: portal.name, content: "portal.body"});
  }
});
});


app.listen(3000, function(){
  console.log("Server started on port 3000");
});
