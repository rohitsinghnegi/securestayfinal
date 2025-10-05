import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'senderModel',
      required: true
    },
    senderModel: {
      type: String,
      enum: ['Student', 'Landlord'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    },
    read: {
      type: Boolean,
      default: false
    },
    readBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'readBy.userModel'
      },
      userModel: {
        type: String,
        enum: ['Student', 'Landlord']
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  { timestamps: true }
);

// Index for faster querying
messageSchema.index({ conversation: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);