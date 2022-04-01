const Router = require('express')
const router = new Router()
const authRouter = require('./authRouter')
//const userRouter = require('./userRouter')
//const brandRouter = require('./brandRouter')
//const typeRouter = require('./typeRouter')

router.use('/auth', authRouter)
//router.use('/type', typeRouter)
//router.use('/brand', brandRouter)
//router.use('/device', deviceRouter)

module.exports = router
