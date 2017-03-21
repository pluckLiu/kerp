var k = window.k;
var CommonButton = k.react.CommonButton = React.createClass({
    getInitialState: function () {
        var state = {};
        state.text = this.props.text;
        state.jsFn = this.props.jsFn;
        return state;
    },
    componentWillReceiveProps: function (nextProp) {
        this.setState({text: nextProp.text, jsFn: nextProp.jsFn});
    },
    btnClick: function (event) {
        var btn = $(event.target);
        if (btn.is('.noneButton')) {
            return;
        } else {
            btn.addClass('noneButton');
            var end = this.props.parentClick(this.state.jsFn
                , event
                , this.props.parentCtrType == "MxPage" ? this.props.proc
                    : this.props.proc == null || this.props.proc == '' ? false
                        : true
                , this.props.btid
                , this.state.text
            );
            //如果是修改保存按钮
            if (this.state.jsFn == 'edit') {
                this.setState({text: "保存", jsFn: "save"});
            } else if (this.state.jsFn == 'save' && end != false) {
                this.setState({text: "修改", jsFn: "edit"});
            }
        }
    },
    render: function () {
        var className = this.props.theClass;
        if (className == undefined)
            className = "kCommonButton";
        return <a className={className} id={this.props.dsid} onClick={this.btnClick}>
            {this.state.text}
        </a>;
    }
});//通用按钮
var SearchProgress = k.react.SearchProgress = React.createClass({
    getInitialState: function () {
        var state = {};
        state.totalCount = this.props.totalCount == undefined ? 0 : this.props.totalCount;
        state.nowRows = this.props.nowRows == undefined ? 0 : this.props.nowRows;
        return state;
    },
    componentWillReceiveProps: function (nextProp) {
        this.setState({totalCount: nextProp.totalCount, nowRows: nextProp.nowRows});
    },
    render: function () {
        this.state.totalCount = this.state.totalCount == undefined ? 0 : this.state.totalCount;
        this.state.nowRows = this.state.nowRows == undefined ? 0 : this.state.nowRows;
        var progressStyle = {
            width: ((this.state.totalCount <= 0 ? 0 : this.state.nowRows / this.state.totalCount) * 100).toFixed(2).toString() + '%'
        };//进度条的宽度设置
        var mainStyle = {
            display: this.state.totalCount == 0 ? 'none'
                : this.state.isShow == false ? 'none'
                    : 'block', opacity: 1
        };//是否显示
        //如果总数量与当前数量都是相等 且 大于0 则设定透明度为0 因为动画效果会慢慢消失
        if (this.state.nowRows == this.state.totalCount && this.state.totalCount > 0) {
            mainStyle.opacity = 0;
        }
        return <div className={"kSearchProgress"} style={mainStyle}>
            <span className={"kProgressGreen"} style={progressStyle}></span>
            <span
                className={"kSearchProgressText"}>{this.state.nowRows.toString() + '/' + this.state.totalCount}</span>
        </div>;
    }
});//查询进去条
var DsSearchPage = k.react.DsSearchPage = React.createClass({
    getDsSearchBtns: function () {
        //获取查询界面的按钮数组
        var searchBtns = this.props.cnfData['searchBtns'];
        //进行遍历添加
        var DsSearchBtns = [], btn;
        //遍历确保 新版导出 存在
        var isNewExportExists = false;
        for (var i = 0, len = searchBtns.length; i < len; i++) {
            if (searchBtns[i]['JS_FUNC'] == 'exportExcelByNode' || searchBtns[i]['JS_FUNC'] == 'uploadDataToExcel')
                isNewExportExists = true;
        }
        if (isNewExportExists == false)
            searchBtns.push({
                'NAME': 'exportExcelByNode',
                'BUTN_TEXT': '导出excel',
                'JS_FUNC': 'exportExcelByNode'
            });
        //遍历生成按钮
        for (var i = 0, len = searchBtns.length; i < len; i++) {
            btn = searchBtns[i];
            DsSearchBtns.push(
                <CommonButton key={btn['NAME'] + i.toString()}
                              dsid={this.props.dsid}
                              mid={this.props.mid}
                              text={btn['BUTN_TEXT']}
                              jsFn={btn['JS_FUNC']}
                              btid={btn['NAME']}
                              parentClick={this.btnClick}
                />
            );
        }
        //最后进行渲染
        return DsSearchBtns;
    },
    btnClick: function (fn, event, isProc, btid, text) {
        //分发给对应的函数
        //console.log('fn, event, isProc, btid, text', fn, event, isProc, btid, text);
        if (btid.indexOf('bigProc') >= 0)
            this['bigProc'](event.target, isProc, btid, text);
        else if (this[fn])
            this[fn](event.target, isProc, btid, text);
        else
            $(event.target).removeClass('noneButton');
    },
    exportExcelByNode: function (btn) {
        k.CallServerAPI('exportExcelByNode', {
            mid: this.props.mid,
            dsid: this.props.dsid
        }, function (data) {
            if (data.fileName != undefined) {
                window.open("http://" + window.location.host + '/download/' + data.fileName);
                //console.info("http://" + window.location.host + '/' + data.fileName);
            } else
                console.info('服务器返回数据:', data);
            $(btn).removeClass('noneButton');
        }, 30000);
    },
    uploadDataToExcel: function (btn) {
        var excelData = this.refs['dataGrid'].GetExcelData();
        k.CallServerAPI('uploadDataToExcel', {
            mid: this.props.mid,
            dsid: this.props.dsid,
            data: excelData
        }, function (data) {
            if (data.fileName != undefined) {
                window.open("http://" + window.location.host + '/download/' + data.fileName);
                //console.info("http://" + window.location.host + '/' + data.fileName);
            } else
                console.info('服务器返回数据:', data);
            $(btn).removeClass('noneButton');
        });
    },
    batchProc: function (btn, isProc, btid, text) {
        //将来是要提示是否批量审核的...
        //console.info(arguments);//dataGrid
        var selectRows = this.refs['dataGrid'].GetSelectRowsPk('asc');
        //console.info(selectRows);
        var that = this;
        if (selectRows.length == 0) {
            alert('可用于批量执行的数据为0行,请确认操作是否正确!!!');
            if (btn != undefined) $(btn).removeClass('noneButton');
        } else {
            k.CallServerAPI('batchProc', {
                mid: this.props.mid,
                dsid: this.props.dsid,
                pkRows: selectRows,
                btid: btid
            }, function (data) {
                //console.info('searchDs服务器返回数据:', data);
                if (data.err != undefined) {
                    console.info('服务器返回数据:', data);
                } else if (data.outProc != undefined) {
                    alert(data.outProc);
                }
                if (btn != undefined) $(btn).removeClass('noneButton');
                that.search();//发出查询请求,重置数据
            });
        }
    },
    bigProc: function (btn, isProc, btid, text) {
        //将来是要提示是否批量审核的...
        //console.info(arguments);//dataGrid
        var selectRows = this.refs['dataGrid'].GetSelectRowsPk('asc');
        //console.info(selectRows);
        var that = this;
        if (selectRows.length == 0) {
            alert('可用于批量执行的数据为0行,请确认操作是否正确!!!');
            if (btn != undefined) $(btn).removeClass('noneButton');
        } else {
            k.CallServerAPI('bigProc', {
                mid: this.props.mid,
                dsid: this.props.dsid,
                pkRows: selectRows,
                btid: btid
            }, function (data) {
                console.info('bigProc服务器返回:', data);
                if (data.err != undefined) {
                    console.info('bigProc服务器返回:', data);
                } else if (data.outProc != undefined && data.outProc != '' && data.outProc.charCodeAt() != 13) {
                    try {
                        var json = JSON.parse(data.outProc);//格式化json
                        if (json.msg != undefined)
                            alert(json.msg);
                        else if (json.error != undefined)
                            alert(json.error);
                        else if (json.jsFn != undefined) {//如果有自定义函数
                            var fn = new Function(json.jsFn);
                            if (k.isFunction(fn))
                                fn.apply(that);//通过apply 压入 SearchPage
                        }
                    } catch (e) {
                        alert(data.outProc);
                    }
                }
                if (btn != undefined) $(btn).removeClass('noneButton');
                that.search();//发出查询请求,重置数据
            });
        }
    },
    djProc: function (btn, isProc, btid, text) {
        //将来是要提示是否批量审核的...
        //console.info(arguments);//dataGrid
        var selectRows = this.refs['dataGrid'].GetSelectRowsPk('asc');
        //console.info(selectRows);
        var that = this;
        if (selectRows.length == 0) {
            alert('请选择1行数据!');
            if (btn != undefined) $(btn).removeClass('noneButton');
        } else if (selectRows.length > 1) {
            alert('选中行数超出多行');
            if (btn != undefined) $(btn).removeClass('noneButton');
        } else {
            k.CallServerAPI('djProc', {
                mid: this.props.mid,
                dsid: this.props.dsid,
                pkRows: selectRows,
                btid: btid
            }, function (data) {
                console.info('djProcc服务器返回:', data);
                if (data.err != undefined) {
                    console.info('djProc服务器返回:', data);
                } else if (data.outProc != undefined && data.outProc != '' && data.outProc.charCodeAt() != 13) {
                    try {
                        var json = JSON.parse(data.outProc);//格式化json
                        if (json.msg != undefined)
                            alert(json.msg);
                        else if (json.jsFn != undefined) {//如果有自定义函数
                            var fn = new Function(json.jsFn);
                            if (k.isFunction(fn))
                                fn.apply(that);//通过apply 压入 SearchPage
                        }
                    } catch (e) {
                        alert(data.outProc);
                    }
                }//如果存储过程返回字符串
                if (btn != undefined) $(btn).removeClass('noneButton');
                that.search();//发出查询请求,重置数据
            });
        }
    },
    search: function (btn) {
        var that = this;
        //得到查询数据
        var sdata = this.refs['searchGrid'].mData;
        if (sdata.Up == undefined) {
            sdata = {};
        } else {
            sdata = sdata.Up;
        }
        this.refs['dataGrid'].ClearData();//清空表格数据
        //发送查询请求
        var searchData = [];
        k.CallServerAPI('searchDsLong', {
            mid: this.props.mid,
            dsid: this.props.dsid,
            sdata: sdata
        }, function (sreturn) {
            if (that == undefined || that.refs == undefined || that.refs['searchProgress'] == undefined) return true;
            //console.info('searchDs服务器返回数据:', sreturn);
            if (sreturn.err != undefined) {
                console.info('searchDsLong服务器返回数据:', sreturn);
                that.refs['dataGrid'].LoadData(searchData);
                if (btn != undefined) $(btn).removeClass('noneButton');
                return true;
            } else if (sreturn.alert != undefined) {
                alert(sreturn.alert);//如果有提示消息,就给出弹框,然后返回
                if (btn != undefined) $(btn).removeClass('noneButton');
                return true;
            }//结束特殊情况判断
            if (sreturn.gridCols != undefined) {
                var spage = k.flux.getDataInsById('ModuleDesc', that.props.mid).getData();
                spage[that.props.dsid]['gridCols'] = sreturn.gridCols;
            }//如果有配置项,加载即可
            if (k.isArray(sreturn.data)) {
                if (sreturn.isEnd == true) {
                    that.refs['searchProgress'].setState({
                        totalCount: sreturn.totalCount,
                        nowRows: sreturn.totalCount
                    });//设置进度条为最终数量100%
                    k.ArrayConCat(searchData, sreturn.data);//先拼接最后一批数据
                    that.calcSearchDataForDsid(searchData, that.props.dsid);//根据不同dsid,再做一次自定义计算
                    setTimeout(function () {
                        that.refs['searchProgress'].setState({isShow: false});
                    }, 500);//1秒后让进度条消失
                    that.refs['dataGrid'].LoadData(searchData);
                    if (btn != undefined) $(btn).removeClass('noneButton');
                    return true;
                }
                k.ArrayConCat(searchData, sreturn.data);//常规拼接数据
                that.refs['searchProgress'].setState({
                    totalCount: sreturn.totalCount,
                    nowRows: sreturn.nowRows,
                    isShow: true
                });//设置进度条
            }
        }, 5000, true);
    },
    calcSearchDataForDsid: function (data, dsid) {
        if (dsid == 'ds_realcbfx') {
            var row, ylAmount = {}, ylid;
            //遍历行数据,去除该行的原料id,然后再遍历所有行,获取其行是否为同样的yiid 如果是,就相加,不是就跳过
            //于是就得到了比例,然后再用 比例 * 原本的实际原料耗用量
            for (var i = 0, len = data.length; i < len; i++) {
                row = data[i];//行数据
                ylid = row['YL_ID'];//原料id
                if (ylAmount[ylid] == undefined) {
                    //如果不存在总标准耗用量数据,就计算了
                    ylAmount[ylid] = {amount: 0, isOk: false};
                    for (var j = 0, jlen = data.length; j < jlen; j++) {
                        if (data[j]['YL_ID'] == ylid) ylAmount[ylid].amount += parseFloat(data[j]['SC_YL_KG']);
                    }
                    ylAmount[ylid].isOk = true;
                }//遍历计算
                //对该行做比例换算
                row['ylRate'] = ylAmount[ylid].amount == 0 ? 0 : row['SC_YL_KG'] / ylAmount[ylid].amount;//用单项标准原料耗用量 去除以 总标准原料耗用量 得出比例
                row['REAL_YL_AMOUNT'] = row['ylRate'] * row['REAL_YL_AMOUNT'];//按比例重算 实际原料耗用量
                row['YL_AMOUNT_USE_CY'] = row['REAL_YL_AMOUNT'] - row['SC_YL_KG'];//原料使用量差异（公斤）=实际用量-标准用量
                row['YL_AMOUNT_USE_CY_RATE'] = row['SC_YL_KG'] == 0 ? 0 : 1 - (row['REAL_YL_AMOUNT'] / row['SC_YL_KG']).toFixed(4);//原料用量差异(比例)
                row['YL_AMOUNT_USE_CY_RATE'] = (row['YL_AMOUNT_USE_CY_RATE'] * 100).toFixed(2).toString() + '%';//原料用量差异(比例) 百分比
                row['REAL_YL_CB'] = row['ylRate'] * row['REAL_YL_CB'];//实际原料成本
                row['YL_CB_USE_CY'] = row['REAL_YL_CB'] - row['YL_CB'];//原料成本差异(金额)=实际成本-标准成本
                row['YL_CB_USE_CY_RATE'] = row['YL_CB'] == 0 ? 0 : 1 - (row['REAL_YL_CB'] / row['YL_CB']).toFixed(4);//原料成本差异(比例)
                row['YL_CB_USE_CY_RATE'] = (row['YL_CB_USE_CY_RATE'] * 100).toFixed(2).toString() + '%';//原料成本差异(比例) 百分比
            }//结束数据遍历计算
        }
        return data;
    },
    reset: function (btn) {
        this.refs['searchGrid'].ClearData();
        this.refs['dataGrid'].ClearData();
        $(btn).removeClass('noneButton');
    },
    save: function (btn) {
        //得到查询表格修改过的数据
        var that = this;
        var data = this.refs['dataGrid'].mData;
        if (data.EditData == undefined) {
            console.info('没有需要保存的数据,不更新!!!');
            $(btn).removeClass('noneButton');
            return;
        } else {
            data = {"dsids": {"d0": that.props.dsid}, "d0": data.EditData};
        }
        //发送保存请求
        k.CallServerAPI('saveds', {
            mid: this.props.mid,
            dsid: this.props.dsid,
            save: data
        }, function (data) {
            if (data.err != undefined) {
                //如果数据有错误,则打印出来
                console.info('服务器返回数据:', data);
            } else {
                alert('保存成功!');
            }
            k.flux.emitAction('DataGrid'
                , 'SearchPage' + '-' + that.props.mid + '-' + that.props.dsid
                , 'ClearEditData');
            that.search(btn);//进行数据查询
        });
    },
    dataListClick: function (dz_id, theClickCell, hostCtrl, wcols, inMxPage) {
        var that = this;
        k.CallServerAPI('showDzDataList', {
            mid: this.props.mid,
            dsid: this.props.dsid,
            dzid: dz_id,
            sdata: (wcols == undefined) ? {} : wcols,
            inMxPage: inMxPage
        }, function (data) {
            //console.info('服务器返回showDzDataList数据:', data);
            if (data.err != undefined) {
                console.info('服务器返回showDzDataList数据:', data);
                return;
            }
            that.refs['datalist'].showDataList(dz_id, data, theClickCell, hostCtrl, inMxPage, wcols);
        });
    },
    digDsEditPage: function (rowdata, pkCol, dsid) {
        //console.info(rowdata, pkCol, dsid);
        if (rowdata[pkCol] == '' || rowdata[pkCol] == undefined) return;
        var that = this;
        k.CallServerAPI('showDsEditPage', {
            mid: this.props.mid,
            dsid: dsid,
            pkval: rowdata[pkCol]
        }, function (data) {
            //console.info('服务器返回showDsEditPage数据:', data);
            if (data.err != undefined) {
                console.info('服务器返回showDsEditPage数据:', data);
                return;
            }
            that.refs['djPage'].showDjPage(dsid, data);
        });
    },
    addds: function (btn) {
        var that = this;
        k.CallServerAPI('showDsEditPage', {
            mid: this.props.mid,
            dsid: this.props.dsid,
            pkval: ''
        }, function (data) {
            //console.info('服务器返回addds数据:', data);
            if (data.err != undefined) {
                console.info('服务器返回addds数据:', data);
                return;
            }//这里其实和 挖掘模块一样,只不过在打开详情界面后,立马调用新建功能
            that.refs['djPage'].showDjPage(that.props.dsid, data, true);
            if (btn != undefined) $(btn).removeClass('noneButton');
        });
    },
    render: function () {
        var DsSearchGrid = k.react.FormGrid;//表单控件
        var DataList = k.react.DataList;//弹框控件
        var DjPage = k.react.DjPage;//详情页
        var DataGrid = k.react.DataGrid;//数据表格控件
        var classes = (this.props.isSelect == true) ? "kPage ktopPage" : "kPage";
        var kSearchPanelStyle = {
            position: "relative",
            backgroundColor: "transparent",
            width: "100%",
            minHeight: "142px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #999999",
            //当两个空元素嵌套时,子元素的margin-top 会绑架父元素,解决方式是加上这个
            overflow: "hidden"
            // 参见http://blog.csdn.net/zhouyongwinner/article/details/43941733
        };
        var kSearchBtnsPanelStyle = {
            position: "relative",
            marginLeft: "10px",
            marginTop: "8px",
            minHeight: "30px"
        };
        var kSearchGridStyle = {
            position: "relative",
            marginLeft: "15px",
            marginTop: "12px"
        };
        var kAssisantPanelStyle = {
            position: "relative",
            width: "100%",
            height: "38px",
            marginTop: "8px",
            border: "1px solid #999999",
            borderWidth: '1px 1px 0 1px ',
            background: "transparent",
            overflow: "hidden"
        };
        var kDataGridPanelStyle = {
            position: "relative",
            width: "100%",
            height: "620px",
            marginTop: "0px",
            border: "1px solid #999999",
            borderWidth: '0px 1px 1 1px ',
            background: "transparent",
            overflow: "hidden"
        };
        return <div id={this.props.dsid} className={classes}>
            <div className="kSearchPanel" style={kSearchPanelStyle}>
                <div className="kSearchBtnsPanel" style={kSearchBtnsPanelStyle}>
                    {this.getDsSearchBtns()}
                </div>
                <DsSearchGrid
                    dsid={this.props.dsid}
                    mid={this.props.mid}
                    topStyle={kSearchGridStyle}
                    parentCtrl="SearchPage"
                    onEnterKeyUp={this.search}
                    dataListClick={this.dataListClick}
                    confCells={this.props.cnfData.searchCols}
                    ref="searchGrid"
                />
            </div>
            <div className="kAssisantPanel" style={kAssisantPanelStyle}>
                <SearchProgress dsid={this.props.dsid}
                                mid={this.props.mid}
                                ref="searchProgress"
                />
            </div>
            <DataGrid dsid={this.props.dsid}
                      mid={this.props.mid}
                      topStyle={kDataGridPanelStyle}
                      parentCtrl="SearchPage"
                      dataListClick={this.dataListClick}
                      digDsEditPage={this.digDsEditPage}
                      confCells={this.props.cnfData.gridCols}
                      ref="dataGrid"
            />
            <DataList ref="datalist"
                      dsid={this.props.dsid}
                      mid={this.props.mid}
            />
            <DjPage ref="djPage"
                    dsid={this.props.dsid}
                    mid={this.props.mid}
                    dataListClick={this.dataListClick}
            />
        </div>;
    }
});
/***
 * 在module控件挂载后,触发一次 socket 获取数据 各查询界面的数据,
 * 第一次控件页面是 只有加载消息页,不展示其他的
 * 当拿到的服务器的数据,发送一次更新,由数据通知进行更新:setState
 * 第二次控件页面,就是把 按顺序返回的数组第一个 展示到界面上,其他几个就不返回了
 * 注意:setState 会被用用在shoule是否更新中,在这里只需要对比一个标志位即可,
 * 即模块界面只需要加载一次,但这里还要 防备下 其父节点 tabpage中的删除界面事件,不知道会不会引发触发,因为子节点不更新,而父节点需要删除的情况
 */
