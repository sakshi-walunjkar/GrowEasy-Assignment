const express = require("express");
const r1 = express.Router();
const { getCampaigns, addCampaign, updateCampaign, deleteCampaign } = require("../controllers/campaignController");
r1.get("/", getCampaigns); r1.post("/", addCampaign); r1.patch("/:id", updateCampaign); r1.delete("/:id", deleteCampaign);
module.exports.campaignRoutes = r1;

const r2 = express.Router();
const { getCallLogs, addCallLog, updateCallLog } = require("../controllers/callController");
r2.get("/", getCallLogs); r2.post("/", addCallLog); r2.patch("/:id", updateCallLog);
module.exports.callRoutes = r2;

const r3 = express.Router();
const { getAccount, connectAccount, disconnectAccount, getTemplates, addTemplate, sendTemplate, deleteTemplate } = require("../controllers/whatsappController");
r3.get("/account", getAccount); r3.post("/account", connectAccount); r3.delete("/account", disconnectAccount);
r3.get("/templates", getTemplates); r3.post("/templates", addTemplate); r3.post("/templates/:id/send", sendTemplate); r3.delete("/templates/:id", deleteTemplate);
module.exports.whatsappRoutes = r3;
