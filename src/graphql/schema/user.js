export default `
  type User {
    id: Int
    username: String
    email: String
    createdAt: String
  }

  type Query {
    profiles(page: Int, limit: Int): [User]!
    profile(id: Int!): User
  }

  type Mutation {
    signUp(username: String!, email: String!, password: String!): UserResponse!
    signIn(email: String!, password: String!): LoginResponse!
    recovery(email: String!): Boolean!
    reset(token: String!, password: String!, confirm: String!): Boolean!
    update(username: String, email: String, password: String): UserResponse!
    delete: DeleteRespons!
  }
`;
