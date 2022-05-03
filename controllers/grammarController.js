//const bcrypt = require('bcrypt')
const uuid = require("uuid");
const path = require("path");
const { User } = require("../models/authModel");
const { Grammar } = require("../models/grammarModel");
const { Op } = require("sequelize");
const fs = require("fs");
const { Sequelize } = require("../db");
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

      const { size, page, title } = req.query;

      console.log("ttiiiiiiiitleeee-", size, " - ", page, " - ", title);
      const user = await User.findByPk(req.user.id);
      //const user = await User.findByPk(id);
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
      console.log("limit", limit);
      console.log("offset", offset);
      const data = await Grammar.findAndCountAll({
        order: ["id"],
        where: condition,
        limit,
        offset,
      });
      const response = getPagingData(data, page, limit);
      console.log("RESPONSE", response);
      return res.json(response);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const { id } = req.params;
      const data = await Grammar.findByPk(id);

      res.json(data);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }

  async create(req, res) {
    try {
      const { title, description, published } = req.body;
      if (!title) {
        return res
          .status(400)
          .json({ msg: "Пожалуйста укажите название темы!" });
      }
      console.log("новое название темы - ", title.length);
      const repeatTitle = await Grammar.findOne({ where: { title: title } });
      if (repeatTitle) {
        return res
          .status(400)
          .json({ msg: `Данное название темы уже существует! ` });
      }
      const data = await Grammar.create({ title, description, published });
      console.log("created grammar --- ", data);
      return res
        .status(201)
        .json({ msg: `Тема ${data.dataValues.title} успешно создана!` });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, published } = req.body;
      const data = await Grammar.update(
        {
          title,
          description,
          published,
        },
        { where: { id: id } }
      );
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async delete(req, res) {
    try {
      const { id } = req.params;
      const data = await Grammar.destroy({ where: { id: id } });
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }

  async uploadImage(req, res) {
    try {
      // const { id } = req.params;
      // const data = await Grammar.findByPk(id);
      console.log("ВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВВ");
      console.log(req.files);
      const { image } = req.files;
      let fileName = uuid.v4() + ".jpg";
      image.mv(path.resolve(__dirname, "..", "static", fileName));
      res.json({ url: `http://localhost:5000/${fileName}` });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async deleteImage(req, res) {
    try {
      // const { id } = req.params;
      // const data = await Grammar.findByPk(id);
      console.log("удааааалееееениееее");
      const { fileName } = req.body;
      console.log(fileName);
      const fullPath = path.resolve(__dirname, "..", "static", fileName);
      fs.unlinkSync(fullPath);
      // const { image } = req.files;
      // let fileName = uuid.v4() + ".jpg";
      // image.mv(path.resolve(__dirname, "..", "static", fileName));
      // res.json({ url: `http://localhost:5000/${fileName}` });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
}

module.exports = new GrammarController();
