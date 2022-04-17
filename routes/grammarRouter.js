const Router = require('express')
const router = new Router()
const grammarController = require('../controllers/grammarController')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')
//const {body} = require('express-validator')


router.get('/user', auth, grammarController.listUser)
router.post('/user', auth, authAdmin, grammarController.addUser)



module.exports = router