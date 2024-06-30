//function to find user by email
export function getUserByEmail(email, database) {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};



export function urlsForUser(userID, urlDatabase) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}


//generate random string of 6 characters
export function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result+= characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};