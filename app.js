var express = require('express')
var config = require('config')
var bodyParser = require('body-parser')
var request = require('request')

var app = express()
var port = process.env.PORT || 3000

var appSecret = (process.env.MESSENGER_APP_SECRET) ? process.env.MESSENGER_APP_SECRET : config.get('appSecret')
var validationToken = (process.env.MESSENGER_VALIDATION_TOKEN) ? (process.env.MESSENGER_VALIDATION_TOKEN) : config.get('validationToken')
var pageAccessToken = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ? (process.env.MESSENGER_PAGE_ACCESS_TOKEN) : config.get('pageAccessToken')
var serverUrl = (process.env.SERVER_URL) ? (process.env.SERVER_URL) : config.get('serverUrl')

app.listen(port)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

console.log('server started')

app.get('/webhook', (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] == validationToken) {
        res.status(200).send(req.query['hub.challenge'])
    } else {
        res.send(403).send()
    }
})

app.post('/webhook', (req, res) => {
    var data = req.body
    if (data.object === 'page') {
        data.entry.forEach((entry) => {
            var pageId = entry.id
            var timeOfEvent = entry.time
            entry.messaging.forEach((event) => {
                if (event.message) {
                    receivedMessage(event)
                } else {
                    console.log(event)
                }
            })
        })
        res.sendStatus(200)
    }
})

var receivedMessage = (event) => {
    var senderId = event.sender.id
    var recipientId = event.recipient.id
    var timestamp = event.timestamp
    var message = event.message

    var messageId = message.mid
    var messageText = message.text
    var messageAttachments = message.attachments

    if (messageText) {
        switch (messageText) {
            case 'FAT':
                sendMessage(senderId)
                break
            default:
                sendTextMessage(senderId, sendTextMessage(senderId, messageText))
        }        
    } else if (messageAttachments) {
        sendTextMessage(senderId, 'No, this is Patrick')
    }
}

var sendStructuredMessage = (recipientId) => {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "Patrick",
                        subtitle: "is fat",
                        buttons: [{
                            type: "postback",
                            title: "Nice!",
                            payload: ""
                        }]
                    }]
                }
            }
        }
    }
}

var sendTextMessage = (recipientId, messageText) => {
    var messageData = {
        "recipient": { "id": recipientId },
        "message": { "text": messageText }
    }
    callSendAPI(messageData)
}

var callSendAPI = (messageData) => {
    request({
        uri: serverUrl,
        qs: { access_token: pageAccessToken },
        method: 'POST',
        json: messageData
    }, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            var recipientId = body.recipient_id
            var messageId = body.message_id
            console.log('works')
        } else {
            console('doesn\'t work')
        }
    })
}