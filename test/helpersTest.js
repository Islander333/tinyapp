import { assert } from 'chai';
import { getUserByEmail } from '../helpers.js';


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

  it('should return undefined for a non-existent email', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isUndefined(user);
  });
});