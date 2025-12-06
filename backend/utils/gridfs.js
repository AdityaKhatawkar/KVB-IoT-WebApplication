const mongoose = require("mongoose");

let gridFSBucket = null;

function initGridFSBucket(connection) {
  gridFSBucket = new mongoose.mongo.GridFSBucket(connection.db, {
    bucketName: "firmware",
  });
}

function getGridFSBucket() {
  return gridFSBucket;
}

module.exports = { initGridFSBucket, getGridFSBucket };
