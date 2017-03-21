var DataCell = k.react.DataCell = React.createClass({
    getInitialState: function () {
        var state = {};
        state.where = '';
        if (this.props.parentCtrlType == 'SearchPage' && this.props.colName.indexOf('-') == -1 //在拿到这个列的时候如果本身就有 - 就不用管了,一般用于排除时间控件
        ) {
                if (this.props.dzid == null || this.props.dzid == '') state.where = '-like';else state.where = '-eq';
            }
        return state;
    },
    inputChange: function (event) {
        this.setState({ inputText: event.target.value, isOnChange: true });
        this.props.parentHandChange(this.props.colName + this.state.where, event.target.value, event.target.value);
    },
    keyUp: function (event) {
        if (event.keyCode == 13) {
            this.props.onEnterKeyUp();
        }
    },
    empty: function () {
        this.setState({ inputText: "", isOnChange: true });
    },
    setInput: function (text, val) {
        this.setState({ inputText: text, isOnChange: true });
        this.props.parentHandChange(this.props.colName + this.state.where, val, text);
        //在改变自己的文字 和 改变单元格后,判断是否有后置操作
        var colOpt = this.props.colOpt;
        if (colOpt != undefined && colOpt['AFTER_EDIT'] != undefined && colOpt['AFTER_EDIT'] != '') {
            try {
                var theEval = JSON.parse(colOpt['AFTER_EDIT']);
                //如果是关联dz获取数据
                if (theEval.type == 'relateDzSet' && theEval.relateDzId != '' && theEval.relateDzCols != '' && theEval.setCols != '') {
                    //post查询dz
                    var wcols = {};
                    wcols[cellId] = oneval;
                    k.longajax('searchDz', {
                        data: { dzid: theEval.relateDzId, wcols: JSON.stringify(wcols), json: 1 },
                        success: function (data) {
                            if (data != undefined && data.json != undefined && data.json.data != undefined) {
                                var dzSearch = data.json.data;
                                if (dzSearch.length > 0) {
                                    dzSearch = dzSearch[0]; //取出第一个数据
                                    //按逗号分隔成数组,再获取setCol的配置提取
                                    var relateDzCols = theEval.relateDzCols.split(',');
                                    var setCols = theEval.setCols.split(','),
                                        setColOpt;
                                    for (var i in relateDzCols) {
                                        setColOpt = that.ColOpt[setCols[i]]; //获取到将要设置值得内容
                                        that.SetCellEdit(that.jqGrid.find('#' + setColOpt['NAME'])[0], //找到要复制的列
                                        dzSearch[relateDzCols[i]], //实际的id值
                                        k.GetDzValByPk(setColOpt['DZ_ID'], dzSearch[relateDzCols[i]]) //要显示的值
                                        );
                                    }
                                } //结束有效数据
                            } //结束if
                        } //结束success
                    }); //结束ajax
                } //结束关联拉取
                //如果是通过关联带动ds信息设置到明细datagrid
                else if (theEval.type == 'relateDataGridSet' && theEval.relateDsId != '' && theEval.relateWCols != '' && theEval.setDsId != '') {
                        //先获取所需要的查询条件，relateWCols 用 逗号 分割,用冒号 前面的是本身的列,后面的是用来做查询条件的列
                        var wdata = {},
                            wcols = theEval.relateWCols.split(','),
                            that = this,
                            keyCol,
                            dataCol,
                            dateColValue;
                        for (var i = 0, len = wcols.length; i < len; i++) {
                            dataCol = wcols[i].split(':');
                            if (dataCol.length == 1) {
                                keyCol = dataCol = dataCol[0]; //如果没有冒号,就是同样的列了
                            } else if (dataCol.length == 2) {
                                //如果有2个列,就是第一个列是值列,第二个列是条件列
                                keyCol = dataCol[1];
                                dataCol = dataCol[0];
                            } else {
                                //如果有多个的话,就用第一个了
                                keyCol = dataCol = wcols[0];
                            }
                            dateColValue = this.props.parentCtrl.GetColData(dataCol); //在弹框之前肯定会做判断的,所以这里暂时不搞判断了
                            wdata[keyCol] = dateColValue;
                        }
                        if (k.isFunction(this.props.relateSetDataGrid)) {
                            this.props.relateSetDataGrid(theEval.relateDsId, wdata, theEval.setDsId);
                        } //关联设定明细dsid
                    } //关联明细dsid
            } catch (e) {
                console.info("解析AFTER_EDIT出错：" + colOpt['AFTER_EDIT'], e);
            }
        }
    },
    focus: function (e) {
        e.target.selectionStart = 0;
        e.target.selectionEnd = e.target.value.length;
        //console.info('获取焦点', this.props.dzid,e);
        if (this.props.dzid == null || this.props.dzid == '') return;
        k.AutoEditor.attach($(e.target), this, this.props.dzid);
    },
    blur: function () {
        if (this.props.dzid == null || this.props.dzid == '') return;
        k.AutoEditor.detach();
    },
    selectClick: function () {
        //console.info('selectClick');
        k.AutoEditor.attach(this.input, this, this.props.dzid);
    },
    componentDidMount: function () {
        this.jQuery = $(ReactDOM.findDOMNode(this));
        this.input = $(ReactDOM.findDOMNode(this)).find('input');
        if (this.props.ctrType == 'date') {
            var that = this;
            //$.datetimepicker.setLocale('ch');//设置中文
            this.input.datetimepicker({
                lang: "ch", //语言选择中文
                format: "Y-m-d H:i", //格式化日期 "Y-m-d"
                timepicker: true, //false 关闭时间选项
                yearStart: 2013, //设置最小年份
                yearEnd: 2050, //设置最大年份
                todayButton: false, //false 关闭选择今天按钮
                onSelectDate: function (ct, $i) {
                    that.setInput(ct.toString(), ct.toString());
                },
                onSelectTime: function (ct, $i) {
                    that.setInput(ct.toString(), ct.toString());
                },
                onClose: function (ct, $i) {
                    //console.info('onClose',ct, $i.val());
                    setTimeout(function () {
                        that.setInput(ct.toString(), ct.toString());
                    }, 100);
                }
            });
        } //重复执行这个并不会有多大问题,原因在于:生成查询界面的查询条件时,是触发的这个的
    },
    componentDidUpdate: function () {
        this.input = $(ReactDOM.findDOMNode(this)).find('input');
        if (this.props.ctrType == 'date') {
            var that = this;
            //$.datetimepicker.setLocale('ch');//设置中文
            this.input.datetimepicker({
                lang: "ch", //语言选择中文
                format: "Y-m-d H:i", //格式化日期 "Y-m-d"
                timepicker: true, //false关闭时间选项
                yearStart: 2013, //设置最小年份
                yearEnd: 2050, //设置最大年份
                todayButton: false, //false关闭选择今天按钮
                onSelectDate: function (ct, $i) {
                    that.setInput(ct.toString(), ct.toString());
                },
                onSelectTime: function (ct, $i) {
                    that.setInput(ct.toString(), ct.toString());
                },
                onClose: function (ct, $i) {
                    //console.info('onClose',ct, $i.val());
                    setTimeout(function () {
                        that.setInput(ct.toString(), ct.toString());
                    }, 100);
                }
            });
        }
    },
    componentWillReceiveProps: function (nextProp) {
        //在组件接收到一个新的prop时被调用。这个方法在初始化render时不会被调用。
        this.setState({ inputText: nextProp.textVal, isOnChange: false });
    },
    getCtrlNowText: function () {
        var state = this.state,
            inputText;
        if (state.isOnChange == true) {
            inputText = state.inputText; //当处于更新状态,就用实时的数据
        } else {
            //注意这里,如果填错了属性、或者为空，都会导致第一次渲染没有值，而这会引发报错，
            inputText = this.props.textVal == null ? '' : this.props.textVal; //否则的话,就用当时传过来的数据
        }
        return inputText;
    },
    dataListClick: function () {
        //读取配置看 是否有前置查询条件
        var colOpt = this.props.colOpt,
            dzwol = {};
        if (colOpt['DZ_SEARCH_WCOLS'] != undefined && colOpt['DZ_SEARCH_WCOLS'] != '') {
            var jsobj = JSON.parse(colOpt['DZ_SEARCH_WCOLS']);
            var theCol, theColOpt;
            for (var i in jsobj) {
                theColOpt = this.props.parentCtrl.allColOpt[i];
                theCol = this.props.parentCtrl.GetColData(i);
                //走到这一步如果还是为空,就应该给出提示了
                if (theCol == undefined) {
                    alert('请确保已录入：' + theColOpt['TEXT'] + '!');
                    return;
                } else {
                    dzwol[jsobj[i]] = theCol; //jsobj[i] 用于查询列 theCol 是值
                } ///只有存在的列才合适进行判断
            } //结束for循环
        }
        //弹框控件的点击=>调用父控件的弹框点击函数
        //注意这里是直接从单元格 调用到 查询界面的 根弹框点击函数,所以要全一点：
        this.props.dataListClick(this.props.dzid, this, this.props.parentCtrl, dzwol);
    },
    render: function () {
        //获取渲染字符串
        var renderText = k.GetDzTextByPk(this.props.dzid, this.getCtrlNowText());
        var isMust = React.createElement(
            'span',
            { className: 'kMustSpan' },
            "*"
        );
        if (this.props.isMust != 'T') isMust = null;
        //获取span内容
        var spanText = this.props.text + ':';
        //input的style 有个宽度
        var inputStyle = { width: (this.props.cellWidth - 88).toString() + 'px' };
        if (this.props.CanEdit == false) {
            return React.createElement(
                'div',
                { style: this.props.cellStyle },
                React.createElement(
                    'span',
                    { className: 'kDataCellText' },
                    spanText
                ),
                isMust,
                React.createElement(
                    'span',
                    { className: 'kDataInputNoEdit', style: inputStyle },
                    renderText
                )
            );
        } else if (this.props.ctrType == 'date') {
            //弹框控件,设定弹框对照信息
            return React.createElement(
                'div',
                { style: this.props.cellStyle },
                React.createElement(
                    'span',
                    { className: 'kDataCellText' },
                    spanText
                ),
                isMust,
                React.createElement('input', { className: 'kDataInput',
                    style: inputStyle,
                    value: renderText,
                    onChange: this.inputChange,
                    type: 'text'
                })
            );
        } else if (this.props.dzid == null || this.props.dzid == '') {
            return React.createElement(
                'div',
                { style: this.props.cellStyle },
                React.createElement(
                    'span',
                    { className: 'kDataCellText' },
                    spanText
                ),
                isMust,
                React.createElement('input', { className: 'kDataInput', type: 'text',
                    value: renderText,
                    onChange: this.inputChange,
                    onFocus: this.focus,
                    onKeyUp: this.keyUp,
                    style: inputStyle
                })
            );
        } else if (this.props.ctrType == 'datalist') {
            //弹框控件,设定弹框对照信息
            return React.createElement(
                'div',
                { style: this.props.cellStyle },
                React.createElement(
                    'span',
                    { className: 'kDataCellText' },
                    spanText
                ),
                isMust,
                React.createElement(
                    'span',
                    { className: 'kDataInputNoEdit', style: inputStyle },
                    renderText
                ),
                React.createElement(
                    'span',
                    { className: 'kSpanDatalist', onClick: this.dataListClick },
                    '...'
                )
            );
        } else {
            return React.createElement(
                'div',
                { style: this.props.cellStyle },
                React.createElement(
                    'span',
                    { className: 'kDataCellText' },
                    spanText
                ),
                isMust,
                React.createElement('input', { className: 'kDataInput', type: 'text',
                    value: renderText,
                    onChange: this.inputChange,
                    onFocus: this.focus,
                    onBlur: this.blur,
                    style: inputStyle
                }),
                React.createElement('span', { className: 'kDownArrow', onClick: this.selectClick })
            );
        }
    }
});
k.react.FormGrid = React.createClass({
    getInitialState: function () {
        this.theDataId = this.props.parentCtrl + '-' + this.props.mid + '-' + this.props.dsid;
        return {};
    },
    LoadCellOpt: function (cellOpt, RowColNum) {
        this.setState({ "cellOpt": cellOpt, "RowColNum": RowColNum });
    },
    SetEdit: function (canEdit) {
        this.setState({ CanEdit: canEdit });
    },
    ClearData: function () {
        var mData = this.mData;
        mData.data = {};
        mData.Up = {};
        //清空列数据
        for (var i in this.refs) this.refs[i].empty();
    },
    LoadData: function (data) {
        var mData = this.mData;
        mData.data = data;
        mData.Up = {}; //加载数据的时候,原先修改的内容就要抛弃掉
        this.setState({
            hasData: true,
            theDataId: this.theDataId,
            theTime: k.GetTimeStrMS()
        });
    },
    LoadUpData: function (data) {
        var mData = this.mData;
        mData.data = $.extend(true, {}, data);
        mData.Up = $.extend(true, {}, data);
        this.setState({
            hasData: true,
            theDataId: this.theDataId,
            theTime: k.GetTimeStrMS()
        });
    },
    dataListClick: function (dzid, theCell, dzwol) {
        this.props.dataListClick(dzid, theCell, this, dzwol);
    },
    JudgeMustEdit: function () {
        var allColOpt = this.allColOpt,
            colopt,
            colV = null;
        var rt = '';
        //遍历配置列,获取其对应的值
        for (var i in allColOpt) {
            colopt = allColOpt[i];
            if (colopt.IS_MUST == 'T' && colopt.IS_PK != 'T') {
                colV = this.GetColData(colopt['NAME']);
                if (colV == undefined || colV == '') {
                    rt += colopt.TEXT + '没有录入\r\n';
                }
            }
        }
        return rt;
    },
    GetData: function () {
        return this.mData;
    },
    GetColData: function (colName) {
        var gridData = this.mData,
            colData;
        if (gridData.Up != undefined) colData = gridData.Up[colName];
        if (colData == undefined) colData = gridData.data[colName];
        //对于时间的转换
        if (colName.indexOf('_DATE') >= 0 || colName.indexOf('DATE_') >= 0) {
            if (colData != '' && colData != null && k.isString(colData) && colData.indexOf('T') > 0) {
                colData = colData.replace('T', ' ').replace('Z', ''); //先去掉 T 和 Zs
                colData = new Date(colData); //转化为标准时间
                colData = new Date(colData.getTime() + 8 * 60 * 60 * 1000).toString(); //加上8个时区
            }
            return colData;
        }
        return colData;
    },
    GetDjUpData: function () {
        var gridData = this.mData,
            djUp;
        if (gridData.Up == undefined || k.getPropertyCount(gridData.Up) == 0) return 'noEdit';
        djUp = $.extend(true, {}, gridData.Up);
        if (gridData['data'][this.pkCol] != null) {
            djUp[this.pkCol] = gridData['data'][this.pkCol]; //主键值加入
        } else {
            return { 'Add': [djUp] }; //考虑到新建的情况
        }
        return { 'Up': [djUp] };
    },
    GetDjAddData: function () {
        var gridData = this.mData,
            djUp;
        if (gridData.Up == undefined || k.getPropertyCount(gridData.Up) == 0) return 'noEdit';
        djUp = $.extend(true, {}, gridData.Up);
        djUp[this.pkCol] = '';
        return { 'Add': [djUp] };
    },
    addDateCell: function (formCells) {
        //遍历查询控件的话,把时间类型的控件 拆分成2个!
        var dateCell,
            index = -1,
            tmpObj;
        for (var i = 0, len = formCells.length; i < len; i++) {
            if (formCells[i]['CONTROL_TYPE'] == 'date' && formCells[i]['NAME'].indexOf('-') == -1) {
                index = i;
                break;
            } //如果是时间类型的话,保存下索引
        }
        if (index != -1) {
            dateCell = formCells[index]; //时间控件的配置项
            formCells.splice(index, 1);
            tmpObj = $.extend(true, {}, dateCell);
            tmpObj['NAME'] += '-begin';
            tmpObj['TEXT'] += '开始';
            formCells.push(tmpObj);
            tmpObj = $.extend(true, {}, dateCell);
            tmpObj['NAME'] += '-end';
            tmpObj['TEXT'] += '结束';
            formCells.push(tmpObj);
            this.addDateCell(formCells); //通过递归去找下一个
        }
    },
    getFormCells: function () {
        //console.info('getFormCells');
        var formCols = this.props.confCells;
        //如果state中自己有
        if (this.state != undefined && k.isArray(this.state.cellOpt)) formCols = this.state.cellOpt;
        if (this.props.parentCtrl == 'SearchPage') {
            this.addDateCell(formCols); //加入时间列的开始和结束
        }
        //每一行的列总数
        var RowColNum = 5;
        this.RowColNum = RowColNum;
        if (this.state != undefined && k.isNumber(this.state.RowColNum) && this.state.RowColNum > 2) {
            this.RowColNum = RowColNum = this.state.RowColNum;
        }
        //进行遍历添加
        var formCells = [],
            col,
            cellStyle,
            cellLeft = 0,
            cellTop = 0,
            cellWidth = 0,
            colIndex = 0,
            rowIndex = 0,
            cellText = '',
            gridData = null,
            allColOpt = {};
        //当单元格进行修改、loadData都会触发下面为真
        if (this.state.hasData == true) {
            gridData = this.mData.data;
        }
        for (var i = 0, len = formCols.length; i < len; i++) {
            col = formCols[i];
            allColOpt[col['NAME']] = formCols[i];
            if (col['IS_PK'] == 'T') {
                this.pkCol = col['NAME'];
                continue;
            } //主键值
            if (col['IS_SHOW'] == 'F') continue; //如果不显示就下一个
            //根据其配置开始计算每个单元格的位置
            if (colIndex >= RowColNum) {
                colIndex = 0; //计算出当前单元格出现每行的第几个位置,从0开始,一行最多有5个
                rowIndex++; //
            }
            cellLeft = colIndex * 230; //左边距
            cellTop = rowIndex * 48; //顶部边距
            cellWidth = 230 * (col['COL_SPAN'] == null ? 1 : Number(col['COL_SPAN']));
            //IS_GROUP 用在将来 给单元格分区域用
            //单元格的sytle
            cellStyle = {
                position: "absolute",
                left: cellLeft.toString() + "px",
                top: cellTop.toString() + "px",
                width: cellWidth.toString() + "px",
                height: "28px"
            };
            //在这里计算单元格要展示什么内容
            if (gridData == null) {
                cellText = '';
            } else {
                cellText = gridData[col['NAME']];
            }
            //对于时间的转换
            if (col['NAME'].indexOf('_DATE') >= 0 || col['NAME'].indexOf('DATE_') >= 0 || col['NAME'].indexOf('_TIME') >= 0) {
                if (cellText != '' && cellText != null && k.isString(cellText) && cellText.indexOf('T') > 0) {
                    cellText = cellText.replace('T', ' ').replace('Z', ''); //先去掉 T 和 Zs
                    cellText = new Date(cellText); //转化为标准时间
                    cellText = new Date(cellText.getTime() + 8 * 60 * 60 * 1000).toString(); //加上8个时区
                }
            }
            //如果名字包含MONEY,则要提取成2位小数点,并且带上 羊角符号
            if (col['NAME'].indexOf('_MONEY') >= 0 || col['NAME'].indexOf('MONEY_') >= 0 || col['NAME'].indexOf('_PRICE') >= 0) {
                if (k.isNumber(cellText) && (this.state.CanEdit == false || col['IS_EDIT'] == 'F')) {
                    //最多2位小数点
                    cellText = '￥' + (cellText == undefined || cellText == null ? 0 : cellText).toFixed(2);
                }
            }
            //单元格的配置全部放入
            formCells.push(React.createElement(DataCell, { key: col['NAME'],
                dsid: this.props.dsid,
                mid: this.props.mid,
                text: col['TEXT'],
                textVal: cellText,
                colName: col['NAME'],
                cellStyle: cellStyle,
                parentHandChange: this.cellChange,
                ref: col['NAME'],
                dzid: col['DZ_ID'],
                cellWidth: cellWidth,
                parentCtrlType: this.props.parentCtrl,
                onEnterKeyUp: this.props.onEnterKeyUp,
                dataListClick: this.props.dataListClick,
                CanEdit: this.props.parentCtrl == 'SearchPage' ? true : this.state.CanEdit == false ? false : col['IS_EDIT'] == 'F' ? false : true,
                ctrType: col['CONTROL_TYPE'],
                isMust: col['IS_MUST'],
                colOpt: col,
                parentCtrl: this,
                relateSetDataGrid: this.props.relateSetDataGrid
            }));
            //增加单元格位置
            colIndex += col['COL_SPAN'] == null ? 1 : Number(col['COL_SPAN']);
        }
        this.allColOpt = allColOpt;
        this.height = cellTop + 38;
        //最后进行渲染
        return formCells;
    },
    cellChange: function (colName, value, showText) {
        var mData = this.mData;
        mData.Up = mData.Up == undefined ? {} : mData.Up;
        mData.data = mData.data == undefined ? {} : mData.data;
        mData.Up[colName] = value; //更新数据产生变化
        mData.data[colName] = value; //展示数据也要产生变化,注意这里不需要通过 setState触发重新渲染,因为子控件自己已经搞定，传输给父控件只是让数据统一
    },
    componentDidMount: function () {
        this.mData = {};
    },
    /***************************************
     * 渲染表格界面
     * @returns {XML}
     ***************************************/
    render: function () {
        var formCells = this.getFormCells();
        var topStyle = $.extend(true, {}, this.props.topStyle);
        topStyle['height'] = this.height.toString() + 'Px';
        //console.info('topStyle:', topStyle);
        return React.createElement(
            'div',
            { style: topStyle },
            formCells
        );
    }
});
/* k.flux.updateData(this, {Up: {}, data: {}});//还原成空数据 */
