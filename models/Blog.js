const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  UserName : {
    type : String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  postedAt: {
    type: String,
    default: new Date().toString(),
  },
  tags: {
    type: [String],
    required: true,
  },
  report_filename : {
    type : String,
    required : true
  },
  stored_filename: {
    type : String,
    required : true
  }
});

module.exports = new mongoose.model("Blog", BlogSchema);
