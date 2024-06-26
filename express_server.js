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

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
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

//function to find user by email
function getUserByEmail(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

//ROUTE TO DISPLAY URLS
app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = {
    user,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});


//route to show form to create URL
app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = {
    user
  }
  res.render("urls_new", templateVars);
});

//route to display URL ID details
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { 
    user,
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

//get /login endpoint
app.get("/login", (req, res) => {
  res.render("login");
})

//ROUTE FOR LOGIN
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password
  const user = getUserByEmail(email);

  if (user && user.password === password) {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  } else {
    res.status(401).send("User not found")
  }
  });

//route for logout
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

//ROUTE FOR REGISTRATION
app.get("/register", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = {
    user
  };
  res.render("register", templateVars);
});

//post /regist endpoint to handle registration form data
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //check for empty email or pword
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty")
  }

  //check if email already exists
  for (const userId in users) {
    if (users[userId].email === email) {
      return res.status(400).send("Email already exists");
    }
  }

  //genereate random user id
  const userId = generateRandomString();

  //add new user to users object
  users[userId] = {
    id: userId,
    email: email,
    password: password,
  };

  //set user_id cookie w/ user's new Id
  res.cookie('user_id', userId);

  //users object testing/debugging
  console.log('Users:', users);
  console.log('User ID cookie:', req.cookies['user_id']);

  //redirect
  res.redirect('/urls');
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});