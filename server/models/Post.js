const {DataTypes} =require('sequelize');
const {sequelize} = require('../models/db.js');

const User=require('./user.model.js');

const Post=sequelize.define('Post',{
    id:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement:true,
        primaryKey:true,
    },
    title:{
        type:DataTypes.STRING(255),
        allowNull:false,
    },
    content:{
        type:DataTypes.TEXT,
        allowNull:false,
    },
    userId:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false,
        references:{
            model:'users',
            key:'id',
            
        },
    },
},{
    tableName:'posts',
    timestamps:true,
});

Post.belongsTo(User,{foreignKey:'userId'});

User.hasMany(Post,{foreignKey:'userId'});


module.exports=Post;