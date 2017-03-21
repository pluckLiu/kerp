/*************************************************************************
 * k组件 AutoEditor 智能编辑框控件
 *************************************************************************/
;(function (window, $) {
    if (window.k == undefined) window.k = {};
    var k = window.k;
    k.AutoEditor = {
        HideDz: function () {
            this.kDzData.empty().hide();
            this.selectindex = -1;
        },
        init: function () {
            var that = this;
            this.kDzData = $('#kDzSelect');//对照数据下拉显示框
            //当下拉框内有鼠标进入的时候,就高亮对应的元素
            this.kDzData.on('mouseenter', 'li', function () {
                $(this).siblings().removeClass("khighlight");//去除所有同辈元素的高亮属性
                $(this).addClass("khighlight");
                that.selectindex = that.kDzData.children('li').index(this);
            });
            this.kDzData.on('mouseleave', 'li', function () {
                $(this).removeClass("khighlight");
            });
            this.kDzData.on('mousedown', 'li', function (event) {
                that.setItem(that.selectindex);
                that.kDzData.css({'display': 'none'});
                event.preventDefault();
            });
        },
        attach: function (textEdit, theReact, dzid) {
            var that = this;
            //设置相关属性变量
            this.textEdit = textEdit;//输入框
            this.reactCtrl = theReact;//谁调用的这个控件
            this.selectindex = -1;//下拉框当前选中索引
            this.isDzShow = false;//是否显示下拉数据框
            this.dzid = dzid;
            this.HideDz();//先隐藏编辑框
            //输入框进行键盘事件注册
            this.textEdit.on('keyup', function (e) {
                return that.EditKeyUp(e);
            });
            this.kDzData.width(this.textEdit.width());
            //获取相对(父元素)位置:
            this.kDzData.css({
                'position': 'absolute',
                'left': this.textEdit.offset().left + "px",
                'top': (this.textEdit.offset().top + this.textEdit[0].clientHeight + 2) + "px",
                'z-index': "1000",
                'display': 'block',
                //'max-height': '138px',
                'min-width': '100px'
            });
            this.render(true);
        },
        reSize: function () {
            if (this.textEdit != undefined && k.isFunction(this.textEdit.offset())) {
                this.kDzData.css({
                    'position': 'absolute',
                    'left': this.textEdit.offset().left + "px",
                    'top': (this.textEdit.offset().top + this.textEdit[0].clientHeight + 2) + "px",
                    'z-index': "1000",
                    'display': 'block',
                    //'max-height': '138px',
                    'min-width': '100px'
                });
            }
        },
        EditKeyUp: function (event) {
            //判断按键是否是:上下左右\enter\tab键
            //如果不是,进行字符匹配,找到下拉项
            var kc = event.keyCode, that = this;
            //9:tab 13:enter 27:esc 37:Left 38:Up 39:Right 40:down 8:删除键 32:空格键
            if (kc > 40 || kc == 8 || kc == 32) {
                that.HideDz();
                that.render();//检索数据时,由于数量顶多100行,不会卡死,所以直接查就行了
                return;
            }
            //如果是下拉，上下 键 负责切换选中item
            if (kc == 38) { //上
                if (that.selectindex == -1) {
                    that.setItem(that.kDzData.find('li').length - 1);//that.selectindex = -1 代表还没有选中过,所以设置成最后一个
                } else {
                    that.setItem(that.selectindex - 1);//索引减1
                }
                event.preventDefault();//阻止默认事件
            } else if (kc == 40) { //下
                if (that.selectindex == -1) {
                    that.setItem(1);//that.selectindex = -1 代表还没有选中过,所以设置成第一个
                } else {
                    that.setItem(that.selectindex + 1); //索引加1
                }
                event.preventDefault();
            } else if (kc == 13) {//回车代表就取当前的这个了
                //如果列表为空或者当前没有索引值
                if (this.kDzData.find('li').length == 0 || that.selectindex == -1) {
                    that.selectindex = -1;
                    return;
                }
                that.setItem(that.selectindex);
                that.HideDz();//把下拉隐藏
                event.preventDefault();
            }
        },
        render: function (isAllMatch) {
            if (k['dz'][this.dzid] == undefined)return;//如果不存在这个对照信息,就不用管
            var dz = k['dz'][this.dzid].obj;//获取实际的对照数据
            if (dz == undefined)return;//对照数据不存在,也可以算了
            var value = this.textEdit.val();//获取input内容
            //var reg = new RegExp(value);//正则表达式//遇到这种会报错： Invalid regular expression: /本地菠菜（23-25cm)/: Unmatched ')'
            var select = this.kDzData;//下拉区域
            select.html('').hide();//先重置内容
            this.isDzShow = false;//目前对照信息没有显示
            this.show_pk = k['dz'][this.dzid].show_pk;//主键列
            this.show_name = k['dz'][this.dzid].show_name;//显示出来的列
            var no = 0;//总共能匹配多少个
            for (var i in dz) {
                if (isAllMatch == true || value == "" || dz[i].indexOf(value) >= 0) {
                    no++;
                    $("<li />").text(dz[i]).appendTo(select).attr('dzpkval', i);
                }//如果能匹配到
            }
            if (no > 0) {
                select.show();//能匹配到就显示出来
                select.children().first().addClass('khighlight');//第一个都设置高亮
                this.selectindex = -1;
                this.isDzShow = true;
            }
        },
        setItem: function (index) {
            var that = this;
            //按上下键是循环显示的，小于0就置成最大的值，大于最大值就置成0
            var len = this.kDzData.find('li').length - 1;
            if (index < 0) {
                this.selectindex = len;
            } else if (index > len) {
                this.selectindex = 0;
            } else
                this.selectindex = index;
            //先移除其他项的高亮背景，再高亮对应索引的背景
            var li = this.kDzData
                .find('li')
                .removeClass('khighlight')
                .eq(this.selectindex).addClass('khighlight');
            //绑定数据
            this.reactCtrl.setInput(
                this.kDzData.children('li').eq(that.selectindex).text(),//要展示的内容
                this.kDzData.children('.khighlight').first().attr('dzpkval')
            );
            /*切换滚动条
             if (li[0].offsetTop + li[0].offsetHeight == this.kDzData[0].scrollHeight) {
             //如果选中项：顶部位置+自己高度 等于 整个对照区的滚动区高度,那就说明这次到底了,所以把滚动条Top更新到最大值
             this.kDzData[0].scrollTop = this.kDzData[0].scrollHeight - this.kDzData[0].clientHeight;
             } else if (li[0].offsetTop >= (this.kDzData[0].clientHeight + this.kDzData[0].scrollTop)) {
             //如果选中项：顶部位置 大于等于 对照区 高度与滚动条位置,说明超出了一格,于是需要向下前进一次,注意一定要有等于,否则下一行永远显示不出来
             this.kDzData[0].scrollTop += li[0].offsetHeight;
             } else if (li[0].offsetTop <= this.kDzData[0].scrollTop) {
             //如果选中项：顶部位置 小于等于 对照区 滚动条位置,则说明在上面了,于是需要更新一次
             this.kDzData[0].scrollTop = li[0].offsetTop;
             }*/
        },
        detach: function () {
            if (this.textEdit != undefined) {
                this.textEdit.off('keyup');
                this.textEdit.blur();
            }
            if (this.kDzData != undefined) this.kDzData.css({'display': 'none'});//获取相对(父元素)位置:
            this.reactCtrl = null;
            this.textEdit = undefined;
        }
    };
})(window, jQuery);