var Module = k.react.Module = React.createClass({
    getInitialState: function () {
        return {selectDsId: ''};
    },
    componentDidMount: function () {
    },
    componentWillUnmount: function () {
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        //console测试分析:在第一次创建组件时是不调用这个方法的
        //父组件在收到tab点击时触发到这里
        if (nextState != null && nextState.isGetDsPages == true) {
            //console.log('Module控件将被确认更新');
            return true;
        }
        else {
            //console.log('Module控件已被标记不可更新');
            return false;
        }
    },
    componentDidUpdate: function () {
        this.setState({isGetDsPages: false});
        console.log('Module：componentDidUpdate');
        //注意:通过测试发现,如果render 发生错误,这段代码是不会被执行的
    },
    getDsSearchPages: function () {
        var modData = this.props.dataProp;//获取从 tabPage中传输过来的属性 dataProp 这个就包含了实际的查询页面
        this.sysPages = [];
        var searchPages = [];//排除dz之外的查询页面
        for (var i in modData) {
            if (i != 'dz') {
                searchPages.push(i);
                this.sysPages.push(modData[i]['sysPage'][0]);
            } else
                k.DzCalc(modData[i]);
        }
        // 设定默认选中的tab条
        if (this.state.selectDsId == '' || this.state.selectDsId == undefined) this.state.selectDsId = searchPages[0];
        //遍历添加
        var DsSearchPages = [], dsid, isDsSelect;
        for (var i = 0, len = searchPages.length; i < len; i++) {
            dsid = searchPages[i];
            isDsSelect = false;
            if (this.state.selectDsId == dsid) {
                isDsSelect = true;
            }
            DsSearchPages.push(
                <DsSearchPage key={dsid} dsid={dsid} mid={this.props.mid} isSelect={isDsSelect}
                              cnfData={modData[dsid]}
                />
            );
        }
        //最后进行渲染
        return DsSearchPages;
    },
    getTabBtns: function () {
        this.DsTabPanelStyle = {
            position: "absolute",
            left: "10px",
            top: "0",
            height: "28px",
            minWidth: "100px",
            zIndex: "21"
        };
        this.tabBtns = [];
        if (this.sysPages && this.sysPages.length > 0) {
            //tab条的样式
            var className = "kDsTabHeader";
            //遍历查询页
            for (var i = 0, len = this.sysPages.length; i < len; i++) {
                className = "kDsTabHeader";
                //如果有第二个查询页,就把分割线放出来
                if (i >= 1) {
                    this.tabBtns.push(
                        <span key={"dstabSplit-" + this.sysPages[i]['DS_ID']}
                              className={"kDsTabSplit"}>
                            </span>);
                }
                //如果是选中的tab条,就加上选中样式
                if (this.sysPages[i]['DS_ID'] == this.state.selectDsId) {
                    className += ' kDsTabHeaderSelect';
                }
                //把tab按钮加进来
                this.tabBtns.push(
                    <div key={"dstab-" + this.sysPages[i]['DS_ID']}
                         className={className}
                         onClick={this.selectTab}
                         id={this.sysPages[i]['DS_ID']}
                    >
                        {this.sysPages[i]['DS_NAME']}
                    </div>);
            }
            //console.info(this.sysPages);
        }
    },
    selectTab: function (e) {
        //console.info(e.target.id);
        if (this.sysPages && this.sysPages.length > 1) {
            this.setState({isGetDsPages: true, selectDsId: e.target.id});//只有多个tab页面的时候才会生效
        }
    },
    render: function () {
        var DsSearchPages = this.getDsSearchPages();
        this.getTabBtns();
        var modulePanelStyle = {
            position: "relative"
        };
        return <div id={this.props.mid} style={modulePanelStyle}>
            <div style={this.DsTabPanelStyle}>{this.tabBtns}</div>
            {DsSearchPages}
        </div>;
    }
});