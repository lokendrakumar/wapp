app.components.PushStreamConnecter = function(susbscriber) {
    if (Notification.permission !== "granted"){
      Notification.requestPermission();
    }
    PushStream.LOG_LEVEL = 'PRODUCTION';
    var pushstream = new PushStream({
        host: 'ec2-52-74-54-96.ap-southeast-1.compute.amazonaws.com',
        modes: "eventsource|websocket|stream"
    });
    pushstream.onmessage = _manageEvent;
    pushstream.onstatuschange = _statuschanged;

    function _manageEvent(eventMessage) {
        //console.logeventMessage["job"]);
        var dataOb = eventMessage;
        var parsedNotify = JSON.parse(dataOb.message);
        console.log(parsedNotify);
        //app.utils.notifyWs('Hi ' + "<%= me.username %>, " + dataOb.message + "From :" + dataOb.author, "success", 5);
        if (!Notification) {
            alert('Desktop notifications not available in your browser. Try Chromium.');
            return;
        }

        if (Notification.permission !== "granted")
            Notification.requestPermission();
        else {
            var notification = new Notification(dataOb.author, {
                icon: parsedNotify.icon,
                body: parsedNotify.text.replace('<b>', '').replace('</b>', ''),
            });

            notification.onclick = function() {
                window.open(parsedNotify.link);
            };

        }
        //var dataOb = eventMessage;
        //console.warn("recvied event" + new Date()  + ' ' + dataOb.message);
    };

    function _statuschanged(state) {
        if (state == PushStream.OPEN) {
            app.utils.notify("Notification Connected" + pushstream.wrapper.type , "success", 2);
        } else {
            app.utils.notify("Disconnected" , "error", 2);
        }
    };

    function _connect(channel) {
        pushstream.removeAllChannels();
        try {
            pushstream.addChannel(channel);
            pushstream.connect();
        } catch (e) {
            alert(e)
        };
    };
    _connect(susbscriber);
};