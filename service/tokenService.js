const jwt = require("jsonwebtoken");
//const tokenModel = require('../models/token-model');
const { Token } = require("../models/authModel");
class TokenService {
  createResetPasswordToken(payload) {
    return jwt.sign(payload, process.env.RESETPASSWORD_TOKEN_SECRET, {
      expiresIn: "3m",
    });
  }
  validateResetPasswordToken(token) {
    try {
      const data = jwt.verify(token, process.env.RESETPASSWORD_TOKEN_SECRET);
      return data;
    } catch (e) {
      return null;
    }
  }

  createActivationToken(payload) {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {
      expiresIn: "5m",
    });
  }

  validateActivationToken(token) {
    try {
      const data = jwt.verify(token, process.env.ACTIVATION_TOKEN_SECRET);
      return data;
    } catch (e) {
      return null;
    }
  }

  createAccessToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
  }

  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }

  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "20d",
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async saveToken(userId, refreshToken, fingerprint) {
    const tokenData = await Token.findOne({
      where: { userId: userId, fingerprint: fingerprint },
    });
    if (tokenData) {
      const expiresIn = new Date(
        new Date().getTime() + 30 * 24 * 60 * 60 * 1000
      );
      return await Token.update(
        { refreshToken: refreshToken, expiresIn: expiresIn },
        {
          where: {
            userId: userId,
            fingerprint: fingerprint,
          },
        }
      );
    }
    let count = await Token.count({ where: { userId: userId } });
    count++;
    if (count > 2) {
      await Token.destroy({ where: { userId: userId } });
      const expiresIn = new Date(
        new Date().getTime() + 30 * 24 * 60 * 60 * 1000
      );
      const token = await Token.create({
        userId: userId,
        refreshToken,
        fingerprint,
        expiresIn,
      });
      return token;
    }

    const expiresIn = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
    console.log("expiresIn - ", expiresIn);
    const token = await Token.create({
      userId: userId,
      refreshToken,
      fingerprint,
      expiresIn,
    });
    return token;
  }

  async removeToken(refreshToken) {
    await Token.destroy({ where: { refreshToken } });
  }

  async findToken(refreshToken) {
    const tokenData = await Token.findOne({ where: { refreshToken } });
    return tokenData;
  }
}

module.exports = new TokenService();
