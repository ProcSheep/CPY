const express = require("express")
const imgRouter = express.Router()
const imgController = require('../controllers/image.controller');
const upload = require('../config/multer')
const uploadController = require("../controllers/upload.controller")

imgRouter.get('/imgDownload', imgController.imgDownload)
imgRouter.post('/upload', upload.array('files'), uploadController.handleUpload)

module.exports = imgRouter