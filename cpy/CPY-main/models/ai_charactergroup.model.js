const mongoose = require("mongoose")

const aiCharactergroupSchema = new mongoose.Schema({}, {
  strict: false,
  timeseries: true
})

const Charactergroup = mongoose.model("Charactergroup", aiCharactergroupSchema)

module.exports = Charactergroup