if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

// Packages
const mongoose = require('mongoose') 
const express = require('express')
const Router = require('express')
const bodyParser = require('body-parser')
const path = require('path')

const { Sequelize } = require('sequelize');
const { QueryTypes } = require('sequelize');
const { queryInterface } = require('sequelize');
const { DataTypes  } = require('sequelize');

// express server 
const app = express()
app.use(bodyParser.json())

// Mongo DB data model through ODM
const User = mongoose.model('User', {
    name: String,
    email: String, 
    surname: String
})


// Test get API 
app.get('/', (req, res) => res.send('yada yada yada'))


// Mongo API endpoints
app.get('/users', async (req, res) => {
    const users = await User.find({}).limit(10)
    res.send(users)
})

app.post('/users', async (req, res) => {
    const user = await new User(req.body.user).save()
    res.send(user)
})


// Connection 'object' to SQL database through Sequelize ORM
const sequelize = new Sequelize('test', 'docker', 'password', {
    // host: "host.docker.internal",
    host: 'postgresql',
    dialect: 'postgres'
    });


// SQL example data model through ORM 
const UserSQL = sequelize.define('Users_table', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    }
      }, 
      {
          // optional prams if any 
      }
);


// SQL API endpoints
app.post('/userspsg', async (req, res) => {
    try {
        const resBody = req.body
        const response = await UserSQL.create({ firstName: resBody.firstName, lastName: resBody.lastName}); // builds AND saves
        // console.log(response)
        res.send('user created')
    } catch (err) {
        console.log(err)
    }
})


app.get('/userspsg', async (req, res) => {
    try {
        const users = await UserSQL.findAll();
        res.send(users)
    } catch (err) {
        console.log(err)
    }
})


// Run server
const run = async () => {
    let retriesMongo = 7;
    while (retriesMongo) {
        try {
            await mongoose.connect(process.env.MONGO_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
            break; 
        } catch (err) {
            console.log(err)
            retriesMongo -= 1 
            console.log(`retries left for Mongo: ${retriesMongo}`)
            // try again in 5 seconds    
            await new Promise(res => setTimeout(res, 10000))
        }
    }
    
    let retriesPsg = 5;
    while (retriesPsg) {
        try {
            await sequelize.authenticate();
            await sequelize.sync({ alter: true }) // generate tables
            break; 
        } catch (err) {
            console.log(err)
            retriesPsg -= 1 
            console.log(`retries left for psg: ${retriesPsg}`)
            // try again in 5 seconds    
            await new Promise(res => setTimeout(res, 10000))
        }
    }
    

    await app.listen(process.env.PORT, () => {
        console.log(`Example app listening on port ${process.env.PORT}!`)
    })
}


run()

