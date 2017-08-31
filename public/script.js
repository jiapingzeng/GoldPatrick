$(function () {
    var userId
    var firstName
    var accessToken = 'EAAXt2kxZAtn4BAJNMj8BC6FmZBlJvHY1SaQ1k6zZAX0R547OfhZCHbtFkBJoWesiyTC1nowC8FcZCbWob3CQTUaXF3I9oETlFbDEPKPLDsFAaMLIJxim69ZCZCZBzE1AUCwuEvE0VsIw6RLSM8qM9HZBmQXYcikZBlHdGW66Lyye5LpQZDZD'
    
    MessengerExtensions.getUserID(function (uids) {
        userId = uids.psid
    }, null)

    $.ajax({
        url: 'https://graph.facebook.com/v2.10/' + userId + '?fields=first_name&access_token=' + accessToken,
        type: 'GET',
        data: {
            fields: 'first_name',
            access_token: accessToken
        },
        success: function (data) {
            firstName = data.first_name
        }
    })        

    var socket = io()
    socket.on('connected', function (data) {
        console.log('io connected')
    })

    $('#send').on('click', function () {
        MessengerExtensions.beginShareFlow(function (response) {
            if (response.is_sent) {
                MessengerExtensions.requestCloseBrowser(function () {
                    appendLog('closing webview')
                }, null);
            }
        }, null, {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: [{
                            title: (firstName ? firstName : "Patrick") + " just gave you a gold star!",
                            image_url: "https://i.imgur.com/hfBm4JE.png",
                            subtitle: "Nice!",
                            default_action: {
                                type: "web_url",
                                url: "https://goldpatrick.herokuapp.com"
                            },
                            buttons: [{
                                type: "web_url",
                                url: "https://goldpatrick.herokuapp.com",
                                title: "Oi"
                            }]
                        }]
                    }
                }
            }, "current_thread")
    })

    function appendLog(e) {
        console.log(e)
        $('#log').append('<li>' + JSON.stringify(e) + '</li>')
    }
})
/*
$(function () {
    $('#title').text('not clicked')
    MessengerExtensions.getContext('1668896723154558', function (result) {
        appendLog(result)
    }, function (result) {
        appendLog(result)
    })
})

$('#getStarted').on('click', function () {
    MessengerExtensions.askPermission(function (response) {
        var permissions = response.permissions
        var isGranted = response.isGranted
        if (isGranted) {
            appendLog('permission granted')
        }
    }, function (errorCode, errorMessage) {
        appendLog(errorMessage)
    })
})
*/