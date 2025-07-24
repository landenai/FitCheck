// Example GraphQL queries and mutations for testing the FitCheck API
// You can run these in the GraphQL Playground at http://localhost:4000/graphql

// ============================================================================
// QUERIES
// ============================================================================

// Get all users
const getAllUsers = `
query {
  users {
    userId
    name
    membershipType
    subscriptionStatus
    homeClubId
    checkedInClubId
  }
}
`;

// Get all clubs
const getAllClubs = `
query {
  clubs {
    clubId
    name
  }
}
`;

// Get all classes
const getAllClasses = `
query {
  classes {
    classId
    name
    clubId
  }
}
`;

// Get specific user
const getUser = `
query {
  user(userId: "a1b2c3d4-e5f6-7890-1234-567890abcdef") {
    userId
    name
    membershipType
    subscriptionStatus
    homeClubId
    checkedInClubId
  }
}
`;

// ============================================================================
// MUTATIONS - CLUB CHECK-INS
// ============================================================================

// Alice (ALL_ACCESS) - Should succeed
const aliceClubCheckIn = `
mutation {
  checkInClub(input: {
    userId: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
    clubId: "club-nyc-hudson-yards"
  }) {
    success
    message
  }
}
`;

// Steve (SINGLE_CLUB) - Should succeed (home club)
const steveHomeClubCheckIn = `
mutation {
  checkInClub(input: {
    userId: "b2c3d4e5-f6a7-8901-2345-67890abcdef1"
    clubId: "club-nyc-hudson-yards"
  }) {
    success
    message
  }
}
`;

// Steve (SINGLE_CLUB) - Should fail (wrong club)
const steveWrongClubCheckIn = `
mutation {
  checkInClub(input: {
    userId: "b2c3d4e5-f6a7-8901-2345-67890abcdef1"
    clubId: "club-la-sports-club"
  }) {
    success
    message
  }
}
`;

// Irene (INACTIVE) - Should fail
const inactiveUserCheckIn = `
mutation {
  checkInClub(input: {
    userId: "c3d4e5f6-a7b8-9012-3456-7890abcdef12"
    clubId: "club-nyc-hudson-yards"
  }) {
    success
    message
  }
}
`;

// ============================================================================
// MUTATIONS - CLASS CHECK-INS
// ============================================================================

// Alice (ALL_ACCESS) - Should succeed
const aliceClassCheckIn = `
mutation {
  checkInClass(input: {
    userId: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
    classId: "class-nyc-yoga-101"
  }) {
    success
    message
  }
}
`;

// Connie (CLASS_ACCESS) - Should succeed
const connieClassCheckIn = `
mutation {
  checkInClass(input: {
    userId: "d4e5f6a7-b8c9-0123-4567-890abcdef123"
    classId: "class-nyc-yoga-101"
  }) {
    success
    message
  }
}
`;

// Steve (SINGLE_CLUB) - Should fail (not checked into club)
const steveClassCheckInWithoutClub = `
mutation {
  checkInClass(input: {
    userId: "b2c3d4e5-f6a7-8901-2345-67890abcdef1"
    classId: "class-nyc-yoga-101"
  }) {
    success
    message
  }
}
`;

// Steve (SINGLE_CLUB) - Should succeed (after checking into club first)
const steveClassCheckInWithClub = `
mutation {
  checkInClass(input: {
    userId: "b2c3d4e5-f6a7-8901-2345-67890abcdef1"
    classId: "class-nyc-yoga-101"
  }) {
    success
    message
  }
}
`;

// ============================================================================
// TESTING SEQUENCE
// ============================================================================

console.log(`
FitCheck GraphQL API Test Examples
==================================

To test the API:

1. Start the server: npm start
2. Open GraphQL Playground: http://localhost:4000/graphql
3. Copy and paste the queries below

QUERIES:
--------
${getAllUsers}

${getAllClubs}

${getAllClasses}

${getUser}

CLUB CHECK-INS:
---------------
Alice (ALL_ACCESS) - Should succeed:
${aliceClubCheckIn}

Steve (SINGLE_CLUB) - Should succeed (home club):
${steveHomeClubCheckIn}

Steve (SINGLE_CLUB) - Should fail (wrong club):
${steveWrongClubCheckIn}

Irene (INACTIVE) - Should fail:
${inactiveUserCheckIn}

CLASS CHECK-INS:
----------------
Alice (ALL_ACCESS) - Should succeed:
${aliceClassCheckIn}

Connie (CLASS_ACCESS) - Should succeed:
${connieClassCheckIn}

Steve (SINGLE_CLUB) - Should fail (not checked into club):
${steveClassCheckInWithoutClub}

Steve (SINGLE_CLUB) - Should succeed (after checking into club first):
${steveClassCheckInWithClub}

Note: For the last test, first run the Steve home club check-in, then the class check-in.
`);

module.exports = {
  getAllUsers,
  getAllClubs,
  getAllClasses,
  getUser,
  aliceClubCheckIn,
  steveHomeClubCheckIn,
  steveWrongClubCheckIn,
  inactiveUserCheckIn,
  aliceClassCheckIn,
  connieClassCheckIn,
  steveClassCheckInWithoutClub,
  steveClassCheckInWithClub
}; 