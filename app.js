var express         = require("express"),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose");
    
var app = express();

mongoose.connect("mongodb://localhost/blogs_database");

app.set("view engine","ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:false}));

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
   Blog.create(req.body.blog,function(err,newBlog){
      if(err){
        console.log(err);
        res.render("new");  
      }
      else
        res.redirect("/blogs")
   });
});

app.listen(process.env.PORT,process.env.IP,function(){
    console.log("Server has started...");
});

