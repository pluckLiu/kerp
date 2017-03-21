k.react.DataList = React.createClass({
    getInitialState: function () {
        return { isShow: false };
    },
    componentDidMount: function () {
        this.jQuery = $(ReactDOM.findDOMNode(this));
    },
    componentDidUpdate: function () {
        if (this.state.isShow == true) {
            var datadiv = this.jQuery.find('.kDataList');
            datadiv.css({
                'left': (this.jQuery.innerWidth() - datadiv.outerWidth()) / 2 + 'px',
                'top': '120px'
            });
        }
    },
    showDataList: function (dz_id, dzdata, theClickCell, hostCtrl, inMxPage, mustWcols) {
        //console.info("dz_id, dzdata", dz_id, dzdata);
        k['DzCalcArray'](dzdata['dz']);
        this.refs['searchGrid'].LoadCellOpt(dzdata.topwcols, 3); //给查询条件加载配置,一行3列
        this.refs['dataGrid'].LoadCellOpt(dzdata.gridcols, inMxPage == 'inMxPage' ? true : false); //给表格加载配置,并且设置为不可以多选
        this.refs['dataGrid'].LoadData(dzdata.data); //加载数据
        this.show_pk = dzdata['show_pk']; //实际主键
        this.show_name = dzdata['show_name']; //显示列
        this.theClickCell = theClickCell; //点击列
        this.hostCtrl = hostCtrl;
        this.dz_id = dz_id; //对照id
        this.inMxPage = inMxPage; //在明细界面
        this.mustWcols = mustWcols;
        if (this.inMxPage == 'inMxPage') this.POP_RTCOLS = dzdata['POP_RTCOLS'];
        this.setState({ isShow: true }); //触发显示
    },
    dataListSelect: function (data) {
        if (this.inMxPage == 'inMxPage') return; //在明细添加弹窗界面的时候就没有单行选中的事情了
        var rowData;
        if (data.length > 0) {
            rowData = data[0];
            this.theClickCell.setInput(rowData[this.show_name], rowData[this.show_pk]); //给点击单元格设定内容
        }
        this.close(); //然后关闭
    },
    sure: function (btn) {
        var selectRows = this.refs['dataGrid'].GetSelectRows();
        if (this.inMxPage == 'inMxPage') {
            //在弹窗dsid的情况下,列名是需要进行翻译的
            var sureCols = (this.POP_RTCOLS == null ? '' : this.POP_RTCOLS).split(';'); //因为这里是用新的dsid的值,所以要进行列值方面的修改
            if (sureCols.length > 0 && sureCols[0] != '') {
                var tmp, tcol, acol;
                for (var i = 0, len = selectRows.length; i < len; i++) {
                    //遍历确定数组
                    tmp = selectRows[i];
                    for (var j in sureCols) {
                        acol = sureCols[j].split('-')[0];
                        tcol = sureCols[j].split('-')[1];
                        tmp[tcol] = tmp[acol];
                        if (acol != tcol) {
                            delete tmp[acol]; //当原始列不同的时候才进行更新
                        }
                    } //结束遍历返回列
                } //结束返回数据的列名更改
            } //下面开始用hostCtrl去添加数据
            this.hostCtrl.refs['dataGrid'].AddEditData(selectRows);
            this.close(); //然后关闭
        } else {
            this.dataListSelect(selectRows);
        }
        if (btn != undefined) $(btn).removeClass('noneButton');
    },
    btnClick: function (fn, event) {
        //分发给对应的函数
        //console.info(fn, event.target);
        if (this[fn]) this[fn](event.target);else $(event.target).removeClass('noneButton');
    },
    search: function (btn) {
        var that = this;
        //得到查询数据
        var sdata = this.refs['searchGrid'].GetData();
        if (sdata.Up == undefined) {
            sdata = {};
        } else {
            sdata = sdata.Up;
        }
        //console.info(sdata);
        if (this.inMxPage == 'inMxPage') {
            //加上当时弹窗 所附加的默认查询条件
            if (this.mustWcols != undefined) {
                for (var key in this.mustWcols) {
                    sdata[key] = this.mustWcols[key];
                }
            }
            k.emitRequestToServer('searchDs', {
                mid: this.props.mid,
                dsid: this.dz_id,
                sdata: sdata
            }, function (data) {
                //console.info('服务器返回searchDz数据:', data);
                if (data.err != undefined) {
                    console.info('服务器返回searchDz searchDs数据:', data);
                    if (btn != undefined) $(btn).removeClass('noneButton');
                    return;
                }
                that.refs['dataGrid'].LoadData(data.data); //加载数据
                if (btn != undefined) $(btn).removeClass('noneButton');
            });
        } else {
            k.emitRequestToServer('searchDz', {
                mid: this.props.mid,
                dsid: this.props.dsid,
                dzid: this.dz_id,
                sdata: sdata
            }, function (data) {
                //console.info('服务器返回searchDz数据:', data);
                if (data.err != undefined) {
                    console.info('服务器返回searchDz数据:', data);
                    if (btn != undefined) $(btn).removeClass('noneButton');
                    return;
                }
                that.refs['dataGrid'].LoadData(data); //加载数据
                if (btn != undefined) $(btn).removeClass('noneButton');
            });
        }
    },
    close: function (btn) {
        this.setState({ isShow: false }); //触发关闭
        //取消缓存的查询条件
        if (this.refs['searchGrid'] != undefined) {
            var sdata = this.refs['searchGrid'].GetData();
            if (sdata.Up != undefined) {
                sdata.Up = {};
            }
        }
        this.mustWcols = {};
        if (btn != undefined) $(btn).removeClass('noneButton');
    },
    getDownBtns: function () {
        //下面的按钮
        var DsSearchBtns = [],
            btn;
        var CommonButton = k.react.CommonButton;
        var searchBtns = [{ "NAME": 'close', "BUTN_TEXT": '关闭', "JS_FUNC": 'close' }, { "NAME": 'sure', "BUTN_TEXT": '确定', "JS_FUNC": 'sure' }, { "NAME": 'search', "BUTN_TEXT": '查询', "JS_FUNC": 'search' }];
        for (var i = 0, len = searchBtns.length; i < len; i++) {
            btn = searchBtns[i];
            DsSearchBtns.push(React.createElement(CommonButton, { key: btn['NAME'],
                dsid: this.props.dsid,
                mid: this.props.mid,
                text: btn['BUTN_TEXT'],
                jsFn: btn['JS_FUNC'],
                parentClick: this.btnClick,
                theClass: 'kDzDivButton'
            }));
        }
        return DsSearchBtns;
    },
    render: function () {
        //FromGrid DataGrid的变量
        var SearchGrid = k.react.FormGrid;
        var DataGrid = k.react.DataGrid;
        //如果需要显示的话
        var showStyle = {};
        if (this.state.isShow == true) {
            showStyle = { "display": 'block' };
        }
        //各元素的显示区域
        var kSearchGridStyle = {
            position: "relative",
            marginLeft: "15px",
            marginTop: "12px"
        };
        var kDataGridPanelStyle = {
            position: "relative",
            height: "520px",
            marginLeft: "16px",
            marginRight: "16px",
            marginTop: "0px",
            overflow: "hidden"
        };
        var kSearchBtnsPanelStyle = {
            position: "relative",
            marginLeft: "10px",
            marginTop: "8px",
            minHeight: "30px"
        };
        return React.createElement(
            'div',
            { className: 'kDataListMask', style: showStyle },
            React.createElement(
                'div',
                { className: 'kDataList' },
                React.createElement(SearchGrid, {
                    dsid: this.props.dsid,
                    mid: this.props.mid,
                    topStyle: kSearchGridStyle,
                    parentCtrl: 'DataList',
                    onEnterKeyUp: this.search,
                    ref: 'searchGrid',
                    confCells: []
                }),
                React.createElement(DataGrid, { dsid: this.props.dsid,
                    mid: this.props.mid,
                    topStyle: kDataGridPanelStyle,
                    parentCtrl: 'DataList',
                    dataListSelect: this.dataListSelect,
                    ref: 'dataGrid',
                    confCells: []
                }),
                React.createElement(
                    'div',
                    { className: 'kSearchBtnsPanel', style: kSearchBtnsPanelStyle },
                    this.getDownBtns()
                )
            )
        );
    }
});
