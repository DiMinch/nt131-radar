const configService = require("../services/config.service");

exports.getConfig = async (req, res) => {
  res.json(configService.getConfig());
};

exports.saveConfig = async (req, res) => {
  const config = configService.saveConfig(req.body);
  res.json({ success: true, config });
};