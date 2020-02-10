var express = require("express"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  path = require("path"),
  methodOverride = require("method-override"),
  expressSanitizer = require("express-sanitizer");
var multiparty = require("multiparty");

var app = express();

var url = process.env.DATABASEURL || "mongodb://localhost/chapters_database";
mongoose.connect(url);

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer()); //just right below body-parser
app.use(methodOverride("_method"));
//Blog data model
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  date: { type: Date, default: Date.now }
});

var Blog = mongoose.model("Blog", blogSchema);

/*
  Blog.create({
      title:"First Blog Post",
      image:"http://www.indiacelebrating.com/wp-content/uploads/Global-warming.jpg",
      body:"Me. I'm huge. I ve got a blog."
  },function(err,blog){
      if(err)
          console.log(err);
      else
          console.log(blog);
  });
  */

const organizationSchema = new mongoose.Schema({
  name: String,
  googleAnalytics: String,
  logo: String,
  description: String,

  socialLink: String,
  date: { type: Date, default: Date.now }
});

const Organization = mongoose.model("Organization", organizationSchema);

app.get("/organization/new", (req, res) => {
  res.render("admin/new_organization");
});

app.post("/organizations", function(req, res) {
  req.body.organization.body = req.sanitize(req.body.organization.body);
  Organization.create(req.body.organization, function(err, newOrganization) {
    if (err) {
      console.log(err);
      res.render("admin/new_organization");
    } else res.redirect("/organizations");
  });
});

app.get("/organizations", function(req, res) {
  Organization.find({}, function(err, organizations) {
    if (err) console.log(err);
    else {
      res.json({ organizations });
    }
  });
});

app.get("/dashboard", function(req, res) {
  res.render("admin/dashboard");
});

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password_digest: String,

  date: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// app.get("/users", function(req, res) {
//   res.render("admin/users");
// });

app.get("/users/new", function(req, res) {
  res.render("admin/users_new");
});

app.post("/users", function(req, res) {
  req.body.user.body = req.sanitize(req.body.user.body);
  User.create(req.body.user, function(err, newuser) {
    if (err) {
      console.log(err);
      res.render("admin/users_new");
    } else res.redirect("/users");
  });
});

app.get("/users", function(req, res) {
  User.find({}, function(err, users) {
    if (err) console.log(err);
    else {
      res.render("admin/users", { users });
    }
  });
});

app.delete("/users/delete", function(req, res) {
  var form = new multiparty.Form();

  form.parse(req, function(err, fields, files) {
    // fields fields fields
    User.findByIdAndRemove(fields.userId, function(err) {
      if (err) console.log(err);
      else res.json(fields);
    });
  });
});

const chapterSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  details: String,
  location_id: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },

  creator_id: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },

  date: { type: Date, default: Date.now }
});

const sponsorSchema = new mongoose.Schema({
  name: String,
  website: String,
  logo_path: String,
  type: String,

  date: { type: Date, default: Date.now }
});

const tagSchema = new mongoose.Schema({
  name: String
});

const locationSchema = new mongoose.Schema({
  country_code: String,
  city: String,
  region: String,
  postal_code: String,
  date: { type: Date, default: Date.now }
});

const venueSchema = new mongoose.Schema({
  name: String,
  location_id: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
  date: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
  name: String,
  description: String,
  starts_at: String,
  ends_at: String,
  chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
  venue_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tag" },
  tag_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  sponsors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sponsor" }],
  capacity: Number,

  date: { type: Date, default: Date.now }
});

const Chapter = mongoose.model("Chapter", chapterSchema);
const Location = mongoose.model("Location", locationSchema);
const Venue = mongoose.model("Venue", venueSchema);
const Tag = mongoose.model("Tag", tagSchema);
const Sponsor = mongoose.model("Sponsor", sponsorSchema);
const Event = mongoose.model("Event", eventSchema);

app.get("/events", function(req, res) {
  res.send("events");
});

app.get("/events/new", function(req, res) {
  res.render("admin/events_new");
});

app.post("/events", function(req, res) {
  req.body.event.body = req.sanitize(req.body.event.body);
  Event.create(req.body.event, function(err, newEvent) {
    if (err) {
      console.log(err);
      res.render("admin/events_new");
    } else res.redirect("/events");
  });
});

//later

app.get("/chapters", function(req, res) {
  res.send("chapters");
});

//old

app.get("/", function(req, res) {
  res.redirect("/blogs");
});

//INDEX ROUTE
app.get("/blogs", function(req, res) {
  Blog.find({}, function(err, blogs) {
    if (err) console.log(err);
    else res.render("index", { blogs: blogs });
  });
});

//NEW ROUTE
app.get("/blogs/new", function(req, res) {
  res.render("new");
});

//CREATE ROUTE
app.post("/blogs", function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog, function(err, newBlog) {
    if (err) {
      console.log(err);
      res.render("new");
    } else res.redirect("/blogs");
  });
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) console.log(err);
    else res.render("show", { blog: foundBlog });
  });
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) console.log(err);
    else res.render("edit", { blog: foundBlog });
  });
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  //res.send("UPDATED");
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(
    err,
    updatedBlog
  ) {
    if (err) res.redirect("/blogs");
    else res.redirect("/blogs/" + req.params.id);
  });
});

//DESTROY ROUTE
app.delete("/blogs/:id", function(req, res) {
  Blog.findByIdAndRemove(req.params.id, function(err) {
    if (err) console.log(err);
    else res.redirect("/blogs");
  });
});

app.listen(process.env.PORT || 3000, process.env.IP, function() {
  console.log("Server has started...");
});
