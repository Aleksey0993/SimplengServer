const {User} = require('../models/authModel') 

const authAdmin = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id)
        if(user.role !== 'ADMIN') 
            return res.status(403).json({msg: "Доступ закрыт!"})

        next()
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
}

module.exports = authAdmin