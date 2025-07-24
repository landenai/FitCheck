const { gql } = require('apollo-server-express');

const typeDefs = gql`
  enum MembershipType {
    ALL_ACCESS
    SINGLE_CLUB
    CLASS_ACCESS
  }

  enum SubscriptionStatus {
    ACTIVE
    INACTIVE
  }

  type User {
    userId: ID!
    name: String!
    membershipType: MembershipType!
    homeClubId: String
    subscriptionStatus: SubscriptionStatus!
    checkedInClubId: String
  }

  type Club {
    clubId: ID!
    name: String!
  }

  type Class {
    classId: ID!
    name: String!
    clubId: String!
  }

  input CheckInClubInput {
    userId: ID!
    clubId: ID!
  }

  input CheckInClassInput {
    userId: ID!
    classId: ID!
  }

  type CheckInResponse {
    success: Boolean!
    message: String!
  }

  type Query {
    users: [User!]!
    clubs: [Club!]!
    classes: [Class!]!
    user(userId: ID!): User
    club(clubId: ID!): Club
    class(classId: ID!): Class
  }

  type Mutation {
    checkInClub(input: CheckInClubInput!): CheckInResponse!
    checkInClass(input: CheckInClassInput!): CheckInResponse!
  }
`;

module.exports = { typeDefs }; 