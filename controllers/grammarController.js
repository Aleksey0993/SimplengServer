//const bcrypt = require('bcrypt')
const { User } = require("../models/authModel");
const { Grammar } = require("../models/grammarModel");
const { Op } = require("sequelize");
//const tokenService = require('../service/tokenService')
//const mailService = require('../service/mailService')
//const UserDto = require('../dtos/user-dto')
//const { validationResult } = require('express-validator');
const getPagination = (page, size) => {
  page = +page || 1;
  const limit = +size || 10;
  const offset = page * limit - limit;
  return { limit, offset };
};
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: grammars } = data;
  const currentPage = +page || 1;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, grammars, totalPages, currentPage };
};
class GrammarController {
  async getAll(req, res) {
    try {
      // let {brandId, typeId, limit, page} = req.query
      const user = await User.findByPk(req.user.id);
      const { size, page } = req.query;
      const { title } = req.body;
      let conditionPublished = [true];
      if (user.role === "ADMIN") {
        conditionPublished = [true, false];
      }

      const condition = title
        ? {
            title: { [Op.iLike]: `%${title}%` },
            published: { [Op.in]: conditionPublished },
          }
        : { published: { [Op.in]: conditionPublished } };
      const { limit, offset } = getPagination(page, size);
      const data = await Grammar.findAndCountAll({
        where: condition,
        limit,
        offset,
      });
      const response = getPagingData(data, page, limit);
      return res.json(response);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }

  async listUser(req, res) {
    try {
      const users = await User.findAll();
      return res.json({ users: users });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }

  async addUser(req, res) {
    try {
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
}

module.exports = new GrammarController();
