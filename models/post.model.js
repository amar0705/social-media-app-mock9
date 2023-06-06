const mongoose = require("mongoose")

const postSchema = mongoose.Schema({
        user: { type: mongoose.Types.ObjectId, ref: 'User' },
        text: String,
        image: String,
        createdAt: Date,
        likes: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
        comments: [{
          user: { type: mongoose.Types.ObjectId, ref: 'User' },
          text: String,
          createdAt: Date
        }]
})

const PostModel = mongoose.model("post", postSchema)

module.exports = {PostModel}