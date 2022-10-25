const router = require("express").Router();
const Blog = require("../models/Blog");

router.get("/", async (req, res) => {
  const allBlogs = await Blog.find();
  if(req.isAuthenticated()){
    console.log(req.user);
    res.render("index", { blogs: allBlogs });
  }
  else{
    res.render("index", { blogs: allBlogs });
  }
});

module.exports = router;
