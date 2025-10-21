const router = require('express').Router()
const upload = require('../config/multer')
const {queryRes, paramsRes, formRes} = require("../controllers/test.controller")

// query和params
router.get('/query', queryRes)
router.get('/params/:userId/:passId', paramsRes)
// 纯文本
router.post('/formText', upload.none(), formRes)


module.exports = router