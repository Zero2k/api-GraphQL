export default `
  type LoginResponse {
    success: Boolean!
    token: String
    errors: String
  }

  type UserResponse {
    success: Boolean!
    user: User
    errors: String
  }

  type DeleteRespons {
    success: Boolean!
    errors: String
  }
`;
