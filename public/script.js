function appendLog(e) {
    $('#log').append('<li>' + JSON.stringify(e) + '</li>')
}

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

$('#invite').on('click', function () {
    $('#title').text('clicked')
    MessengerExtensions.beginShareFlow(function (response) {
        appendLog('sharing')
        if (response.is_sent) {
            MessengerExtensions.requestCloseBrowser(function () {
                appendLog('closing webview')
            }, function error(err) {
                appendLog('error closing webview')
            });
        }
    }, function (errorCode, errorMessage) {
        appendLog(errorMessage)
    }, {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "I just earned a gold star!",
                        image_url: "https://i.imgur.com/A7cvPDl.png",
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