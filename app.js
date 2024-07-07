const express = require("express");
const app = express();
const userModel = require("./models/usermodel");
const postModel = require("./models/postmodel");
const reportModel = require("./models/report");
const multer  = require('multer')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const commentModel = require("./models/commentModel");
const path = require("path");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


app.get("/", (req, res) => {
  
  res.render("index");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  let { username, email, password, consent } = req.body;

  let user = await userModel.findOne({ email });
  if (user) {
    return res.status(400).send("User already exists");
  }

  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      return res.status(500).send("Error generating salt");
    }
    bcrypt.hash(password, salt, async function (err, hash) {
      if (err) {
        return res.status(500).send("Error hashing password");
      }
      const newUser = await userModel.create({
        username,
        email,
        password: hash,
        consent: true
      });
      let token = jwt.sign({ email: newUser.email, id: newUser._id }, "secret");
      res.cookie("token", token);
      res.redirect("/home");
    });
  });
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).send("User not found");
  }
  bcrypt.compare(password, user.password, function (err, result) {
    if (err) {
      return res.status(500).send("Error comparing passwords");
    }
    if (result) {
      let token = jwt.sign({ email: user.email, id: user._id }, "secret");
      res.cookie("token", token);
      res.redirect("/home");
    } else {
      return res.status(400).send("Incorrect password");
    }
  });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.render("index");
});

app.get("/home", isLoggedIn, async (req, res) => {
  let posts = await postModel.find();
 
  res.render("home",{posts, user : req.user});
});

app.get("/createpost", isLoggedIn, (req, res) => {
  let name = req.user.username;
  res.render("createpost",{user : req.user});
});

app.get("/report/:id",isLoggedIn, async function (req, res) {
// console.log(req.user);
res.render("report",{user : req.user, postid : req.params.id});

});

app.post("/report", upload.single('file'), async function (req, res) {
  let {postid, reporter, reportermail, culprit, issue } = req.body;

  let report = await reportModel.create({
    reporter,
    reportermail,
    postid,
    email: culprit,
    issue,
    file : req.file.filename
  });
  res
    .status(200)
    .send(" Thank you for reporting the issue. We will look into it.");
});


function isLoggedIn(req, res, next) {
  let token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, "secret", async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = user;
    next();
  });
}

app.post('/create',isLoggedIn, upload.single('file'), async function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any

  let {title, cost, description, city, cordinate} = req.body;
  let author = req.user._id;
  let file = req.file.filename;
  let newPost = await postModel.create({
    title,
    author,
    cost,
    description,
    city,
    cordinate,
    file
  });
  let user = await userModel.findOne({email:req.user.email});
  user.Posts.push(newPost._id);
  res.redirect('/home');

 
})

app.get("/view/:id",isLoggedIn, async function (req, res) {
  let post = await postModel.findById(req.params.id).populate("comment");
 let user = await userModel.findById(post.author);
 
 
  res.render("view", {post , user : user});
});

app.post("/like/:id",isLoggedIn, async function (req, res) {
  let post = await postModel.findById(req.params.id);
  let user = await userModel.findById(req.user._id);
  post.like.push(user._id);
  post.save();
  res.redirect("/view/"+req.params.id);
})

app.post("/comment/:id",isLoggedIn, async function (req, res) { 
  let post = await postModel.findById(req.params.id);
  let user = await userModel.findById(req.user._id);
  let comment = req.body.comment;
  let newComment = await commentModel.create({
    by: user._id,
    name: user.username,
    img: user.img,
    comment
  });
  post.comment.push(newComment._id);
  post.save();
  res.redirect("/view/"+req.params.id);
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
