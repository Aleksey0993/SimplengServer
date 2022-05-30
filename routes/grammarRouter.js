const Router = require("express");
const router = new Router();
const grammarController = require("../controllers/grammarController");
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");
//const {body} = require('express-validator')

//router.get("/user", auth, grammarController.listUser);
///router.post("/user", auth, authAdmin, grammarController.addUser);
router.get("/", auth, grammarController.getAll);
router.get("/:id", auth, grammarController.getOne);
router.post("/", auth, authAdmin, grammarController.create);
router.put("/:id", auth, authAdmin, grammarController.update);
router.delete("/:id", auth, authAdmin, grammarController.delete);
router.post("/upload", auth, authAdmin, grammarController.uploadImage);
//router.post("/upload", grammarController.uploadImage);
router.post(
  "/file/imageDelete",
  auth,
  authAdmin,
  grammarController.deleteImage
);

module.exports = router;
