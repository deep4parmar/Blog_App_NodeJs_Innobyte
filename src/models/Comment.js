import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    },
    content: {
        type: String,
        required: true,
    },
    author_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
},
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
)

export const Comment = mongoose.model("Comment", commentSchema);