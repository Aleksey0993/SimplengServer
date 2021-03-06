const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const User = sequelize.define(
  "user",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, defaultValue: "USER" },
  },
  { timestamps: false }
);

const Token = sequelize.define(
  "token",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    refreshToken: { type: DataTypes.STRING },
    fingerprint: { type: DataTypes.STRING },
    expiresIn: DataTypes.DATE,
  },
  { timestamps: false }
);

User.hasMany(Token, { onDelete: "cascade" });
Token.belongsTo(User);

module.exports = {
  User,
  Token,
};
