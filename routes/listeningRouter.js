const Router = require("express");
const router = new Router();
const listeningController = require("../controllers/listeningController");
const auth = require("../middleware/auth");
//const authAdmin = require("../middleware/authAdmin");
//const {body} = require('express-validator')

// begin

// router.get("/", listeningController.getAll); // auth
// router.get("/:id", listeningController.getOne); // auth
router.post("/", listeningController.create); // auth authAdmin
// router.put("/:id", listeningController.update); // auth authAdmin
// router.delete("/:id", listeningController.delete); // auth authAdmin

// router.get("/:id/test/", listeningController.getAllTest);
// router.post("/:id/test/", listeningController.createTest);
// router.put("/:id/test/:id", listeningController.updateTest);
// router.delete("/:id/test/:id", listeningController.deleteTest);

// end

//router.post("/upload", listeningController.uploadAudio);
// router.post(
//   "/file/imageDelete",
//   auth,
//   authAdmin,
//   grammarController.deleteImage
// );

module.exports = router;
