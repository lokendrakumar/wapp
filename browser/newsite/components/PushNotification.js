app.components.PushStreamConnecter = function(susbscriber) {
    var $susbscriber = $('#'+ susbscriber);
    var $notificationlist = $susbscriber.find('.notifications-list');
    // console.log($notificationlist.html());

    if (Notification.permission !== "granted"){
      Notification.requestPermission();
    }
    PushStream.LOG_LEVEL = 'PRODUCTION';
    var pushstream = new PushStream({
        host: 'webnotification.frankly.me',
        modes: "eventsource|websocket|stream",
        useSSL: true
    });
    pushstream.onmessage = _manageEvent;
    pushstream.onstatuschange = _statuschanged;
    $(document).on('click','.notification-click',function(){
        window.location.href = $(this).data('url');
    });


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
            var args = {
                icon: parsedNotify.icon,
                body: parsedNotify.text.replace('<b>', '').replace('</b>', '')
            };
            var $template = $(".notification-template");
            var $icon = $template.find(".notificationimg");
            var $text = $template.find(".notificationtext");
            var $containingdiv = $template.find(".notification-click");
            $containingdiv.attr('data-url', parsedNotify.link);

            $icon.attr('src', args.icon);
            $text.empty();
            $text.append(parsedNotify.text);

            $notificationlist.prepend($template.html());

            var notification = new Notification(dataOb.author, args);

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
