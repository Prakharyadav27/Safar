const mongoose = require("mongoose");



const reportSchema = new mongoose.Schema({
  reporter: {
    type: String,
  },

  reportermail: {
    type: String,
  },
  postid: {
    type: String,
  },  

  email: {
    type: String,
  },
  issue: {
    type: String,
  },
  file: {
    type: String,
  },
});

module.exports = mongoose.model("report", reportSchema);
