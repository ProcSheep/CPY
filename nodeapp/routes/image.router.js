const express = require("express")
const imgRouter = express.Router()
const imgController = require('../controllers/image.controller');

imgRouter.get('/imgDownload', imgController.imgDownload)

module.exports = imgRouter