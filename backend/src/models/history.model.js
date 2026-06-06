import mongoose, { Schema } from "mongoose";

const historySchema = new Schema({
    username: { type: String, required: true },
    meetingCode: { type: String, required: true },
    date: { type: Date, default: Date.now, required: true }
});

const History = mongoose.model("History", historySchema);
export { History };