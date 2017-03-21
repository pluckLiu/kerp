//把 style 和 react 组件 都缓存起来
if (!window.k) {
    window.k = {};
}
k.rstyle = {};//为react存储的style
k.react = {};//存储由这个初始化函数创建出来的react模块
var data = {};//实际的数据,在删除数据的时候一定要记得处理这里
var dataInstance = {};//实际的数据持有者,在删除数据的时候一定要记得处理这里
var dataType = {};//数据的类定义池,用法是 new dataType['type']
var dataTypeFunc = {};//数据类的外挂函数,防止被人破解利用
var dataChangeCb = {};//数据改变后的回调
//下面的这个是 数据类型 都会自带的默认函数
var typePrototype = {
    //处理动作的函数,去找到当时缓存的函数,然后调用
    handleAction: function (action) {
        var type = this.getDataType();
        if (dataTypeFunc[type] && k.isFunction(dataTypeFunc[type].actionHandler)) {
            //调用处理器函数
            //console.info(' dataInstance handleAction ');
            dataTypeFunc[type].actionHandler.apply(this, [action.action, action.body]);
            //如果处理器中设置了变化的话
            if (this.isChange) {
                var kid = this.getKid();
                var changeCbs = dataChangeCb[type][kid];
                for (var i = 0, len = changeCbs.length; i < len; i++) {
                    //调用的时候传递的是 数据与 数据实例,这里经过了测试,回调函数内部的this 就是当初赋值的那个
                    changeCbs[i](this.getData(), action.action);
                }
                this.isChange = false;//调用完回调函数后,重置状态
            }
        }
    },
    destroy: function () {
        var typedata = data[this.getDataType()];
        delete typedata[this.getKid()];
    },
    addChangeCallBack: function (cb) {
        var type = this.getDataType();
        var kid = this.getKid();
        var changeCbs = dataChangeCb[type][kid];
        changeCbs.push(cb);
    }
};
/***
 * flux 的实现代码
 * @type {{getDataById: k.flux.getDataInsById, emitAction: k.flux.emitAction, registerDataType: k.flux.registerDataType, updateData: k.flux.updateData}}
 */
k.flux = {
    getDataInsById: function (type, kid) {
        if (!dataType[type] || !k.isFunction(dataType[type]))
            return null;
        //如果实例所属分类不存在,就返回null
        if (dataInstance[type] == undefined)
            return null;
        return dataInstance[type][kid] == undefined
            ? {
                getData: function () {
                    return null;
                }
            }
            : dataInstance[type][kid];
    },
    addDataById: function (type, kid, initArgs) {
        if (!dataType[type] || !k.isFunction(dataType[type]))
            return null;
        //首先要保证实例所属的分类是存在的
        if (!dataInstance[type])
            dataInstance[type] = {};
        //然后创建这种类型的实例
        if (!dataInstance[type][kid])
            dataInstance[type][kid] = new dataType[type](type, kid, initArgs);
        return dataInstance[type][kid];
    },
    deleteDataById: function (type, kid) {
        var typedata = data[type];
        delete typedata[kid];
        delete dataInstance[type][kid];
    },
    /****
     * 向指定的数据类型 发射一个动作处理
     * @param type
     * @param kid
     * @param actionname
     * @param actionbody
     * @returns {boolean}
     */
    emitAction: function (type, kid, actionname, actionbody) {
        //console.info('flux emitAction:',type,kid,actionname,actionbody);
        //找到对应的data 实例 并调用处理函数
        if (dataInstance[type] && dataInstance[type][kid]) {
            dataInstance[type][kid].handleAction({
                "action": actionname,
                "body": actionbody
            });
            return true;
        }
        return false;
    },
    /***
     * 向 flux 注册数据类型
     * @param type 数据的类型
     * @param opts 必须包含 initData 和 actionHandler 函数
     * @returns {boolean}
     */
    registerDataType: function (type, opts) {
        //是否注册过的判断
        if (dataType[type]) {
            console.info('已经注册过这个数据类型了!');
            return false;
        }
        //检查类型
        if (!opts.initData || !k.isFunction(opts.initData)) {
            console.info(type + '注册缺少初始化数据函数!');
            return false;
        }
        if (!opts.actionHandler || !k.isFunction(opts.actionHandler)) {
            console.info(type + '注册缺少Action处理函数!');
            return false;
        }
        //缓存好 初始化数据函数 以及 处理action函数
        dataTypeFunc[type] = {
            initData: opts.initData,
            actionHandler: opts.actionHandler
        };
        //把剩余的属性都赋值给 prototype
        delete opts.initData;
        delete opts.actionHandler;
        //实际的对象
        dataType[type] = function (_type, kid, initArgs) {
            //先确保data 中有这种类型的存在
            if (!data[_type])
                data[_type] = {};
            //再把实际的id结合 type 存储进去
            data[_type][kid] = dataTypeFunc[_type].initData(initArgs);
            //把change类型创建出来
            if (!dataChangeCb[_type])
                dataChangeCb[_type] = {};
            dataChangeCb[_type][kid] = [];
            this.isChange = false;
            //通过闭包来引用
            this.getDataType = function () {
                return _type;
            };
            this.getKid = function () {
                return kid;
            };
            this.getData = function () {
                return data[_type][kid];
            };
        };
        dataType[type].prototype = jQuery.extend({}, opts, typePrototype);
        return true;
    },
    /***
     * 直接更新数据,并且通过后面的更新标记,来控制是否变化了
     * @param refdata
     * @param _data
     * @param updateChange
     */
    updateData: function (refdata, _data, updateChange) {
        var type = refdata.getDataType();
        var kid = refdata.getKid();
        data[type][kid] = _data;
        if (updateChange == undefined || updateChange == true)
            refdata.isChange = true;
        else
            refdata.isChange = false;
    }
};