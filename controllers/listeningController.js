//const bcrypt = require('bcrypt')
const uuid = require("uuid");
const path = require("path");
const { User } = require("../models/authModel");
const { Listening, ListeningTest } = require("../models/listeningModel");
//const { Grammar } = require("../models/grammarModel");
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
  const { count: totalItems, rows: listening } = data;
  const currentPage = +page || 1;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, listening, totalPages, currentPage };
};
class ListeningController {
  async getAll(req, res) {
    try {
      // let {brandId, typeId, limit, page} = req.query

      const { size, page, title } = req.query;

      //const user = await User.findByPk(req.user.id);
      //const user = await User.findByPk(id);
      let conditionPublished = [true];
      let conditionFullAccess = [true, false];

      if (req.user.role == "USER") {
        conditionFullAccess = [false];
      }

      if (req.user.role === "ADMIN") {
        conditionPublished = [true, false];
      }

      const condition = title
        ? {
            title: { [Op.iLike]: `%${title}%` },
            published: { [Op.in]: conditionPublished },
            fullAccess: { [Op.in]: conditionFullAccess },
          }
        : {
            published: { [Op.in]: conditionPublished },
            fullAccess: { [Op.in]: conditionFullAccess },
          };
      const { limit, offset } = getPagination(page, size);

      const data = await Listening.findAndCountAll({
        order: ["id"],
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

  async getOne(req, res) {
    try {
      const { id } = req.params;
      const data = await Listening.findByPk(id);
      console.log("daataaa - ", data);
      if (!data) {
        return res.status(404).json({ msg: "Данных нет" });
      }
      if (data.dataValues.fullAccess && req.user.role == "USER") {
        return res.status(403).json({ msg: "Нет доступа" });
      }

      return res.json(data);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }

  async create(req, res) {
    try {
      if (!req.files) {
        return res.status(400).json({ msg: "Пожалуйста загрузите файл" });
      }
      const { audio } = req.files;
      console.log("00000000000000000000- ", audio);
      if (!audio.mimetype.includes("audio")) {
        return res.status(400).json({ msg: "Файл должен быть аудиофайлом" });
      }

      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ msg: "Пожалуйста укажите название" });
      }
      // return res.status(400).json({ msg: "Пожалуйста укажите название!!!!" });
      // console.log("новое название темы - ", title.length);
      const repeatTitle = await Listening.findOne({ where: { title: title } });
      if (repeatTitle) {
        return res
          .status(400)
          .json({ msg: `Данное название темы уже существует! ` });
      }

      let fileName = "audio_" + uuid.v4() + ".mp3";
      audio.mv(path.resolve(__dirname, "..", "static/audio", fileName));

      const data = await Listening.create({ title, fileName });
      console.log("created grammar --- ", data.dataValues.id);
      return res.status(201).json({
        msg: `Тема ${data.dataValues.title} успешно создана!`,
        id: data.dataValues.id,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, published, fullAccess } = req.body;
      await Listening.update(
        {
          title,
          published,
          fullAccess,
        },
        { where: { id: id } }
      );
      return res.json({ msg: `Успешно сохранено!` });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async delete(req, res) {
    try {
      const { id } = req.params;
      const data = await Listening.findByPk(id);
      console.log("delete - ", data.dataValues.fileName);
      const fullPath = path.resolve(
        __dirname,
        "..",
        "static/audio",
        data.dataValues.fileName
      );
      fs.unlinkSync(fullPath);
      await Listening.destroy({ where: { id: id } });

      return res.json({ msg: `Успешно удалено!` });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }

  async getAllTest(req, res) {
    try {
      const { id } = req.params;
      const data = await ListeningTest.findAll({
        order: ["id"],
        where: { listeningId: id },
      });
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }

  async createTest(req, res) {
    try {
      const { questions, answer } = req.body;
      const { id } = req.params;
      if (!questions) {
        return res.status(400).json({ msg: "Пожалуйста укажите название" });
      }
      // return res.status(400).json({ msg: "Пожалуйста укажите название!!!!" });
      // console.log("новое название темы - ", title.length);
      // const repeatTitle = await Listening.findOne({ where: { title: title } });
      // if (repeatTitle) {
      //   return res
      //     .status(400)
      //     .json({ msg: `Данное название темы уже существует! ` });
      // }

      // let fileName = "audio_" + uuid.v4() + ".mp3";
      // audio.mv(path.resolve(__dirname, "..", "static/audio", fileName));

      const newData = await ListeningTest.create({
        questions,
        answer,
        listeningId: id,
      });
      const data = {
        id: newData.dataValues.id,
        questions: newData.dataValues.questions,
        answer: newData.dataValues.answer,
      };
      //  console.log("created grammar --- ", data.dataValues.id);
      return res.status(201).json(data);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }

  async updateTest(req, res) {
    try {
      const { id, _id } = req.params;

      const { questions, answer } = req.body;
      await ListeningTest.update(
        {
          questions,
          answer,
        },
        { where: { id: _id } }
      );
      return res.json({ msg: `Успешно сохранено!` });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async deleteTest(req, res) {
    try {
      const { id } = req.params;

      const data = await ListeningTest.destroy({ where: { id: id } });
      console.log("delete data", data);
      return res.json({ msg: `Успешно удалено!` });
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
      let fileName = "image_" + uuid.v4() + ".jpg";
      image.mv(path.resolve(__dirname, "..", "static/images", fileName));
      res.json({ url: `http://localhost:5000/images/${fileName}` });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async deleteImage(req, res) {
    try {
      // const { id } = req.params;
      // const data = await Grammar.findByPk(id);
      console.log("удааааалееееениееее");
      let { fileName } = req.body;
      fileName = fileName.slice(7);
      console.log(fileName);
      const fullPath = path.resolve(__dirname, "..", "static/images", fileName);
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

module.exports = new ListeningController();
