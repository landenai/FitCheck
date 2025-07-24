// Mock in-memory database
let users = [];
let clubs = [];
let classes = [];

const initializeDatabase = () => {
  // Seed Users
  users = [
    {
      userId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      name: "Alice Access",
      membershipType: "ALL_ACCESS",
      subscriptionStatus: "ACTIVE",
      homeClubId: null,
      checkedInClubId: null
    },
    {
      userId: "b2c3d4e5-f6a7-8901-2345-67890abcdef1",
      name: "Steve Single",
      membershipType: "SINGLE_CLUB",
      homeClubId: "club-nyc-hudson-yards",
      subscriptionStatus: "ACTIVE",
      checkedInClubId: null
    },
    {
      userId: "d4e5f6a7-b8c9-0123-4567-890abcdef123",
      name: "Connie Class",
      membershipType: "CLASS_ACCESS",
      subscriptionStatus: "ACTIVE",
      homeClubId: null,
      checkedInClubId: null
    },
    {
      userId: "c3d4e5f6-a7b8-9012-3456-7890abcdef12",
      name: "Inactive Irene",
      membershipType: "ALL_ACCESS",
      subscriptionStatus: "INACTIVE",
      homeClubId: null,
      checkedInClubId: null
    }
  ];

  // Seed Clubs
  clubs = [
    { 
      clubId: "club-nyc-hudson-yards", 
      name: "The Sports Club Hudson Yards" 
    },
    { 
      clubId: "club-la-sports-club", 
      name: "The Sports Club LA" 
    }
  ];

  // Seed Classes
  classes = [
    { 
      classId: "class-nyc-yoga-101", 
      name: "Vinyasa Yoga", 
      clubId: "club-nyc-hudson-yards" 
    },
    { 
      classId: "class-nyc-spin-201", 
      name: "Power Spin", 
      clubId: "club-nyc-hudson-yards" 
    },
    { 
      classId: "class-la-pilates-101", 
      name: "Mat Pilates", 
      clubId: "club-la-sports-club" 
    },
    { 
      classId: "class-la-hiit-301", 
      name: "Advanced HIIT", 
      clubId: "club-la-sports-club" 
    }
  ];

  console.log('📊 Database initialized with seed data');
  console.log(`👥 Users: ${users.length}`);
  console.log(`🏢 Clubs: ${clubs.length}`);
  console.log(`🏃 Classes: ${classes.length}`);
};

// Database query functions
const findUserById = (userId) => {
  return users.find(user => user.userId === userId);
};

const findClubById = (clubId) => {
  return clubs.find(club => club.clubId === clubId);
};

const findClassById = (classId) => {
  return classes.find(cls => cls.classId === classId);
};

const updateUserCheckIn = (userId, clubId) => {
  const userIndex = users.findIndex(user => user.userId === userId);
  if (userIndex !== -1) {
    users[userIndex].checkedInClubId = clubId;
    return users[userIndex];
  }
  return null;
};

const getAllUsers = () => users;
const getAllClubs = () => clubs;
const getAllClasses = () => classes;

module.exports = {
  initializeDatabase,
  findUserById,
  findClubById,
  findClassById,
  updateUserCheckIn,
  getAllUsers,
  getAllClubs,
  getAllClasses
}; 