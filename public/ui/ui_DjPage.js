var GaiZhang = k.react.GaiZhang = React.createClass({
    getInitialState: function () {
        return { isShow: false, bt: '', man: '', date: '' };
    },
    render: function () {
        var outStyle = {
            position: "absolute",
            display: 'none',
            right: "180px",
            top: "100px",
            border: "2px solid #E65051",
            borderRadius: "4px",
            width: "88px",
            height: "83px",
            boxShadow: "rgba(0,0,0,0.6) 3px 3px 4px",
            fontSize: "13px",
            fontWeight: "bold",
            color: "#E65051",
            textAlign: "center",
            zIndex: '1'
        };
        if (this.state.isShow == true) outStyle.display = 'block';
        var btStyle = {
            display: "block",
            margin: "2px auto",
            fontSize: "inherit"
        };
        var manStyle = {
            display: "block",
            margin: "2px auto",
            fontSize: "inherit"
        };
        var dateStyle = {
            display: "block",
            margin: "5px auto",
            fontSize: "inherit"
        };
        return React.createElement(
            'div',
            { id: this.props.dsid + "_gaizhang", className: 'verifyGZ', style: outStyle },
            React.createElement(
                'span',
                { style: btStyle },
                this.state.bt
            ),
            React.createElement(
                'span',
                { style: manStyle },
                this.state.man
            ),
            React.createElement(
                'span',
                { style: dateStyle },
                this.state.date
            )
        );
    }
});
var MxPage = k.react.MxPage = React.createClass({
    getMxPageBtns: function () {
        var pageOpt = this.props.pageOpt;
        var dsbutns = pageOpt['dsbutns'];
        if (dsbutns == undefined || dsbutns.length == 0) return [];
        var MxDjBtns = [],
            btn;
        var CommonButton = k.react.CommonButton;
        for (var i = 0, len = dsbutns.length; i < len; i++) {
            btn = dsbutns[i];
            MxDjBtns.push(React.createElement(CommonButton, { key: 'djPage' + btn['NAME'],
                dsid: this.props.dsid,
                mid: this.props.mid,
                text: btn['BUTN_TEXT'],
                jsFn: btn['JS_FUNC'],
                proc: btn['DB_PROC'],
                parentCtrType: "MxPage",
                parentClick: this.btnClick
            }));
        }
        return MxDjBtns;
    },
    btnClick: function (fn, event, proc, btid) {
        //分发给对应的函数
        if (this.canEdit == true) {
            if (this[fn]) return this[fn](event.target, proc, btid);else {
                console.info(fn, event.target);
                $(event.target).removeClass('noneButton');
            }
        } else {
            console.info("现在不是修改状态", fn, event.target);
            $(event.target).removeClass('noneButton');
        }
    },
    popSearch: function (btn, proc, btid) {
        console.info("btn, proc, btid", btn, proc, btid);
        if (k.isString(proc) && proc != '') {
            //将来可以加上 主表的关联查询列,用 ds_id-key:data,key:data 分隔
            var dsid, wcols, key, keyData;
            proc = proc.split('-');
            if (proc.length <= 1) dsid = proc;else {
                wcols = {};
                dsid = proc[0];
                keyData = proc[1].split(',');
                for (var i = 0, len = keyData.length; i < len; i++) {
                    key = keyData[i].split(':');
                    wcols[key[0] + '-like'] = this.props.djPage.refs['mainDj'].GetColData(key[1]);
                }
            }
            this.props.dataListClick(dsid, this, this, wcols, 'inMxPage'); //这里调用的SearchPage的
        }
        if (btn != undefined) $(btn).removeClass('noneButton');
    },
    delGridRow: function (btn) {
        this.refs['dataGrid'].DelAllSelect();
        if (btn != undefined) $(btn).removeClass('noneButton');
    },
    addGridRow: function (btn) {
        this.refs['dataGrid'].AddEditData([{}]);
        if (btn != undefined) $(btn).removeClass('noneButton');
    },
    componentDidMount: function () {
        this.jQuery = $(ReactDOM.findDOMNode(this));
        var pageOpt = this.props.pageOpt;
        var gridCols = pageOpt['gridCols'];
        if (gridCols == undefined || gridCols.length == 0) return;
        this.refs['dataGrid'].LoadCellOpt(gridCols, true); //给表格加载配置,并且可以多选
        this.refs['dataGrid'].LoadData(pageOpt.data);
        this.refs['dataGrid'].SetCanUse(this.props.canUse); //只在初始化的时候才去控制是否可以编辑,即详情界面第一次打开状态
    },
    LoadDataGridData: function (data) {
        this.refs['dataGrid'].LoadData(data);
    },
    render: function () {
        var kDataGridPanelStyle = {
            position: "relative",
            height: "560px",
            marginLeft: "0px",
            marginRight: "16px",
            marginTop: "0px",
            width: "100%",
            overflow: "hidden",
            border: "1px solid rgb(153, 153, 153)"
        };
        var kMxDjBtnsPanelStyle = {
            position: "relative",
            marginLeft: "10px",
            marginTop: "-4px"
        };
        var DataGrid = k.react.DataGrid;
        var className = "kMxPage";
        className += this.props.isSelect == true ? ' kShow' : '';
        return React.createElement(
            'div',
            { className: className },
            React.createElement(
                'div',
                { className: 'kMxDjBtnsPanel', style: kMxDjBtnsPanelStyle },
                this.getMxPageBtns()
            ),
            React.createElement(DataGrid, { dsid: this.props.dsid,
                mid: this.props.mid,
                topStyle: kDataGridPanelStyle,
                parentCtrl: 'DjPage_MxPage',
                dataListSelect: this.dataListSelect,
                ref: 'dataGrid',
                confCells: this.props.pageOpt["gridCols"]
            })
        );
    }
});
/*************************
 详情页控件：
 模块界面z-index分布：
 tab条高于查询页
 查询页的弹框 高于其他所有元素
 详情界面高于除弹框外元素
 而一个datagrid 最高用到了3 ，算作5
 详情界面用 6-10
 弹框用10-15
 tab条用 20
 *************************/
