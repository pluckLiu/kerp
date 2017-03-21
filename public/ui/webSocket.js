/**********************
 * socket 初始化
 **********************/
(function () {
    var socket = io();//注意这里不加任何url,就是连接网页对应的那个地址与默认端口
    /*关于服务器连接或断开,要搞明白 连接是 自己被别人连接，以及断开是 自己连接了别人后，别人断开了
     socket.emit('disconnect',{msg:'456'});//主动发射这个是无效的
     */
    socket.on('connection', function (msg) {
        console.info('连接成功!!!msg', msg);
    });//通过测试,这个 connection 只有是服务器接收到 客户端的连接请求才会出现
    socket.on('disconnect', function (msg) {
        console.info('服务器连接socket断开了!!!msg', msg);
    });//当服务器的网络挂掉了,就会触发客户端的这个
    socket.emit('cookie', {cookie: document.cookie});
    socket.on('nosession', function () {
        console.info('没有会话,跳转到登录页面!!!');
        //alert('请重新登录系统!');
        window.location = "login.html";
        return;
    });
    socket.on('userNotLogin', function (msg) {
        alert(msg);
        window.location = "login.html";
        return;
    });
    //封装一个 socket 任务处理程序
    var _taskid = 0;//记录的是任务id
    var _taskfunc = {};
    var _taskSelfCtrl = {};
    k.emitRequestToServer = function (action, body, callback, timeOut, isTaskSelfCtrl) {
        _taskid++;
        var taskid = _taskid;
        _taskfunc[taskid.toString()] = callback;//得到数据的回调处理函数
        socket.emit('actionRequest', {
            'action': action,
            'body': body,
            'taskid': taskid,
            'cookie': document.cookie
        });//发送服务器请求
        if (isTaskSelfCtrl == true) _taskSelfCtrl[taskid] = true;
        //超时默认是1000ms
        setTimeout((function (taskidTmp) {
            return function () {
                if (_taskfunc[taskidTmp.toString()] && k.isFunction(_taskfunc[taskidTmp.toString()]) && _taskSelfCtrl[taskid] != true) {
                    _taskfunc[taskidTmp.toString()]({timeOut: 1});//如果回调函数被这样执行,就代表服务器超时了
                    delete _taskfunc[taskidTmp.toString()];
                }
            };
        })(taskid), (timeOut == undefined ? 5000 : timeOut));
    };
    socket.on('actionResponse', function (msg) {
        var taskid = msg.taskid, theRt;
        if (_taskfunc[taskid.toString()] && k.isFunction(_taskfunc[taskid.toString()])) {
            theRt = _taskfunc[taskid.toString()](msg.body);
            if (_taskSelfCtrl[taskid] == true) {
                if (theRt == true)
                    delete _taskfunc[taskid.toString()];//当回调返回真,且这个回调函数也是自治函数,才删除
            }
            else
                delete _taskfunc[taskid.toString()];//如果回调不是自治函数,就直接删除,不会再下次被调用了
        }
    });
    console.info('socket初始化完成!');
})();