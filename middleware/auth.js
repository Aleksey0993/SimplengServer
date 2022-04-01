const tokenService = require('../service/tokenService')

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return res.status(401).json({msg: "Не авторизован"})
        }

        const token = authorizationHeader.split(' ')[1] // Bearer asfasnfkajsfnjk
        if (!token) {
            return res.status(401).json({msg: "Не авторизован"})
        }

        const decoded = tokenService.validateAccessToken(token)
        if(!decoded){
            return res.status(401).json({msg: "Не авторизован"}) 
        }
        req.user = decoded
        next()
    } catch (e) {
        res.status(401).json({msg: "Не авторизован"})
    }
};