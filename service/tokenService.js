const jwt = require('jsonwebtoken');
//const tokenModel = require('../models/token-model');
const {Token} = require('../models/authModel')
class TokenService {

    createActivationToken(payload) {
        return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {expiresIn: '5m'})
    }

    validateActivationToken(token) {
        try {
            const data = jwt.verify(token, process.env.ACTIVATION_TOKEN_SECRET);
            return data;
        } catch (e) {
            return null;
        }
    }

    createAccessToken(payload) {
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})
    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }

    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '30d'})
        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(userId, refreshToken, fingerprint) {
        const tokenData = await Token.findOne({where:{userId: userId, fingerprint: fingerprint}})
        if (tokenData) {
            
         //   return tokenData.save();
          return  await Token.update({ refreshToken: refreshToken }, {
                where: {
                  userId: userId,
                  fingerprint:fingerprint
                }
              })
          
        }
        let count = await Token.count({where:{userId: userId}})
        count++
        if(count>2){
         await Token.destroy({where:{userId:userId}})
         
         const token = await Token.create({userId: userId, refreshToken, fingerprint})
         return token;
        }
             
        
        const token = await Token.create({userId: userId, refreshToken, fingerprint})
        return token;
    }

    async removeToken(refreshToken) {
     await Token.destroy({where:{refreshToken}})
       
    }

    async findToken(refreshToken) {
        const tokenData = await Token.findOne({where:{refreshToken}})
        return tokenData;
    }
    
  
}

module.exports = new TokenService();