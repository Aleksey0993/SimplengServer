const Router = require("express");
const router = new Router();
const authRouter = require("./authRouter");
const grammarRouter = require("./grammarRouter");
const listeningRouter = require("./listeningRouter");
//const userRouter = require('./userRouter')
//const brandRouter = require('./brandRouter')
//const typeRouter = require('./typeRouter')

router.use("/auth", authRouter);
router.use("/grammar", grammarRouter);
router.use("/listening", listeningRouter);
//router.use('/brand', brandRouter)
//router.use('/device', deviceRouter)

module.exports = router;
