const express = require("express")
const {UserModel} = require("../models/user.model")
const {PostModel} = require("../models/post.model")
const {authenticate} = require("../middlewares/authenticate.middleware")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
require("dotenv").config()

const userRouter = express.Router()

userRouter.post("/register", async(req,res)=>{
    try{
        const {name,email, password, dob,bio} = req.body
        const hashedPassword = await bcrypt.hash(password, 5)
        const user = new UserModel({name, email, password: hashedPassword, dob,bio})
        await user.save()
        res.status(201).json({message:"User Registered Successfully"})
    }
    catch(err){
        res.status(500).json({message:"Something went wrong", error: err.message})
    }
})

userRouter.post("/login", async(req,res)=>{
    try{
        const {email, password} = req.body
        const user = await UserModel.findOne({email})
        if(!user){
            res.status(401).json({message:"Wrong Credentials"})
            return;
        }
        const passwordMatch = await bcrypt.compare(password, user.password)
        if(!passwordMatch){
            res.status(401).json({message:"Wrong Credentials"})
            return;
        }
        const token = jwt.sign({userId: user._id}, process.env.key)
        res.status(201).json({message:"Login Successful", token:token})
    }
    catch(err){
        res.status(500).json({message:"Something went wrong", error:err.message})
    }
})

userRouter.get("/users", async(req,res)=>{
    try{
        const users = await UserModel.find()
        res.status(200).json(users)
    }
    catch(err){
        res.status(500).json({message:"Something went wrong", error:err.message})
    }
})

userRouter.get("/users/:id/friends", async(req,res)=>{
    try{
        const user = await UserModel.findById(req.params.id)
        if(!user){
            res.status(404).json({message:"No users found"})
            return
        }
        res.status(200).json(user.friends)
    }
    catch(err){
        res.status(500).json({message:"Something went wrong", error: err.message})
    }
})

userRouter.post("/users/:id/friends", authenticate, async(req,res)=>{
    try{
        const user = await UserModel.findById(req.params.id)
        if(!user){
            res.status(404).json({message:"User not found"})
            return;
        }
        user.friendRequests.push(req.params.id)
        await user.save()
        res.status(201).json({message:"Friend request sent successfully"})
    }
    catch(err){
        res.status(500).json({message:"Something went wrong", error:err.message})
    }
})

userRouter.put("/users/:id/friends/:friendId", authenticate, async(req,res)=>{
    try{
        const user = await UserModel.findById(req.params.id)
        if(!user){
            res.status(404).json({message:"User not found"})
            return;
        }
        const friendIndex = user.friendRequests.indexOf(req.params.friendId)
        if(friendIndex === -1){
            res.status(404).json({message:"Friend request not found"})
            return;
        }
        user.friendRequests.splice(friendIndex, 1)
        if(req.body.accept){
            user.friends.push(req.params.friendId)
        }
        await user.save()
        res.json({message:"Friend request updated successfully"})
    }
    catch(err){
        res.status(500).json({message:"Something went wrong", error: err.message})
    }
})

userRouter.get("/posts", async(req,res)=>{
    try{
        const posts = await PostModel.find()
        res.json(posts)
    }
    catch(err){
        res.status(500).json({message:"Something went wrong", error:err.message})
    }
})

userRouter.post("/posts", authenticate, async(req,res)=>{
    try{
        const {text, image} = req.body
        const post = new PostModel({user: req.userId, text, image, createdAt: new Date()})
        await post.save()
        res.json({message:"Post created successfully"})
    }
    catch(err){
        res.status(500).json({message:"Something went wrong", error:err.message})
    }
})

userRouter.patch("/posts/:id", authenticate, async(req,res)=>{
    try{
        const post = await PostModel.findById(req.params.id)
        if(!post){
            res.status(404).json({message:"Post not found"})
            return;
        }
        if(post.user !== req.userId){
            res.status(400).json({message:"Access Denied"})
            return;
        }
        post.text = req.body.text || post.text
        post.image = req.body.image || post.image
        await post.save()
        res.json({message:"Post updated successfully"})
    }
    catch(err){
        res.status(500).json({message:"Something went wrong", error: err.message})
    }
})

userRouter.delete("/posts/:id", authenticate, async(req,res)=>{
    const id = req.params.id
    try{
        await PostModel.findByIdAndDelete({_id:id})
        res.json({message:"Post deleted successfully"})
    }
    catch(err){
        res.status(500).json({message:"Something went wrong", error:err.message})
    }
})

userRouter.post("/posts/:id/like", authenticate, async(req,res)=>{
    try{
        const post = await PostModel.findById(req.params.id)
        if(!post){
            res.status(404).json({message:"Post not found"})
            return;
        }
        if(post.likes.includes(req.userId)){
            res.status(400).json({message:"You have already liked this post"})
            return;
        }
        post.likes.push(req.params.id)
        await post.save()
        res.json({message:"Post liked successfully"})
    }
    catch(err){
        res.status(500).json({message:"Something went wrong", error:err.message})
    }
})

userRouter.post("/posts/:id/comment", authenticate, async(req,res)=>{
    try{
        const post = await PostModel.findById(req.params.id)
        if(!post){
            res.status(404).json({message:"post not found"})
            return;
        }
        const comment = {
            user: req.params.id,
            text: req.body.text,
            createdAt: new Date()
        }
        post.comments.push(comment)
        await post.save()
        res.json({message:"Comment added successfully"})
    }
    catch(err){
        res.status(500).json({message:"Something went wrong", error:err.message})
    }
})

userRouter.get("/posts/:id", async(req,res)=>{
    try{
        const post = await PostModel.findById(req.params.id)
        if(!post){
            res.status(404).json({message:"Post not found"})
            return
        }
        res.json(post)
    }
    catch(err){
        res.status(500).json({message:"Something went wrong", error:err.message})
    }
})


module.exports = {userRouter}

