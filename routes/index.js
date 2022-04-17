const Router = require('express')
const router = new Router()
const authRouter = require('./authRouter')
const grammarRouter = require('./grammarRouter')
//const userRouter = require('./userRouter')
//const brandRouter = require('./brandRouter')
//const typeRouter = require('./typeRouter')

router.use('/auth', authRouter)
router.use('', grammarRouter)
//router.use('/brand', brandRouter)
//router.use('/device', deviceRouter)

module.exports = router
