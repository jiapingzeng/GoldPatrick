var express = require('express')
var config = require('config')
var bodyParser = require('body-parser')
var request = require('request')
var path = require('path')
var fs = require('fs')
var util = require('util')

const log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'})
const log_stdout = process.stdout

console.log = function(d) {
  var date = new Date(Date.now());
  log_file.write(date.toTimeString() + ": " + util.format(d) + '\n---\n')
  log_stdout.write(util.format(d) + '\n')
}

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

app.get('/debug', function (req, res) {
    res.sendFile(path.join(__dirname, '/debug.log'));
})

app.get('/webhook', (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === validationToken) {
        console.log('Validating webhook')
        res.status(200).send(req.query['hub.challenge'])
    } else {
        console.log('Who the **** are you')
        res.sendStatus(403)
    }
})

app.post('/webhook', (req, res) => {
    var data = req.body
    console.log(data)
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
        console.log('received message "' + messageText + '" from ' + senderId)
        switch (messageText) {
            case 'FAT':
                snedStructuredMessage(senderId)
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
                    template_type: "button",
                    text: "What do you want to do",
                    buttons: [{
                        type: "postback",
                        title: "Give gold star",
                        payload: "GIVE"
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
    //console.log(messageData)
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
            console.log('doesn\'t work')
            console.log(err)
        }
    })
}