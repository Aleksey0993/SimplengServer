const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const Grammar = sequelize.define('grammar', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, unique: true,},
    description: {type: DataTypes.STRING},
    published: {type: DataTypes.BOOLEAN, defaultValue: false}
    //role: {type: DataTypes.STRING, defaultValue: "USER"},
},  { timestamps: false })


// const Token = sequelize.define('token', {
//     id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
//     refreshToken: {type: DataTypes.STRING},
//     fingerprint: {type: DataTypes.STRING}    
// })

//User.hasMany(Token, { onDelete: "cascade" })
//Token.belongsTo(User)


module.exports = {
    Grammar,
    
}
