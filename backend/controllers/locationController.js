const StateCity = require("../models/StateCity");

// GET all states
exports.states = async (req, res) => {
  try {
    const states = await StateCity.find({}, { _id: 0, state: 1 }).sort({
      state: 1,
    });
    res.json(states.map((s) => s.state));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET cities for a specific state
exports.cities = async (req, res) => {
  try {
    const stateName = req.params.stateName;
    const state = await StateCity.findOne({ state: stateName });
    if (!state) return res.status(404).json({ message: "State not found" });
    res.json(state.cities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
