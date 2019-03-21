class User {
  constructor(id, username, email, password, createdAt, resetPasswordToken, resetPasswordExpires) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
    this.resetPasswordToken = resetPasswordToken;
    this.resetPasswordExpires = resetPasswordExpires;
  }
}

export default User;
