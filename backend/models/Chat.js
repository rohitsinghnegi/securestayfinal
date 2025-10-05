import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }],
    type: {
      type: String,
      enum: ['direct', 'group'],
      default: 'direct'
    },
    name: {
      type: String,
      required: function() { return this.type === 'group'; }
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    messageCount: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'createdByModel',
      required: true
    },
    createdByModel: {
      type: String,
      enum: ['Student', 'Landlord'],
      required: true
    }
  },
  { timestamps: true }
);

// Compound index for direct conversations
chatSchema.index({ participants: 1, type: 1 });

export default mongoose.model("Chat", chatSchema);