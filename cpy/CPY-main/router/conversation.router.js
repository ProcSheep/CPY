const router = require('express').Router()
const conversationController = require('../controller/conversation.controller')

router.post('/conversation', conversationController.conversations)

module.exports = router