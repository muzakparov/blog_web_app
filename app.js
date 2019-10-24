var express         = require("express"),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    path            = require("path"),
    methodOverride  = require("method-override"),
    expressSanitizer= require("express-sanitizer"),
    cors            = require("cors");
    
var app = express();

var url = process.env.DATABASEURL || "mongodb://localhost/blogs_database"
mongoose.connect(url);

app.set("view engine","ejs");

app.use(cors());
app.use(express.static(path.join(__dirname,"public")));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());//just right below body-parser
app.use(methodOverride("_method"));

//Blog data model
var blogSchema = new mongoose.Schema({
    title:String,
    image:String,
    body:String,
    date:{type:Date,default:Date.now}
});

var Blog = mongoose.model("Blog",blogSchema);

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

app.get("/",function(req,res){
    res.redirect("/blogs");
});


//INDEX ROUTE
app.get("/blogs",function(req,res){
    Blog.find({},function(err,blogs){
        if(err)
            console.log(err);
        else
            res.render("index",{blogs:blogs});
    });
});

//NEW ROUTE
app.get("/blogs/new",function(req, res) {
   res.render("new"); 
});

//CREATE ROUTE
app.post("/blogs",function(req,res){
    req.body.blog.body=req.sanitize(req.body.blog.body);
   Blog.create(req.body.blog,function(err,newBlog){
      if(err){
        console.log(err);
        res.render("new");  
      }
      else
        res.redirect("/blogs")
   });
});

//SHOW ROUTE
app.get("/blogs/:id",function(req, res) {
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err)
            console.log(err);
        else
            res.render("show",{blog:foundBlog});
    });
});

//EDIT ROUTE
app.get("/blogs/:id/edit",function(req, res) {
    Blog.findById(req.params.id,function(err,foundBlog){
       if(err)
            console.log(err);
        else
            res.render("edit",{blog:foundBlog}); 
    }); 
});

//UPDATE ROUTE
app.put("/blogs/:id",function(req,res){
    req.body.blog.body=req.sanitize(req.body.blog.body);
    //res.send("UPDATED");
   Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
      if(err)
        res.redirect("/blogs");
      else
        res.redirect("/blogs/"+req.params.id);
   });
});

//DESTROY ROUTE
app.delete("/blogs/:id",function(req,res){
    Blog.findByIdAndRemove(req.params.id,function(err){
        if(err)
            console.log(err);
        else
            res.redirect("/blogs");
    });
});

app.listen(process.env.PORT,process.env.IP,function(){
    console.log("Server has started...");
});

