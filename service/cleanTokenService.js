const cron = require("node-cron");
const { Token } = require("../models/authModel");
const { Op } = require("sequelize");
const task = cron.schedule("0 0 0 1 */1 *", async () => {
  let date = new Date(new Date().getTime());
  await Token.destroy({ where: { expiresIn: { [Op.lt]: date } } });
});

module.exports = { task };
