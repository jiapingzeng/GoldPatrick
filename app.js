var express = require('express')
var config = require('config')
var bodyParser = require('body-parser')
var request = require('request')
var path = require('path')
var fs = require('fs')
var util = require('util')

const log_file = fs.createWriteStream(__dirname + '/debug.log', { flags: 'w' })
const log_stdout = process.stdout

console.log = function (d) {
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

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

console.log('server started')

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/debug', (req, res) => {
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
                sendGenericMessage(senderId)
                break
            default:
                sendTextMessage(senderId, sendTextMessage(senderId, messageText))
        }
    } else if (messageAttachments) {
        sendTextMessage(senderId, 'No, this is Patrick')
    }
}

var sendGenericMessage = (recipientId) => {
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
                        title: "This is Patrick",
                        image_url: "http://i.imgur.com/A7cvPDl.png",
                        subtitle: "And I'm gold. I give gold stars sometimes and I can check how many you have.",
                        buttons: [{
                            type: "postback",
                            title: "Give me a Gold Star",
                            payload: "REQUEST"
                        }, {
                            type: "postback",
                            title: "How many do I have",
                            payload: "BALANCE"
                        }, {
                            type: "web_url",
                            title: "Patrick",
                            url: "https://goldpatrick.herokuapps.com",
                            webview_height_ratio: tall
                        }]
                    }]
                }
            }
        }
    }
    callSendAPI(messageData)
}

var sendMessage = (recipientId, messageData) => {
    callSendAPI(messageData)
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