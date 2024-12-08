// User  model is reuired 

const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

// register 

router.post("/register", async(req,res) => {
try {
    const{username, email, password} = req.body
    const salt = await bcrypt.genSalt(10)
    const hashedpassword = await bcrypt.hashSync(password, salt)
    const newUser = new User ({username, email, password:hashedpassword})
    const savedUser = await newUser.save()
    res.status(200).json(savedUser)
}
catch(err) {
    res.status(500).json(err)
}

})

// login 
router.post("/login" ,async(req,res) => {
try{
const user = await User.findOne({email: req.body.email})
if(!user) {
    return res.status(404).json("user not found")
}
const match = await bcrypt.compare(req.body.password, user.password)

if(!match) {
    return res.status(401).json("Worng password")

}

const token = jwt.sign({_id:user._id,username:user.username, email:user.email },
    process.env.SECRET, {expiresIn: "3d"})
    const {password, ...info} = user._doc

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',

    }).status(200).json(info)

}

catch(err) {
    res.status(500).json(err)
}
})

// logot
router.get("/logout", async(req,res) => {
try{
res.clearCookie("token", {sameSite: "none", secure:true}).status(200).send("User logout success")
}
catch(err)
{
    res.status(500).json(err)
}
})

// refetch
router.get("/refetch", (req,res) => {
    try{
        const token = req.cookies.token
        jwt.verify(token, process.env.SECRET, {}, async(err,data) => {
            if(err) {
                return res.status(404).json(err)
            }
            res.status(200).json(data)
        })

    }
    catch (err){
        res.status(500).json(err)
    }
})


module.exports= router

//register
// login 
// logot
// refetch
