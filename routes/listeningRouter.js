const Router = require("express");
const router = new Router();
const listeningController = require("../controllers/listeningController");
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");
//const {body} = require('express-validator')

// begin

router.get("/", auth, listeningController.getAll);
router.get("/:id", auth, listeningController.getOne);
router.post("/", listeningController.create); // auth, authAdmin,
router.put("/:id", auth, authAdmin, listeningController.update);
router.delete("/:id", auth, authAdmin, listeningController.delete);

router.get("/:id/test/", listeningController.getAllTest);
router.post("/:id/test/", listeningController.createTest); //auth, authAdmin,
router.put("/:id/test/:_id", listeningController.updateTest);
router.delete("/test/:id", listeningController.deleteTest);

// end

//router.post("/upload", listeningController.uploadAudio);
// router.post(
//   "/file/imageDelete",
//   auth,
//   authAdmin,
//   grammarController.deleteImage
// );

module.exports = router;
