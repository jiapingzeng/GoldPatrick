$('#share').on('click', function () {
    MessengerExtensions.beginShareFlow(function success(response) {
        console.log('success')
    }, function error(errorCode, errorMessage) {
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
        }, "broadcast")
})