const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
        name: String,
        email: String,
        password: String,
        dob: Date,
        bio: String,
        posts: [{ type: mongoose.Types.ObjectId, ref: 'Post' }],
        friends: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
        friendRequests: [{ type: mongoose.Types.ObjectId, ref: 'User' }]
})

const UserModel = mongoose.model("user", userSchema)

module.exports = {UserModel}