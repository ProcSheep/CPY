const mongoose = require("mongoose")

const aiConversationSchema = new mongoose.Schema({}, {
  strict: false,
  timeseries: true
})

const Conversation = mongoose.model("Conversation", aiConversationSchema)

module.exports = Conversation