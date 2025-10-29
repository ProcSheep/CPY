const mongoose = require("mongoose");

const TopappdataSchema = new mongoose.Schema(
  {},
  {
    strict: false,
    timeseries: true,
  }
);

const Topappdata = mongoose.model("Topappdata", TopappdataSchema);

module.exports = Topappdata;
