const { assert } = require('chai');
const { getUserByEmail } = require('../helper.js'); // Check for any typos or missing characters


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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("[email protected]", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedUserID);
  });
});