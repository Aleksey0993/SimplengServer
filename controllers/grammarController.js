//const bcrypt = require('bcrypt')
const {User} = require('../models/authModel')
//const tokenService = require('../service/tokenService')
//const mailService = require('../service/mailService')
//const UserDto = require('../dtos/user-dto')
//const { validationResult } = require('express-validator');
class GrammarController {
 
    async listUser(req, res) {
        try {
        
          const users = await User.findAll()
          console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
          console.log(users)
           return res.json({users:users}) 
         
            
        } catch (error) {
          return res.status(500).json({msg: error.message})
        }
      }

      async addUser(req, res) {
        try {
        
        //   const users = await User.findAll()
        //   console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
        //   console.log(users)
        //    return res.json({users:users}) 
         
            
        } catch (error) {
          return res.status(500).json({msg: error.message})
        }
      }

    

    
}

module.exports = new GrammarController()