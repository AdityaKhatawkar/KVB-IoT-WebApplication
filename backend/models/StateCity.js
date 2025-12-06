const mongoose = require("mongoose");

const stateCitySchema = new mongoose.Schema(
  {
    state: { type: String, required: true },
    cities: [String],
  },
  { collection: "states_cities" }
); 

module.exports = mongoose.model("StateCity", stateCitySchema);
