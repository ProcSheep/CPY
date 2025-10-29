const router = require("express").Router();
const appidController = require("../controller/appid.controller");

router.post("/appid", appidController.getAppData);

module.exports = router;
