const Router = require('express')
const router = new Router()
const authController = require('../controllers/authController')
const auth = require('../middleware/auth')

router.post('/registration', authController.registration)
router.post('/activation', authController.activation)
router.post('/login', authController.login)
router.post('/refresh', authController.refresh)
router.post('/forgot', authController.forgotPassword)
router.post('/reset', auth, authController.resetPassword)
router.post('/logout', authController.logout)



module.exports = router