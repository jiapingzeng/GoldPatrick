
var userId
var firstName
var accessToken = 'EAAXt2kxZAtn4BAJNMj8BC6FmZBlJvHY1SaQ1k6zZAX0R547OfhZCHbtFkBJoWesiyTC1nowC8FcZCbWob3CQTUaXF3I9oETlFbDEPKPLDsFAaMLIJxim69ZCZCZBzE1AUCwuEvE0VsIw6RLSM8qM9HZBmQXYcikZBlHdGW66Lyye5LpQZDZD'

//$('#log').removeClass('hidden')

function appendLog(e) {
    console.log(e)
    $('#log').append('<li>' + JSON.stringify(e) + '</li>')
}

window.extAsyncInit = function () {
    MessengerExtensions.getUserID(function (uids) {
        userId = '' + uids.psid
        appendLog(userId)
        //socket.emit("id obtained", { id: userId })
        MessengerExtensions.askPermission(function (response) {
            if (response.isGranted) {
                $.ajax({
                    url: 'https://graph.facebook.com/v2.10/' + userId,
                    type: 'GET',
                    data: {
                        fields: 'first_name',
                        access_token: accessToken
                    },
                    success: function (data) {
                        appendLog(data)
                        if (data.first_name) {
                            firstName = data.first_name
                            appendLog(firstName)
                        }
                    },
                    error: function (data) {
                        appendLog(data)
                    }
                })
            }
        }, function (errorCode, errorMessage) {
            appendLog(errorMessage)
        }, "user_profile")
    }, function (error, errorMessage) {
        appendLog(errorMessage)
    })

    /*
    var socket = io()
    socket.on('connected', function (data) {
        console.log('io connected')
    })
    */

    $('#action').removeClass('hidden')

    $('#send').on('click', function () {
        MessengerExtensions.beginShareFlow(function (response) {
            if (response.is_sent) {
                MessengerExtensions.requestCloseBrowser(function () {
                    appendLog('closing webview')
                }, null);
            }
        }, function (error) {
            appendLog(error)
        }, {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: [{
                            title: (firstName ? firstName : "Patrick") + " just gave you a gold star!",
                            image_url: "https://i.imgur.com/KKNmpp0.png",
                            subtitle: "Nice!",
                            default_action: {
                                type: "web_url",
                                url: "https://goldpatrick.herokuapp.com"
                            },
                            buttons: [{
                                type: "web_url",
                                url: "https://goldpatrick.herokuapp.com",
                                title: "Oi",
                                webview_height_ratio: 'tall'
                            }]
                        }]
                    }
                }
            }, "current_thread")
    })
}