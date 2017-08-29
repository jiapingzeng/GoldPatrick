$(function () {
    $('#title').text('not clicked')
})

$('#invite').on('click', function () {
    $('#title').text('clicked')
    MessengerExtensions.beginShareFlow(function (response) {
        console.log('success')
        $('#text').text('shared')
        if (response.is_sent) {
            MessengerExtensions.requestCloseBrowser(function () {
                console.log('closed')
            }, function error(err) {
                console.log('error')
            });
        }
    }, function (errorCode, errorMessage) {
        console.log(errorMessage)
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