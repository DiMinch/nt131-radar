const configService = require("../services/config.service");

exports.getConfig = async (req, res) => {
  res.json(await configService.getConfig());
};

exports.saveConfig = async (req, res) => {
  const config = await configService.saveConfig(req.body);
  res.json({ success: true, config });
};