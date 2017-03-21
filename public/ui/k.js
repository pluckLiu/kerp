/*****k基础对象*****/
;(function (window) {
    /***************k 作为全局对象 其中提供了各种工具函数*******/
    window["k"] = {
        isString: function (str) {
            if (Object.prototype.toString.call(str) === "[object String]") {
                return true;
            } else {
                return false;
            }
        },
        isDate: function (date) {
            if (Object.prototype.toString.call(date) === "[object Date]") {
                return true;
            } else {
                return false;
            }
        },
        isObject: function (obj) {
            if (Object.prototype.toString.call(obj) === "[object Object]") {
                return true;
            } else {
                return false;
            }
        },
        isArray: function (ary) {
            if (Object.prototype.toString.call(ary) === "[object Array]") {
                return true;
            } else {
                return false;
            }
        },
        isNumber: function (num) {
            if (Object.prototype.toString.call(num) === "[object Number]") {
                return true;
            } else {
                return false;
            }
        },
        isUndefined: function (un) {
            if (Object.prototype.toString.call(un) === "[object Undefined]") {
                return true;
            } else {
                return false;
            }
        },
        isBoolean: function (obj) {
            if (Object.prototype.toString.call(obj) === "[object Boolean]") {
                return true;
            } else {
                return false;
            }
        },
        isFunction: function (fn) {
            if (Object.prototype.toString.call(fn) === "[object Function]") {
                return true;
            } else {
                return false;
            }
        },
        /**
         * 获取汉字的长度
         * @return {number}
         */
        lengthHZ: function (str) {
            if (Object.prototype.toString.call(str) === "[object String]") {
                var iTotal = 0;
                for (i = 0; i < str.length; i++) {
                    var c = str.charAt(i);
                    if (c.match(/[\u4e00-\u9fa5]/)) {
                        iTotal++;
                    }
                }
                return iTotal;
            }
            return 0;
        },
        SortNumArrayAsc: function (elements) {
            for (var i = 0; i < elements.length - 1; i++) {
                for (var j = 0; j < elements.length - i - 1; j++) {
                    if (elements[j] > elements[j + 1]) {
                        var swap = elements[j];
                        elements[j] = elements[j + 1];
                        elements[j + 1] = swap;
                    }
                }
            }
        },
        SortNumArrayDesc: function (elements) {
            for (var i = 0; i < elements.length - 1; i++) {
                for (var j = 0; j < elements.length - i - 1; j++) {
                    if (elements[j] < elements[j + 1]) {
                        var swap = elements[j];
                        elements[j] = elements[j + 1];
                        elements[j + 1] = swap;
                    }
                }
            }
        },
        getMonthLastDay: function (year, month) {
            //获得某年某月的最后一天
            var newYear = year, newMonth = month + 1;
            if (newMonth > 11) {
                newMonth = newMonth - 12;//由于 月份是从 0 11的,最大是11,所以+1后就变成12减的就是12了
                newYear = newYear + 1;
            }
            var newDate = new Date(newYear, newMonth, 1);
            return (new Date(newDate.getTime() - 1000 /*1000 * 60 * 60 * 24*/));//获取当月最后一天日期
        },
        getMonthFirstDay: function (date) {
            return new Date(date.getFullYear(), date.getMonth(), 1);
        },
        getNextMonthFirstDay: function (date) {
            //获得某年某月的最后一天
            var newYear = date.getFullYear(), newMonth = date.getMonth() + 1;
            if (newMonth > 11) {
                newMonth = newMonth - 12;
                newYear = newYear + 1;
            }
            return new Date(newYear, newMonth, 1);
        },
        getDateSpan: function (begin, end, type) {
            var theType = type == undefined ? '月' : type;
            var bDate = new Date(begin);
            var eDate = new Date(end);
            if (bDate > eDate) return [];//如果开始大于结束,就直接返回空了
            var tmpEnd, dateSpan = [];
            bDate = k.getMonthFirstDay(bDate);
            if (theType == '月') {
                while (bDate < eDate) {
                    tmpEnd = k.getMonthLastDay(bDate.getFullYear(), bDate.getMonth());
                    dateSpan.push({begin: bDate.toString(), end: tmpEnd.toString()});
                    bDate = k.getNextMonthFirstDay(bDate);
                }
                return dateSpan;
            }
            return [];
        },
        /***
         * 拷贝数组到另一数组,注意这里是通过引用复制的形式,不是完全复制
         * @param source
         * @param other_array
         * @returns {*}
         * @constructor
         */
        ArrayConCat: function (source, other_array) {
            /* you should include a test to check whether other_array really is an array */
            for (var k = 0, length = other_array.length; k < length; k++) {
                source.push(other_array[k]);
            }
            return source;
        },
        /***
         * 从数组中移除某一个值
         * @param array
         * @param v
         * @returns {*}
         * @constructor
         */
        ArrayRemoveV: function (array, v) {
            if (array == undefined)return array;
            if (v == undefined)return array;
            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i] == v) {
                    array.splice(i, 1);
                    return array;
                }
            }
        },
        /*******************************
         * 找到某个值在数组中的位置
         * @param array
         * @param v
         * @returns {number}
         * @constructor
         ******************************/
        ArrayIndexV: function (array, v) {
            if (array == undefined)return -1;
            if (v == undefined)return -1;
            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i] == v) {
                    return i;
                }
            }
            return -1;
        },
        /***
         * 获取object对象的自身属性共有多少个,不包含prototype
         */
        getPropertyCount: function (o) {
            var n, count = 0;
            for (n in o) {
                if (o.hasOwnProperty(n)) {
                    count++;
                }
            }
            return count;
        },
        /***
         * 获取当前的 时分秒毫秒,返回字符串,用于获得当天范围内的唯一数值
         * @returns {string}
         * @constructor
         */
        GetTimeStrMS: function () {
            var date = new Date();
            return date.getHours() + '' + date.getMinutes() + '' + date.getSeconds() + '' + date.getMilliseconds();
        },
        getDateFormatString: function (date) {
            var rt = '';
            rt += date.getFullYear() + '-';//获取完整的年份(4位,1970-????)
            rt += (date.getMonth() < 9) ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1);//获取当前月份(0-11,0代表1月)
            rt += '-';
            rt += (date.getDate() < 10) ? ('0' + date.getDate()) : date.getDate();//获取当前日(1-31)
            rt += ' ';
            rt += (date.getHours() < 10) ? ('0' + date.getHours()) : date.getHours();//获取当前小时数(0-23)
            rt += ':';
            rt += (date.getMinutes() < 10) ? ('0' + date.getMinutes()) : date.getMinutes();//获取当前分钟数(0-59)
            rt += ':';
            rt += (date.getSeconds() < 10) ? ('0' + date.getSeconds()) : date.getSeconds();//获取当前秒数(0-59)
            return rt;
        },
        getDateYM: function (rdate) {
            var date = k.isDate(rdate) ? rdate : (new Date(rdate.toString()));
            return date.getFullYear().toString() + ((date.getMonth() < 9) ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1)).toString();
        },
        getDateNumber: function (rdate) {
            var date = k.isDate(rdate) ? rdate : (new Date(rdate.toString()));
            return date.getFullYear().toString()
                + ((date.getMonth() < 9) ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1)).toString()
                + ((date.getDate() < 10) ? ('0' + date.getDate()) : date.getDate())
                + ((date.getHours() < 10) ? ('0' + date.getHours()) : date.getHours())
                + ((date.getMinutes() < 10) ? ('0' + date.getMinutes()) : date.getMinutes())
                + ((date.getSeconds() < 10) ? ('0' + date.getSeconds()) : date.getSeconds());
        },
        guid: function () {
            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            };
            return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
        },
        ctrlIns: {
            getTypeIns: function (type) {
                if (this[type] == undefined)
                    this[type] = {};
                return this[type];
            }
        },
        react: {},
        rstyle: {},
    };
    /***
     * 传入字体大小,获取字符串的宽度
     * */
    String.prototype.getWidth = function (fontSize) {
        var span = document.getElementById("__getwidth");
        if (span == null) {
            span = document.createElement("span");
            span.id = "__getwidth";
            document.body.appendChild(span);
            span.style.visibility = "hidden";
            span.style.whiteSpace = "nowrap";
        }
        span.innerText = this;
        span.style.fontSize = fontSize + "px";
        return span.offsetWidth;
    };
    String.prototype.notIn = function () {
        var args = arguments;
        for (var i = 0, len = args.length; i < len; i++) {
            if (args[i].toString() == this.toString())
                return false
        }
        return true;
    };
    /****
     * 传入字体大小,获取字符串的高度
     * @param fontSize
     * @returns {number}
     */
    String.prototype.getHeight = function (fontSize) {
        var span = document.getElementById("__getwidth");
        if (span == null) {
            span = document.createElement("span");
            span.id = "__getwidth";
            document.body.appendChild(span);
            span.style.visibility = "hidden";
            span.style.whiteSpace = "nowrap";
        }
        span.innerText = this;
        span.style.fontSize = fontSize + "px";
        return span.offsetHeight;
    };
    /***
     * 获取时间类型的格式化字符串,带有毫秒
     ***/
    Date.prototype.toString = function (t) {
        var rt = '';
        rt += this.getFullYear() + '-';//获取完整的年份(4位,1970-????)
        rt += (this.getMonth() < 9) ? ('0' + (this.getMonth() + 1)) : (this.getMonth() + 1);//获取当前月份(0-11,0代表1月)
        rt += '-';
        rt += (this.getDate() < 10) ? ('0' + this.getDate()) : this.getDate();//获取当前日(1-31)
        if (t == '年月日') return rt;
        rt += ' ';
        rt += (this.getHours() < 10) ? ('0' + this.getHours()) : this.getHours();//获取当前小时数(0-23)
        rt += ':';
        rt += (this.getMinutes() < 10) ? ('0' + this.getMinutes()) : this.getMinutes();//获取当前分钟数(0-59)
        rt += ':';
        rt += (this.getSeconds() < 10) ? ('0' + this.getSeconds()) : this.getSeconds();//获取当前秒数(0-59)
        return rt;
        //+myDate.getDay()+'-'         //获取当前星期X(0-6,0代表星期天)
        //myDate.getTime();        //获取当前时间(从1970.1.1开始的毫秒数)
        //+this.getMilliseconds()   //获取当前毫秒数(0-999)
    };
    //计算对照信息
    k['dz'] = {};
    k['GetDzTextByPk'] = function (dzid, pk) {
        if (k['dz'][dzid] != undefined) {
            var dz = k['dz'][dzid];
            if (dz.obj != undefined) {
                return (dz.obj[pk] == undefined ? pk : dz.obj[pk]);
            }
        }
        return pk;
    };
    k['GetDzNextPkByPk'] = function (dzid, pk) {
        var firstKey = false, nextText = false;
        if (k['dz'][dzid] != undefined) {
            var dz = k['dz'][dzid], dzobj;
            if (dz.obj != undefined) {
                dzobj = dz.obj;
                for (var key in dzobj) {
                    if (key == '' && dzobj[key] == '') {
                        continue;
                    }
                    if (firstKey === false) {
                        firstKey = key;//第一个列的值还是要要拿到的
                    }
                    if (nextText == true) {
                        return key;
                    }//实际执行的时候是首先在下一句为真,才会在下一个循环走到这里
                    if (key == pk) {
                        nextText = true;
                    }//如果键值和传入进来的p能够匹配上,就代表找到了下一个
                }//遍历获取下一个值
                return firstKey;
            }
        }
        return pk + 'canNotGetNextVal';//如果不出现的化 就代表获取不到了
    };
    k['DzCalc'] = function (dzdata) {
        if (dzdata != undefined) {
            var tmp = null, pkCol = '', pkVal = '';
            for (var item in dzdata) {
                if (item == '') continue;
                k['dz'][item] = dzdata[item];
                if (dzdata[item].err == undefined && dzdata[item].data != undefined) {
                    pkCol = dzdata[item].show_pk;
                    pkVal = dzdata[item].show_name;
                    tmp = {'': ''};//先把空值加上
                    for (var i in dzdata[item].data) {
                        tmp[dzdata[item].data[i][pkCol]] = dzdata[item].data[i][pkVal];
                    }
                    k['dz'][item]['obj'] = tmp;
                } else {
                    if (k.Debug) {
                        alert("dzid:" + item + ";获取出错：" + dzdata[item].err);
                    } else {
                        console.log('dzid' + item + ";获取出错：" + dzdata[item].err);//如果对照信息有问题,就要在后台显示出来
                    }
                }//结束dz数据判断
            }//结束for循环
        }
    };
    k['DzCalcArray'] = function (dzdata) {
        if (dzdata != undefined && dzdata.length > 0) {
            var tmp = null, pkCol = '', pkVal = '';
            for (var i = 0, len = dzdata.length; i < len; i++) {
                k['dz'][dzdata[i]['dzid']] = dzdata[i];
                if (dzdata[i].err == undefined && dzdata[i].data != undefined) {
                    pkCol = dzdata[i].show_pk;
                    pkVal = dzdata[i].show_name;
                    tmp = {'': ''};//先把空值加上
                    for (var j = 0, dlen = dzdata[i].data.length; j < dlen; j++) {
                        tmp[dzdata[i].data[j][pkCol]] = dzdata[i].data[j][pkVal];
                    }
                    k['dz'][dzdata[i]['dzid']]['obj'] = tmp;
                } else {
                    if (k.Debug) {
                        alert("dzid:" + item + ";获取出错：" + dzdata[i].err);
                    } else {
                        console.log('dzid' + item + ";获取出错：" + dzdata[i].err);//如果对照信息有问题,就要在后台显示出来
                    }
                }//结束dz数据判断
            }//结束for循环
        }
    };
    //获取浏览器类型
    k.Browser = (function () {
        //获取浏览器的类型
        var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
        var isOpera = userAgent.indexOf("Opera") > -1;
        var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera; //判断是否IE浏览器
        if (isIE) {
            var IE5 = IE55 = IE6 = IE7 = IE8 = false;
            var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
            reIE.test(userAgent);
            var fIEVersion = parseFloat(RegExp["$1"]);
            IE55 = fIEVersion == 5.5;
            IE6 = fIEVersion == 6.0;
            IE7 = fIEVersion == 7.0;
            IE8 = fIEVersion == 8.0;
            if (IE5) {
                return 'IE5';
            }
            if (IE55) {
                return "IE55";
            }
            if (IE6) {
                return "IE6";
            }
            if (IE7) {
                return "IE7";
            }
            if (IE8) {
                return "IE8";
            }
        }//isIE end
        if (userAgent.indexOf("Firefox") > -1) {
            return "Firefox";
        }
        if (userAgent.indexOf("Opera") > -1) {
            return "Opera";
        }
        if (userAgent.indexOf("Chrome") > -1) {
            return "Chrome";
        }
        if (userAgent.indexOf("Safari") > -1) {
            return 'Safari';
        }
    })();
})(window);
/*************************************************************************
 * 提供串行加载js文件的能力
 *************************************************************************/
