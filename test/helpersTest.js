import { assert } from 'chai';
import { getUserByEmail } from '../helpers.js';
import { urlsForUser } from '../helpers.js';



const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "[email protected]", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "[email protected]", 
    password: "dishwasher-funk"
  }
};

//getUserByEmail TESTS

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("[email protected]", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined for a non-existent email', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isUndefined(user);
  });
});


//urlsForUser TESTS

describe('urlsForUser', function() {
  it('should return urls that belong to the specified user', function() {
    // Define test data
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
      "9sm5xK": { longURL: "http://www.google.com", userID: "user2" },
      "a1b2c3": { longURL: "http://www.example.com", userID: "user1" }
    };

    // Define expected output
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
      "a1b2c3": { longURL: "http://www.example.com", userID: "user1" }
    };

    // Call the function with userId 'user1'
    const result = urlsForUser('user1', urlDatabase);

    // Assert that the result matches the expected output
    assert.deepEqual(result, expectedOutput);
  });

  it('should return an empty object if the user has no URLs', function() {
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
      "9sm5xK": { longURL: "http://www.google.com", userID: "user2" }
    };

    const expectedOutput = {};

    const result = urlsForUser('user3', urlDatabase);
    assert.deepEqual(result, expectedOutput);
  });

  it('should return an empty object if the urlDatabase is empty', function() {
    const urlDatabase = {};

    const expectedOutput = {};

    const result = urlsForUser('user1', urlDatabase);
    assert.deepEqual(result, expectedOutput);
  });

  it('should not return urls that don\'t belong to the specified user', function() {
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
      "9sm5xK": { longURL: "http://www.google.com", userID: "user2" },
      "a1b2c3": { longURL: "http://www.example.com", userID: "user1" }
    };

    const result = urlsForUser('user2', urlDatabase);

    // Verify that none of the URLs in result belong to user1
    assert.notInclude(Object.keys(result), "b2xVn2");
    assert.notInclude(Object.keys(result), "a1b2c3");
  });
});