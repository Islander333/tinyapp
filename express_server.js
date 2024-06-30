import express from "express";
import cookieSession from "cookie-session";
import bcrypt from "bcryptjs";
import { getUserByEmail, urlsForUser, generateRandomString } from "./helpers.js";

const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key-1', 'key-2']
}));

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync('purple-monkey-dinosaur', 10),
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync('dishwasher-funk', 10),
  }
};


//GET /URLS ROUTE
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  // Check if user is logged in
  if (!user) {
    const templateVars = {
      user: null,
      urls: {},
      error: "Welcome to TinyApp! Please login to view URLs."
    };
    return res.render("urls_index", templateVars);
  }

  // Get URLs for logged-in user
  const urls = urlsForUser(userId, urlDatabase) || {};

  // Ensure urls is defined even if empty
  const templateVars = {
    user,
    urls: urls || {},
    error: null
  };

  // Render the urls_index.ejs template with templateVars
  res.render("urls_index", templateVars);
});



//GET /URLS/NEW
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {//route for URL update
    res.redirect("/login");
  }
  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});



//POST FOR URLS/:ID/UPDATE
app.post("/urls/:id/update", (req, res) => {
  console.log("POST /urls/:id/update route hit")
  const userId = req.session.user_id;
  const id = req.params.id
  const urlData = urlDatabase[id];
    
  console.log("req.body", req.body);
  //check if user is logged in
  if (!userId || !users[userId]) {
    return res.status(401).send("Must be logged in to edit Urls")
    }
    
  if (!urlData || urlData.userID !== userId) {
    return res.status(403).send("This url is not owned by you, you cannot edit this URL.")
    }
    
  const newLongURL = req.body.longURL;
    urlDatabase[id].longURL = newLongURL;
    res.redirect(`/urls/${id}`);
  });



  //GET /URLS/:ID ROUTE
app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  //display url id details
  const shortURL = req.params.id;
  const urlData = urlDatabase[shortURL];

  if (!user) {
    return res.status(401).send("Must be logged in to view URL")
  }

  if (!urlData || urlData.userID !== userId) {
    return res.status(403).send("This url is not owned by you.")
  }
  const templateVars = { 
    user,
    shortURL,
    id: shortURL,
    longURL: urlData.longURL
  };
  res.render("urls_show", templateVars);
});

//POST /URLS ROUTE
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    return res.status(403).send("Only registered and logged in users can create short URLs")
  }
  //get long URL and generate random short URL
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  //save both to URL database
  urlDatabase[shortURL] = {
    longURL,
    userID: userId
  };
  //redirect to page that shows shortURL now
  res.redirect(`/urls/${shortURL}`);
});



//ROUTE FOR URL REDIRECTION
app.get("/u/:id", (req, res) => {
  //get shortURl: from req
  const shortURL = req.params.id;
  //look up longURL in database
  const urlData = urlDatabase[shortURL];
  //check is shortURL exists
  if (!urlData) {
    return res.status(404).send("<html><body><h3>404 Error: short URL does not exist.</h3></body></html>")
  }
  //redirect to longURL if found
    res.redirect(urlData.longURL);
    });



//HOME ROUTE
app.get("/", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId] || null;
  const error = "Please login to view/create URLs";
  res.render("urls_index", { user, error });
});



//JSON ENDPOINT
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



//HELLO ROUTE
app.get("/hello", (req, res) => {
  const templateVars = { user: users[req.session.user_id] || "" };
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



//URL DELETION ROUTE
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id;
  const urlData = urlDatabase[id];

  //check if user is logged in 
  if (!userId || !users[userId]) {
    return res.status(401).send("You must be logged in to delete urls")
  }

  if (!urlData || urlData.userID !== userId) {
    return res.status(403).send("Access denied. You cannot delete this URL.")
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});



//GET /LOGIN ROUTE
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  if (userId && users[userId]) {
    return res.redirect("/urls")
  }
  const templateVars = { user: null };
  res.render("login", templateVars);
});



//ROUTE FOR LOGIN
app.post("/login", (req, res) => {
  const email = req.body.email;
  //use user/pword fields
  const password = req.body.password
  const user = getUserByEmail(email, users);
//authenticate + set cookie + redirect
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    res.redirect('/urls');
  } else {
    res.status(401).send("User not found")
  }
  });



//ROUTE FOR LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});



//ROUTE FOR REGISTRATION
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  if (userId && users[userId]) {
    return res.redirect("/urls");
  }
  const templateVars = { user: null, error: null };
  res.render("register", templateVars);
});



//POST /REGISTER ENDPOINT
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //check for empty email or pword
  if (!email || !password) {
    return res.status(400).render("register", {
      user: null,
      error: "Email and password fields cannot be empty"
    });
  }

  //check if email exists + incorporate getuserbyemail 
 const currentUser = getUserByEmail(email, users);
 if (currentUser) {
  return res.status(400).render("register", {
    user: null, //add to make sure user is defined before rendering
    error: "Email already exists."
  });
 }
 //use bcrypt/hash
 const hashedPassword = bcrypt.hashSync(password, 10);

  //genereate random user id
  const userId = generateRandomString();

  //add new user to users object
  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword,
  };

  //set user_id cookie w/ user's new Id
  req.session.user_id = userId;

  //users object testing/debugging
  console.log('Users:', users);
  console.log('User ID cookie:', req.session['user_id']);

  //redirect
  res.redirect('/urls');
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});