(function (window) {
    /*********
     * 串联加载:逐个加载，每个加载完成后加载下一个
     * 全部加载完成后执行回调
     * @param scripts 指定的脚本数组
     * @param callback 成功后回调的函数
     * @constructor
     */
    k.syncLoadScripts = function (scripts, callback) {
        if (k.isString(scripts)) {
            scripts = [scripts];
        } else if (!k.isArray(scripts)) {
            return;//如果既不是字符串 又不是数组,就直接返回了
        }
        //获取head标签
        var parent = document.getElementsByTagName("head").item(0) || document.documentElement;
        //定义加载数组
        var s = new Array(), last = scripts.length - 1;
        //定义一个递归函数,从0 一致加载到 数组完毕
        var recursiveLoad = function (i) {  //递归
            s[i] = document.createElement("script");
            s[i].setAttribute("type", "text/javascript");
            //在加载成功时执行下一个加载
            s[i].onload = s[i].onreadystatechange = function () { //Attach handlers for all browsers
                if (!/*@cc_on!@*/0 || this.readyState == "loaded" || this.readyState == "complete") {
                    this.onerror = this.onload = this.onreadystatechange = null;
                    //this.parentNode.removeChild(this);
                    if (i != last)
                        recursiveLoad(i + 1);
                    else if (typeof(callback) == "function")
                        callback();
                }
            };
            s[i].onerror = function () {
                console.log('串行加载js文件到第：' + i + '个时报错了,文件名为:' + scripts[i] + ';,请检查代码!!!');
                this.onerror = this.onload = this.onreadystatechange = null;
                this.parentNode.removeChild(this);
            };
            s[i].setAttribute("src", scripts[i]);//设定好路径
            parent.appendChild(s[i]);
        };
        recursiveLoad(0);
    };
})(window);