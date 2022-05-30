const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Listening = sequelize.define(
  "listening",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, unique: true },
    fileName: { type: DataTypes.STRING, unique: true },
    published: { type: DataTypes.BOOLEAN, defaultValue: false },
    fullAccess: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { timestamps: false }
);

const ListeningTest = sequelize.define(
  "listening_test",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    questions: { type: DataTypes.STRING },
    answer: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { timestamps: false }
);

Listening.hasMany(ListeningTest, { onDelete: "cascade" });
ListeningTest.belongsTo(Listening);

module.exports = {
  Listening,
  ListeningTest,
};
