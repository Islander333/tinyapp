const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//generate random string of 6 characters
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result+= characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

//route to display URLs
app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"] || "",
    urls: urlDatabase
   };
  res.render("urls_index", templateVars);
});

//route to show form to create URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"] || ""
  }
  res.render("urls_new", templateVars);
});

//route to display URL ID details
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { 
    username: req.cookies["username"] || "",
    id, 
    longURL 
  };
  res.render("urls_show", templateVars);
});

//route to make a new short URL
app.post("/urls", (req, res) => {
  //get long URL and generate random short URL
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  //save both to URL database
  urlDatabase[shortURL] = longURL;
  //redirect to page that shows shortURL now
  res.redirect(`/urls/${shortURL}`);
});

//route to handle URL redirection
app.get("/u/:id", (req, res) => {
  //get id from req
  const id = req.params.id;
  //look up longURL in database
  const longURL = urlDatabase[id];
  //redirect to longURL if found
  if (longURL) {
    res.redirect(longURL);
    //add error handling
  } else {
    res.status(404).send("error: no short URL")
  }
});

//home route
app.get("/", (req, res) => {
  const templateVars = { username: req.cookies["username"] || ""};
  res.render("index", templateVars);
});

//JSON endpoint
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//hello route
app.get("/hello", (req, res) => {
  const templateVars = { username: req.cookies["username"] || "" };
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//route for URL deletion
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

//route for URL update
app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL;
  res.redirect(`/urls/${id}`);
});

//route for login
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

//route for logout
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});