k.react.DjPage = React.createClass({
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
    showDjPage: function (dsid, data, isAddds) {
        console.info('showDjPage：', data);
        if (data[dsid] == undefined) {
            console.info('showDjPage return 原因：data[dsid] == undefined,dsid,data', dsid, data);
            return;
        }
        this.editPageData = data;
        this.mainDsId = dsid;
        this.pkVal = data.pkVal;
        this.dafaultData = data[dsid]['dafaultData'];
        k['DzCalcArray'](data[dsid]['dz']);
        this.refs['mainDj'].LoadCellOpt(data[dsid].djcols, 5); //给查询条件加载配置,一行5列
        this.refs['mainDj'].LoadData(data[dsid].data[0]); //载入数据
        //判断是否存在明细表格
        if (data.dsids.length > 1) {
            var mx = [];
            for (var i = 0, len = data.dsids.length; i < len; i++) {
                if (data.dsids[i] != dsid) {
                    mx.push(data.dsids[i]); //压入明细的dsid
                    k['DzCalcArray'](data[data.dsids[i]]['dz']);
                }
            } //遍历找到明细
            this.mxPage = mx;
        }
        this.SetCanEdit(false); //由于 setState 是用 timer触发的,所以在这里面要设置一个可以编辑的状态
        this.LoadGaiZhange(data);
        this.setState({ isShow: true }); //触发显示,在显界面,明细表格会自己找到数据
        if (isAddds == true) this.addds();
    },
    SetCanEdit: function (canEdit) {
        this.refs['mainDj'].SetEdit(canEdit);
        this.canEdit = canEdit;
        if (this.mxPage != undefined && this.mxPage.length > 0) {
            var dsid;
            for (var i = 0, len = this.mxPage.length; i < len; i++) {
                dsid = this.mxPage[i];
                if (dsid != this.mainDsId && this.refs['mxPage-' + dsid] != undefined) {
                    this.refs['mxPage-' + dsid].refs['dataGrid'].SetCanUse(canEdit); //载入明细的数据
                    this.refs['mxPage-' + dsid].canEdit = canEdit; //不可以点击
                }
            } //遍历明细表格
        }
    },
    LoadGaiZhange: function (data) {
        if (data == undefined) {
            this.isVerify = '0';
            this.refs['verifyGZ'].setState({ isShow: false });
            return;
        }
        var mainData = data[this.mainDsId]; //先获取主表数据
        if (mainData == undefined) {
            this.isVerify = '0';
            this.refs['verifyGZ'].setState({ isShow: false });
            return;
        }
        var djInfo = mainData['djinfo']; //获取单据信息,这里面包含了审核
        if (djInfo == undefined || djInfo.length == undefined || djInfo.length == 0) {
            this.isVerify = '0';
            this.refs['verifyGZ'].setState({ isShow: false });
            return;
        }
        //有审核数据 才盖章
        if (djInfo[0]['IS_VERIFY'] == '1') {
            this.isVerify = '1';
            this.refs['verifyGZ'].setState({
                isShow: true,
                bt: '已审核',
                man: djInfo[0]['VERIFY_MANHZ'],
                date: djInfo[0]['VERIFY_DATEHZ']
            });
        } else {
            this.isVerify = '0';
            this.refs['verifyGZ'].setState({ isShow: false });
        }
    },
    LoadEditPageData: function (data) {
        if (data == undefined) return;
        if (data.dsids == undefined) return;
        //载入详情主表界面数据
        var that = this;
        k['DzCalcArray'](data[this.mainDsId]['dz']);
        this.refs['mainDj'].LoadData(data[this.mainDsId].data[0]);
        //载入主表明细数据
        var dsids = data.dsids,
            dsid;
        for (var i = 0, len = dsids.length; i < len; i++) {
            dsid = dsids[i];
            if (dsid != this.mainDsId) {
                k['DzCalcArray'](data[dsid]['dz']);
                that.refs['mxPage-' + dsid].LoadDataGridData(data[dsid].data);
            }
        }
        //盖章数据更新
        this.LoadGaiZhange(data);
    },
    relateSetDataGrid: function (dsid, wcols, setDsId) {
        //console.info('dsid,wcols',dsid,wcols);
        var that = this;
        k.CallServerAPI('searchDs', {
            mid: this.props.mid,
            dsid: dsid,
            sdata: wcols
        }, function (data) {
            //console.info('relateSetDataGrid服务器返回 searchDs数据:', data);
            that.refs['mxPage-' + setDsId].refs['dataGrid'].DeleteAllData(); //先清空所有数据
            if (k.isArray(data.data) && data.data.length > 0) {
                that.refs['mxPage-' + setDsId].refs['dataGrid'].AddEditData(data.data); //再添加对应数据
            }
        });
    },
    dataListSelect: function (data) {
        var rowData;
        if (data.length > 0) {
            rowData = data[0];
            this.theClickCell.setInput(rowData[this.show_name], rowData[this.show_pk]); //给点击单元格设定内容
        }
        this.close(); //然后关闭
    },
    btnClick: function (fn, event, isProc, btid) {
        //分发给对应的函数
        //console.info(fn, event.target);
        if (this.canEdit == true && fn != 'save' && fn != 'close') {
            alert('本单处于修改状态中,请先保存!!!');
            $(event.target).removeClass('noneButton');
            return;
        }
        if (this[fn]) return this[fn](event.target);else if (isProc == true) this.execProc(fn, btid, event.target);else $(event.target).removeClass('noneButton');
    },
    execProc: function (fn, btid, btn) {
        var that = this;
        if (btid == 'verify' && this.mxPage != undefined && this.mxPage.length > 0) {
            var mxdsid, mxPage, gdata;
            for (var i = 0, len = this.mxPage.length; i < len; i++) {
                mxdsid = this.mxPage[0];
                mxPage = this.refs['mxPage-' + mxdsid];
                if (mxPage != undefined && mxPage.refs['dataGrid'] != undefined) {
                    gdata = mxPage.refs['dataGrid'].GetData();
                    if (gdata != undefined && gdata.length == 0) {
                        alert('明细数据为空,不可以审核!!!');
                        if (btn != undefined) $(btn).removeClass('noneButton');
                        return;
                    }
                } //判断数据表是否为空
            } //遍历明细界面
        } //审核要判断明细是否为空
        k.CallServerAPI('execProc', {
            mid: this.props.mid,
            dsid: this.mainDsId,
            jsfn: fn,
            btid: btid,
            pkVal: this.pkVal
        }, function (data) {
            that.LoadEditPageData(data);
            if (data.outProc != undefined && data.outProc != '' && data.outProc.length > 0) {
                alert(data.outProc); //存储过程的提示要给出来
            }
            that.refs['mainDj'].SetEdit(false); //不可以修改
            if (btn != undefined) $(btn).removeClass('noneButton');
        });
    },
    exportExcelByNode: function (btn) {
        //导出请求
        k.CallServerAPI('exportExcelByNode', {
            mid: this.props.mid,
            dsid: this.mainDsId,
            type: 'djpage',
            pkVal: this.pkVal
        }, function (data) {
            if (data.fileName != undefined) {
                window.open("http://" + window.location.host + '/download/' + data.fileName);
                //console.info("http://" + window.location.host + '/' + data.fileName);
            } else console.info('服务器返回数据:', data);
            if (btn != undefined) $(btn).removeClass('noneButton');
        });
    },
    save: function (btn) {
        var that = this;
        var mustJudge = this.refs['mainDj'].JudgeMustEdit(); //判断必录数据是否ok
        if (mustJudge != '') {
            alert(mustJudge);
            if (btn != undefined) $(btn).removeClass('noneButton');
            return false;
        } //GetUpData
        var isMxUp = false,
            mxUpdata; //判断明细是否修改过
        if (this.mxPage != undefined && this.mxPage.length > 0) {
            var dsid;
            for (var i = 0, len = this.mxPage.length; i < len; i++) {
                dsid = this.mxPage[i];
                if (dsid != this.mainDsId) {
                    mxUpdata = this.refs['mxPage-' + dsid].refs['dataGrid'].GetUpData(); //获取数据表格的修改数据
                    if (mxUpdata != 'noEdit') {
                        isMxUp = true;
                    } //设定明细已经修改过
                } //不是主dsid 才做这个判断
            } //遍历明细界面
        } //结束明细是否有修改过
        var mainDjUp = that.isInAdd == true ? this.refs['mainDj'].GetDjAddData() : this.refs['mainDj'].GetDjUpData(); //得到主表的修改数据
        //如果没有修改数据,就直接返回即可
        if (mainDjUp == 'noEdit' && isMxUp == false) {
            that.SetCanEdit(false); //不可以修改
            if (btn != undefined) $(btn).removeClass('noneButton');
            return false;
        } else if (mainDjUp == 'noEdit' && isMxUp == true) {
            if (this.isInAdd == true) mainDjUp = { Add: [{}] };else mainDjUp = {};
        } else if (this.isInAdd == true && mainDjUp != 'noEdit' && this.mxPage != undefined && this.mxPage.length > 0 && isMxUp == false && this.mainDsId.toString().notIn('ds_productin', 'ds_yl_pd', 'ds_cominfo')) {
            alert('请录入明细数据!');
            if (btn != undefined) $(btn).removeClass('noneButton');
            return false;
        }
        //拼接主明细表的修改数据
        var dsids = { "d0": this.mainDsId };
        var data = { "dsids": dsids, "d0": mainDjUp };
        if (this.mxPage != undefined && this.mxPage.length > 0) {
            var dsid;
            for (var i = 0, len = this.mxPage.length; i < len; i++) {
                dsid = this.mxPage[i];
                if (dsid != this.mainDsId) {
                    mxUpdata = this.refs['mxPage-' + dsid].refs['dataGrid'].GetUpData(); //获取数据表格的修改数据
                    if (mxUpdata != 'noEdit') {
                        dsids['d' + (i + 1).toString()] = dsid;
                        data['d' + (i + 1).toString()] = mxUpdata;
                    } //设定明细修改数据
                } //不是主dsid 才做这个判断
            } //遍历明细界面
        } //结束明细是否有修改过
        //发送服务器保存
        k.CallServerAPI('saveds', {
            mid: this.props.mid,
            dsid: this.mainDsId,
            save: data,
            isInEditPage: 1,
            pkVal: this.pkVal
        }, function (data) {
            console.info("saveapi:", data);
            if (k.isArray(data.saveCheck)) {
                var msg = "";
                for (var i = 0, len = data.saveCheck.length; i < len; i++) msg += data.saveCheck[i].toString() + "\r\n";
                alert(msg);
                return;
            }
            that.isInAdd = false; //重置为已经修改数据
            that.LoadEditPageData(data); //加载详情数据
            that.pkVal = data.pkVal; //设定主键列
            if (data.outProc != undefined && data.outProc != '' && data.outProc.length > 0) {
                alert(data.outProc); //存储过程的提示要给出来
            } else alert('保存成功!');
            that.SetCanEdit(false); //设置成不可以编辑
            if (btn != undefined) $(btn).removeClass('noneButton'); //去除按钮不动
        }, 10000);
    },
    edit: function (btn) {
        if (this.isVerify == '1') {
            alert('已审核数据,不可修改!!!');
            if (btn != undefined) $(btn).removeClass('noneButton');
            return;
        }
        this.SetCanEdit(true);
        if (btn != undefined) $(btn).removeClass('noneButton');
    },
    addds: function (btn) {
        this.refs['btn-save'].setState({ text: "保存", jsFn: "save" }); //改变按钮状态
        this.isInAdd = true; //在添加状态中了
        this.SetCanEdit(true);
        this.LoadGaiZhange();
        for (var i in this.refs) {
            ////遍历明细,设定成可以编辑
            if (i != 'mainDj' && i.toString().indexOf('mxPage') >= 0) {
                this.refs[i].refs['dataGrid'].SetCanEdit(true);
            }
        } //遍历明细,设定成可以编辑
        if (this.dafaultData != undefined && this.dafaultData.length > 0) {
            this.refs['mainDj'].LoadUpData(this.dafaultData[0]); //载入主表数据,用作默认数据
        } else {
            this.refs['mainDj'].LoadUpData({});
        }
        if (this.mxPage != undefined && this.mxPage.length > 0) {
            var dsid;
            for (var i = 0, len = this.mxPage.length; i < len; i++) {
                dsid = this.mxPage[i];
                if (dsid != this.mainDsId) {
                    this.refs['mxPage-' + dsid].LoadDataGridData([]); //载入明细的数据
                }
            }
        } //遍历明细清空数据
        if (btn != undefined) $(btn).removeClass('noneButton');
    },
    close: function (btn) {
        if (btn != undefined) $(btn).removeClass('noneButton');
        this.editPageData = undefined;
        this.mxPage = undefined;
        this.setState({ isShow: false }); //触发关闭
    },
    getMainDjBtns: function () {
        //下面的按钮
        if (this.editPageData == undefined) return [];
        var MainDjBtns = [],
            btn;
        var CommonButton = k.react.CommonButton;
        var mainDjBtns = this.editPageData[this.mainDsId]['dsbutns'];
        //遍历确保 新版导出 存在
        var isNewExportExists = false;
        for (var i = 0, len = mainDjBtns.length; i < len; i++) {
            if (mainDjBtns[i]['JS_FUNC'] == 'exportExcelByNode') isNewExportExists = true;
        }
        if (isNewExportExists == false) mainDjBtns.push({
            'NAME': 'exportExcelByNode',
            'BUTN_TEXT': '导出Excel',
            'JS_FUNC': 'exportExcelByNode'
        });
        mainDjBtns.push({ "NAME": "Close", "BUTN_TEXT": "关闭", "JS_FUNC": "close" });
        for (var i = 0, len = mainDjBtns.length; i < len; i++) {
            btn = mainDjBtns[i];
            if (btn['JS_FUNC'] == 'save') {
                btn['JS_FUNC'] = 'edit';
                btn['BUTN_TEXT'] = '修改';
            }
            MainDjBtns.push(React.createElement(CommonButton, { key: 'djPage' + btn['NAME'],
                dsid: this.mainDsId,
                mid: this.props.mid,
                text: btn['BUTN_TEXT'],
                jsFn: btn['JS_FUNC'],
                proc: btn['DB_PROC'],
                btid: btn['NAME'],
                parentClick: this.btnClick,
                ref: 'btn-' + btn['NAME']
            }));
        }
        return MainDjBtns;
    },
    selectTab: function (e) {
        //console.info(e.target.id);
        /*
         if (this.mxPage && this.mxPage.length > 1) {
         this.setState({isGetDsPages: true, selectDsId: e.target.id});//只有多个tab页面的时候才会生效
         }*/
        //遍历让其他的明细界面变为失效状态
        if (this.mxPage != undefined && this.mxPage.length > 1) {
            var dsid;
            for (var i = 0, len = this.mxPage.length; i < len; i++) {
                dsid = this.mxPage[i];
                if (dsid != e.target.id) {
                    this.refs['mxPage-' + dsid].jQuery.removeClass('kShow');
                } else {
                    this.refs['mxPage-' + dsid].jQuery.addClass('kShow');
                }
            } //遍历明细表格
        }
        this.jQuery.find('.kDsTabHeader').each(function () {
            if ($(this).attr('id') == e.target.id) $(this).addClass('kDsTabHeaderSelect');else $(this).removeClass('kDsTabHeaderSelect');
        });
    },
    getMxTabBtns: function () {
        if (this.mxPage == undefined || this.mxPage.length == 0) return [];
        var DsTabPanelStyle = {
            position: "relative",
            left: "10px",
            top: "0",
            height: "28px",
            minWidth: "100px",
            zIndex: "7",
            marginTop: '8px'
        };
        var tabBtns = [];
        var className = "kDsTabHeader"; //tab条class
        this.state.selectDsId = this.mxPage[0]; // 设定默认选中tab
        for (var i = 0, len = this.mxPage.length; i < len; i++) {
            //遍历明细页
            className = "kDsTabHeader";
            if (i >= 1) {
                tabBtns.push(React.createElement('span', { key: "dstabSplit-" + this.mxPage[i],
                    className: "kDsTabSplit" }));
            } //如果有第二个明细页,把分割线放出来
            if (this.mxPage[i] == this.state.selectDsId) {
                className += ' kDsTabHeaderSelect';
            } //如果选中的tab条,加上选中样式
            tabBtns.push(React.createElement(
                'div',
                { key: "dstab-" + this.mxPage[i],
                    className: className,
                    onClick: this.selectTab,
                    id: this.mxPage[i]
                },
                this.editPageData[this.mxPage[i]]['sysPage']['DS_NAME']
            )); //把tab按钮加进来
        }
        return React.createElement(
            'div',
            { style: DsTabPanelStyle },
            tabBtns
        );
    },
    getMxPages: function () {
        if (this.mxPage == undefined || this.mxPage.length == 0) return [];
        var mxPages = [];
        for (var i = 0, len = this.mxPage.length; i < len; i++) {
            mxPages.push(React.createElement(MxPage, {
                key: "mxPage-" + this.mxPage[i],
                pageOpt: this.editPageData[this.mxPage[i]],
                isSelect: this.mxPage[i] == this.state.selectDsId,
                ref: "mxPage-" + this.mxPage[i],
                dsid: this.mxPage[i],
                canUse: this.canEdit,
                dataListClick: this.props.dataListClick,
                djPage: this
            }));
        } //遍历明细页
        return mxPages;
    },
    render: function () {
        var FormGrid = k.react.FormGrid;
        var showStyle = {};
        if (this.state.isShow == true) {
            showStyle = { "display": 'block' };
        } //如果需要显示的话
        var kMainGridStyle = {
            position: "relative",
            marginLeft: "15px",
            marginTop: "12px"
        }; //各元素的显示区域
        var kMainDjPanelStyle = {
            position: "relative",
            backgroundColor: "transparent",
            width: "100%",
            minHeight: "142px",
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(153,153,153,1)",
            overflow: "hidden"
            //当两个空元素嵌套时,子元素的margin-top 会绑架父元素,解决方式是加上这个
            // 参见http://blog.csdn.net/zhouyongwinner/article/details/43941733
        };
        var kMainDjBtnsPanelStyle = {
            position: "relative",
            marginLeft: "10px",
            marginTop: "8px",
            minHeight: "30px"
        };
        return React.createElement(
            'div',
            { className: 'kDjPage', style: showStyle },
            React.createElement(GaiZhang, { dsid: this.props.dsid,
                mid: this.props.mid,
                ref: 'verifyGZ'
            }),
            React.createElement(
                'div',
                { className: 'kMainDjPanel', style: kMainDjPanelStyle },
                React.createElement(
                    'div',
                    { className: 'kMainDjBtnsPanel', style: kMainDjBtnsPanelStyle },
                    this.getMainDjBtns()
                ),
                React.createElement(FormGrid, {
                    dsid: this.props.dsid,
                    mid: this.props.mid,
                    topStyle: kMainGridStyle,
                    parentCtrl: 'DjPage',
                    ref: 'mainDj',
                    dataListClick: this.props.dataListClick,
                    relateSetDataGrid: this.relateSetDataGrid,
                    confCells: this.editPageData == undefined ? [] : this.editPageData[this.mainDsId]
                })
            ),
            this.getMxTabBtns(),
            this.getMxPages()
        );
    }
});
