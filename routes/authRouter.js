const Router = require('express')
const router = new Router()
const authController = require('../controllers/authController')
//const auth = require('../middleware/auth')
const {body} = require('express-validator')

router.post('/registration',
             body('email')
            .trim().isEmail().normalizeEmail()
             .withMessage('Некорректный email. '),
              body('password').isStrongPassword({
                                minLength: 8,
                                minLowercase: 1,
                                minUppercase: 1,
                                minNumbers: 1
                            }).withMessage('Пароль должен содержать не менее 8 символов и включать как минимум один специальный символ, одну цифру, одну прописную и одну строчную букву. ')
                            //.//  .isLowercase({min:1})
                            // .withMessage('Пароль должен иметь хотя бы 1 символ в нижнем регистре ')
                            // .isUppercase({min:1})
                            //  .withMessage('Пароль должен иметь хотя бы 1 символ в верхнем регистре ')
                            //  .isNumeric({min:1})
                            //  .withMessage('Пароль должен содержать  числа')
                            //  .isLength({min:4})
                            //  .withMessage('длина пароля должна быть больше 4 символов')
                             //  .isSymbols({min:1})
                            //  .withMessage('')
              
             , authController.registration)
router.post('/activation', authController.activation)
router.post('/login',
                body('email')
                .trim().isEmail().normalizeEmail()
                .withMessage('Некорректный email... '), authController.login)
router.post('/refresh', authController.refresh)
router.post('/forgot',
               body('email')
               .trim().isEmail().normalizeEmail()
               .withMessage('Некорректный email. '),
              authController.forgotPassword)
router.post('/reset',  body('password').isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1
}).withMessage('Пароль должен содержать не менее 8 символов и включать как минимум один специальный символ, одну цифру, одну прописную и одну строчную букву. '),
               authController.resetPassword)


router.get('/logout', authController.logout)



module.exports = router