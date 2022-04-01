const bcrypt = require('bcrypt')
const {User} = require('../models/authModel')
const tokenService = require('../service/tokenService')
const mailService = require('../service/mailService')
const UserDto = require('../dtos/user-dto')
class AuthController {
    async registration(req, res) {
      try {
        const {email, password} = req.body
            
      //  if(!name || !email || !password)
       //     return res.status(400).json({msg: "Please fill in all fields."})

       // if(!validateEmail(email))
       //     return res.status(400).json({msg: "Invalid emails."})

        const user = await User.findOne({where:{email}}) 
        if(user) return res.status(400).json({msg: "This email already exists."})

       // if(password.length < 6)
       //     return res.status(400).json({msg: "Password must be at least 6 characters."})

        const passwordHash = await bcrypt.hash(password, 12)

        const newUser = {
             email, password: passwordHash
        }

        const activation_token = tokenService.createActivationToken(newUser)

        const url = `${process.env.CLIENT_URL}/auth/activate/${activation_token}`
        await mailService.sendActivationMail(email, url)


        res.json({msg: "Register Success! Please activate your email to start."})
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
            if(check) return res.status(400).json({msg:"This email already exists."})

            // const newUser = new Users({
            //     name, email, password
            // })

            // await newUser.save()
            await User.create({email,password})
            res.json({msg: "Account has been activated!"})
            
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
      }


      async login(req, res) {
        try {
          
        //  await User.destroy({where:{id:1}})
          
        //  return res.json({msg:'Пользователь удален с бд '})
          const {email, password, fingerprint} = req.body;
        
          
          const user = await User.findOne({where:{email}})
          if (!user) {
            return res.status(400).json({msg:"Пользователь с данным email не найден!"})
           }
          const isPassEquals = await bcrypt.compare(password, user.password);
           if (!isPassEquals) {
            return res.status(400).json({msg:"Неверный пароль!"})
           }
           const userDto = new UserDto(user);
           
           const tokens = tokenService.generateTokens({...userDto});
           
           await tokenService.saveToken(userDto.id, tokens.refreshToken, fingerprint);
           res.cookie('refreshToken', 
                        tokens.refreshToken, 
                        { maxAge: 30 * 24 * 60 * 60 * 1000,
                          path: '/api/auth/refresh', 
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
           console.log('------------------------------------------')
            console.log(refreshToken)
            console.log('---------------------------------------')
            if (!refreshToken) {
              return res.status(401).json({msg: "Не авторизован"})
          }
          const userData = tokenService.validateRefreshToken(refreshToken);
          const tokenFromDb = await tokenService.findToken(refreshToken);
          if (!userData || !tokenFromDb) {
              
            return res.status(401).json({msg: "Не авторизован"})
          }
          const user = await User.findByPk(userData.id);
          const userDto = new UserDto(user);
          const tokens = tokenService.generateTokens({...userDto});
  
          await tokenService.saveToken(userDto.id, tokens.refreshToken, fingerprint);
          res.cookie('refreshToken', 
                       tokens.refreshToken, 
                       { maxAge: 30 * 24 * 60 * 60 * 1000,
                        path: '/api/auth/refresh', 
                         httpOnly: true}) 
        
          return res.json({accessToken:tokens.accessToken})


            
        } catch (error) {
          return res.status(500).json({msg: error.message})    
        }
      }


      async forgotPassword(req, res) {
        try {
            const {email} = req.body
            const user = await User.findOne({where:{email}})
            if(!user) return res.status(400).json({msg: "This email does not exist."})
            
           const access_token = tokenService.createAccessToken({id: user.id})

            const url = `${process.env.CLIENT_URL}/auth/reset/${access_token}`
            await mailService.sendResetPasswordMail(email, url)
                      
            res.json({msg: "На вашу почту было отправлено письмо!!"})
            
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
      }
      async resetPassword(req, res) {
        try {
            const {password} = req.body
            console.log(password)
            const passwordHash = await bcrypt.hash(password, 12)

            await User.update({ password: passwordHash }, {
                where: {
                  id: req.user.id
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
          
         await tokenService.removeToken(refreshToken);
        
        res.clearCookie('refreshToken');
         return res.json({msg:'Logout success'});
            
        } catch (error) {
          return res.status(500).json({msg: error.message})  
        }
      }

    
}

module.exports = new AuthController()