const bcrypt = require('bcrypt')
const {User} = require('../models/authModel')
const tokenService = require('../service/tokenService')
const mailService = require('../service/mailService')
const UserDto = require('../dtos/user-dto')
const { validationResult } = require('express-validator');
class AuthController {
    async registration(req, res) {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          const error = errors.array().reduce((err, item)=>{
            return err + item.msg
          },'')
         
           return res.status(400).json({ msg: error });
         }
        const {email, password} = req.body
        
        const user = await User.findOne({where:{email}}) 
       
        if(user) return res.status(400).json({msg:"Данный email уже существует."})
       
        const passwordHash = await bcrypt.hash(password, 12)

        const newUser = {
             email, password: passwordHash
        }

        const activation_token = tokenService.createActivationToken(newUser)

        const url = `${process.env.CLIENT_URL}/auth/activate/${activation_token}`
        await mailService.sendActivationMail(email, url)


        res.json({msg: `На ваш почтовый ящик ${email} было отправлено письмо для активации аккаунта!`})
      } catch (error) {
        return res.status(500).json({msg: error.message})
      }
    }
    async activation(req, res) {
        try {
            const {activation_token} = req.body
            const user = tokenService.validateActivationToken(activation_token)
            if(!user){
                return res.status(400).json({msg: "Время для активации истекло! Попробуйте зарегистрироваться снова!"}) 
            }
            const {email, password} = user

            const check = await User.findOne({where:{email}}) 
            if(check) return res.status(400).json({msg:`${email} уже активирован! Перейдите в личный кабинет для авторизации!`})
           
            await User.create({email,password})
            res.json({msg: "Поздравляем! Ваш аккаунт был успешно активирован! Перейдите в личный кабинет для авторизации!"})
            
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
      }


      async login(req, res) {
        try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            const error = errors.array().reduce((err, item)=>{
              return err + item.msg
            },'')
           
             return res.status(400).json({ msg: error });
           }
        const {email, password, fingerprint} = req.body;
             console.log('PASSWORD- ', password)
          const user = await User.findOne({where:{email}})
          if(!user){
            return res.status(400).json({msg:"Неверный логин или пароль!"})
          }
          const isPassEquals = await bcrypt.compare(password, user.password);
          if (!isPassEquals) {
            return res.status(400).json({msg:"Неверный логин или пароль!"})
           }
       
           const userDto = new UserDto(user);
       
           const tokens = tokenService.generateTokens({...userDto});
           
           await tokenService.saveToken(userDto.id, tokens.refreshToken, fingerprint);
           res.cookie('refreshToken', 
                        tokens.refreshToken, 
                        { maxAge: 30 * 24 * 60 * 60 * 1000,
                          path: '/api/auth', 
                          httpOnly: true}) 
         
           return res.json({accessToken:tokens.accessToken})
         
            
        } catch (error) {
          return res.status(500).json({msg: error.message})
        }
      }

      async refresh(req, res) {
        try {
          const {fingerprint} = req.body
          const {refreshToken} = req.cookies;
          console.log('REFRESHTOKEN')
          console.log(refreshToken)
            if (!refreshToken) {
              
              return res.status(401).json({msg: "Не авторизован"})
          }
          const userData = tokenService.validateRefreshToken(refreshToken);
          const tokenFromDb = await tokenService.findToken(refreshToken);
          if (!userData || !tokenFromDb) {
            console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
            return res.status(401).json({msg: "Не авторизован"})
          }
          
          const user = await User.findByPk(userData.id);
          const userDto = new UserDto(user);
          const tokens = tokenService.generateTokens({...userDto});
  
          await tokenService.saveToken(userDto.id, tokens.refreshToken, fingerprint);
          res.cookie('refreshToken', 
                       tokens.refreshToken, 
                       { maxAge: 30 * 24 * 60 * 60 * 1000,
                        path: '/api/auth', 
                         httpOnly: true}) 
        
          return res.json({accessToken:tokens.accessToken})


            
        } catch (error) {
          return res.status(500).json({msg: error.message})    
        }
      }


      async forgotPassword(req, res) {
        try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            const error = errors.array().reduce((err, item)=>{
              return err + item.msg
            },'')
           
             return res.status(400).json({ msg: error });
           }
            const {email} = req.body
            const user = await User.findOne({where:{email}})
            if(!user)  return res.status(400).json({msg:"Данный email не существует!!!!"})
           
           //const access_token = tokenService.createAccessToken({id: user.id})
           const reset_password_token = tokenService.createResetPasswordToken({id: user.id})
            const url = `${process.env.CLIENT_URL}/auth/reset/${reset_password_token}`
            await mailService.sendResetPasswordMail(email, url)
                      
            res.json({msg: "На вашу почту было отправлено письмо!!"})
            
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
      }
      async resetPassword(req, res) {
        try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            const error = errors.array().reduce((err, item)=>{
              return err + item.msg
            },'')
             return res.status(400).json({ msg: error });
           }
            const {password, reset_password_token} = req.body
            const user = tokenService.validateResetPasswordToken(reset_password_token)
            console.log('Сброс пароля - ', user)
            if(!user){
                return res.status(400).json({msg: "Время для сброса пароля истекло! Попробуйте снова!"}) 
            }
             const passwordHash = await bcrypt.hash(password, 12)

            await User.update({ password: passwordHash }, {
                where: {
                  id: user.id
                }
              });

            res.json({msg: "Пароль успешно изменен!"})
            
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
      }
      async logout(req, res) {
        try {
         const {refreshToken} = req.cookies;
        console.log('refreshtoken', refreshToken)
         await tokenService.removeToken(refreshToken);
        
        res.clearCookie('refreshToken');
         return res.json({msg:'Logout success'});
            
        } catch (error) {
          return res.status(500).json({msg: error.message})  
        }
      }

    
}

module.exports = new AuthController()