# FitCheck GraphQL Backend Service

A Node.js GraphQL service that demonstrates Sentry Performance Tracing for monitoring backend operations in a fitness club check-in system.

## 🏗️ Architecture

- **Runtime**: Node.js with Express
- **API**: GraphQL (Apollo Server Express)
- **Database**: Mock in-memory object store
- **Monitoring**: @sentry/node and @sentry/tracing

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up Sentry (optional):
```bash
export SENTRY_DSN="your-sentry-dsn-here"
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:4000/graphql`

## 📊 Data Models

### Users
- **Alice Access**: ALL_ACCESS membership, active subscription
- **Steve Single**: SINGLE_CLUB membership, active subscription, home club: Hudson Yards
- **Connie Class**: CLASS_ACCESS membership, active subscription
- **Inactive Irene**: ALL_ACCESS membership, inactive subscription

### Clubs
- The Sports Club Hudson Yards (`club-nyc-hudson-yards`)
- The Sports Club LA (`club-la-sports-club`)

### Classes
- Vinyasa Yoga (Hudson Yards)
- Power Spin (Hudson Yards)
- Mat Pilates (LA)
- Advanced HIIT (LA)

## 🔌 GraphQL API

### Queries

#### Get all users
```graphql
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
```

#### Get specific user
```graphql
query {
  user(userId: "a1b2c3d4-e5f6-7890-1234-567890abcdef") {
    userId
    name
    membershipType
    subscriptionStatus
  }
}
```

### Mutations

#### Check into Club
```graphql
mutation {
  checkInClub(input: {
    userId: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
    clubId: "club-nyc-hudson-yards"
  }) {
    success
    message
  }
}
```

#### Check into Class
```graphql
mutation {
  checkInClass(input: {
    userId: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
    classId: "class-nyc-yoga-101"
  }) {
    success
    message
  }
}
```

## 🧪 Business Logic

### Club Check-in Rules
1. **ALL_ACCESS**: Can check into any club
2. **SINGLE_CLUB**: Can only check into their home club (includes 150ms delay for verification)
3. **CLASS_ACCESS**: Cannot check into clubs directly

### Class Check-in Rules
1. **Club Access Path**: User must be checked into the same club as the class
2. **Membership Access Path**: User must have CLASS_ACCESS or ALL_ACCESS membership

## 📈 Sentry Tracing

The application includes comprehensive Sentry tracing with custom spans:

### checkInClub Transaction
- `db.query.user`: User lookup
- `logic.verify_subscription`: Subscription verification
- `db.query.verify_location`: Home club verification (SINGLE_CLUB only, includes 150ms delay)

### checkInClass Transaction
- `db.query.user_and_class`: Initial data lookup
- `logic.verify_subscription`: Subscription verification
- `logic.verify_access_path`: Access path verification

### Tags
- `membership.type`: User's membership type
- `check_in.outcome`: Success/failed/error
- `check_in.failure_reason`: Specific failure reason
- `check_in.access_path`: Class access path used

## 🧪 Testing Scenarios

### Successful Check-ins
1. **Alice (ALL_ACCESS)** → Any club/class ✅
2. **Steve (SINGLE_CLUB)** → Hudson Yards club/class ✅
3. **Connie (CLASS_ACCESS)** → Any class (if checked into club) ✅

### Failed Check-ins
1. **Steve (SINGLE_CLUB)** → LA club ❌
2. **Inactive Irene** → Any club/class ❌
3. **Connie (CLASS_ACCESS)** → Club check-in ❌

## 🔧 Environment Variables

- `PORT`: Server port (default: 4000)
- `SENTRY_DSN`: Sentry DSN for monitoring

## 📁 Project Structure

```
src/
├── index.js          # Main server entry point
├── schema.js         # GraphQL schema definition
├── resolvers.js      # GraphQL resolvers with business logic
└── database.js       # Mock database and data access functions
```

## 🚀 Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run tests
npm test
```

## 📝 API Testing

You can test the API using the GraphQL Playground at `http://localhost:4000/graphql` or with tools like:

- GraphQL Playground
- Insomnia
- Postman
- curl

Example curl request:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { checkInClub(input: {userId: \"a1b2c3d4-e5f6-7890-1234-567890abcdef\", clubId: \"club-nyc-hudson-yards\"}) { success message } }"}' \
  http://localhost:4000/graphql
``` 