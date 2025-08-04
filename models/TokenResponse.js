class TokenResponse {
  constructor(token, refreshToken, user) {
    this.token = token;
    this.refreshToken = refreshToken;
    this.user = user;
  }
}

module.exports = TokenResponse;
