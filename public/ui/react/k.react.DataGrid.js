var DgInputCell = k.react.DgInputCell = React.createClass({
    getInitialState: function () {
        return {};
    },
    inputChange: function (event) {
        var text = this.props.parentCheckChange(this.props.rowno, this.props.colName, event.target.value);
        this.setState({inputText: text, isOnChange: true});
        this.props.parentHandChange(this.props.rowno, this.props.colName, text, text);
    },
    empty: function () {
        this.setState({inputText: "", isOnChange: true});
    },
    setInput: function (text, val) {
        this.setState({inputText: text, isOnChange: true});
        this.props.parentHandChange(this.props.rowno, this.props.colName, val, text);
    },
    focus: function (e) {
        e.target.selectionStart = 0;
        e.target.selectionEnd = e.target.value.length;
        if (this.props.dzid == null || this.props.dzid == '')
            return;
        k.AutoEditor.attach($(e.target), this, this.props.dzid);
    },
    blur: function () {
        //console.info('失去焦点');
        k.AutoEditor.detach();
    },
    selectClick: function () {
        //console.info('selectClick');
        if (this.props.ctrType == 'image') {
            var inputText = this.getCtrlNowText();
            inputText = k.GetDzNextPkByPk(this.props.dzid, inputText);
            this.setInput(inputText, inputText);//这里之所以用一样的值,是因为在渲染的时候,会重新取出图形控件的值
        } else {
            k.AutoEditor.attach(this.input, this, this.props.dzid);
        }//不是图形控件的,才把下拉控件弄出来
    },
    dataListClick: function () {
        //弹框控件的点击=>调用父控件的弹框点击函数
        this.props.dataListClick(this.props.rowno, this.props.colName, this.props.dzid, this);
    },
    componentDidMount: function () {
        this.input = $(ReactDOM.findDOMNode(this)).find('input');
    },
    componentWillUnmount: function () {
        k.AutoEditor.detach();
    },
    getCtrlNowText: function () {
        var state = this.state, inputText;
        if (state.isOnChange == true) {
            inputText = state.inputText;//当处于更新状态,就用实时的数据
        } else {
            //注意这里,如果填错了属性、或者为空，都会导致第一次渲染没有值，而这会引发报错，
            inputText = (this.props.cellText == null ? '' : this.props.cellText);//否则的话,就用当时传过来的数据
        }
        return inputText;
    },
    dgCellClick: function () {
        this.props.dgCellClick(this.props.rowno, this.props.colName);
    },
    render: function () {
        //要展示的字符串
        var renderText = this.getCtrlNowText();
        if (this.props.canUse == false) {
            return <div style={this.props.cellStyle} className={this.props.cellClass}
            >{renderText}</div>
        }//如果用都不能用,就直接返回最简单的
        if (this.props.canEdit == false) {
            //如果不可以编辑的话,就直接返回最简单的样式即可
            //同时这种纯文字的单元格可以调用到表格控件的单击事件,其他的可编辑控件则不行,因为有各自的事情
            return <div style={this.props.cellStyle} className={this.props.cellClass}
                        onClick={this.dgCellClick}
            >{renderText}</div>
        }
        //如果是图形控件的话,则获取图形控件类名
        if (this.props.ctrType == 'image') renderText = k.GetDzTextByPk(this.props.dzid, renderText);
        if (this.props.dzid == null || this.props.dzid == '') {//常规非对照信息,就用input 承载即可
            return <div style={this.props.cellStyle} className={this.props.cellClass}>
                <input className="kDataGridInput" type="text"
                       value={renderText}
                       onChange={this.inputChange}
                       onFocus={this.focus}
                />
                <span className="kDataGridEditImage"></span>
            </div>;
        } else if (this.props.ctrType == 'image') {//图形控件
            return <div style={this.props.cellStyle} className={this.props.cellClass}>
                <span className={renderText} onClick={this.selectClick}></span>
            </div>;
        } else if (this.props.ctrType == 'datalist') {//弹框控件,设定弹框对照信息
            return <div style={this.props.cellStyle} className={this.props.cellClass}>{renderText}
                <span className="kSpanDatalist" onClick={this.dataListClick}>...</span>
            </div>
        } else {//下拉对照信息
            return <div style={this.props.cellStyle} className={this.props.cellClass}>
                <input className="kDataGridInput" type="text"
                       value={renderText}
                       onChange={this.inputChange}
                       onFocus={this.focus}
                       onBlur={this.blur}
                />
                <span className="kDownArrow" onClick={this.selectClick}></span>
            </div>;
        }
    }
});
var DataGridRow = k.react.DataGridRow = React.createClass({
    getInitialState: function () {
        return {isSelect: this.props.isSelect};
    },
    componentWillReceiveProps: function (nextProp) {
        /*componentWillReceiveProps
         在将要接受新的props时被调用，不是说props是不可变状态吗？
         情况通常是这样的，当一个父组件包含了一个子组件，子组件的一个props的值是父组件的states的值，
         那么当父组件可变状态改变时，子组件的props也更新了，于是调用了这个函数。
         这个生命周期函数componentWillReceiveProps提供了更新states的机会，
         可以调用this.setState，也是唯一可以在组件更新周期中调用this.setState的函数。
         * */
        this.setState({isSelect: nextProp.isSelect});
    },
    onMouseEnter: function () {
        //console.info('onMouseEnter', this.props.rowno);
        this.props.mouseEnterCell(this.props.rowno);
    },
    onMouseLeave: function () {
        this.props.mouseLeaveCell(this.props.rowno);
    },
    render: function () {
        var rowStyle = $.extend(true, {}, this.props.rowStyle);//通过重新继承,已经变成默认颜色,下面只需要考虑需要的情况就行
        //如果有 鼠标 进入的背景色,就赋予这个
        if (this.state.isMouseEnter == true)
            rowStyle.backgroundColor = "#ebeced";
        //选中状态必须是这个颜色
        if (this.state.isSelect == true)
            rowStyle.backgroundColor = '#93dbb0';
        return <div className="kGridRow" style={rowStyle}
                    onMouseEnter={this.onMouseEnter}
                    onMouseLeave={this.onMouseLeave}
        >
            {this.props.rowCells}
        </div>
    }
});
var DgSelect = k.react.DgSelect = React.createClass({
    getInitialState: function () {
        return {isSelect: this.props.isSelect};
    },
    componentWillUnmount: function () {
        if (this.parent != undefined) this.parent.off('click');
    },
    componentWillReceiveProps: function (nextProp) {
        //在组件接收到一个新的prop时被调用。这个方法在初始化render时不会被调用。
        this.setState({isSelect: nextProp.isSelect});
    },
    render: function () {
        var theClass;
        if (this.state.isSelect == true)
            theClass = "kDataGridSelect kSelectImage";
        else
            theClass = "kDataGridSelect";
        return <div className={theClass} onClick={this.props.selectClick}>
        </div>;
    }
});
var LeftGridRow = k.react.LeftGridRow = React.createClass({
    getInitialState: function () {
        return {isSelect: this.props.isSelect};
    },
    componentWillReceiveProps: function (nextProp) {
        //在组件接收到一个新的prop时被调用。这个方法在初始化render时不会被调用。
        this.setState({isSelect: nextProp.isSelect});
    },
    onMouseEnter: function () {
        //console.info('onMouseEnter', this.props.rowno);
        this.props.mouseEnterCell(this.props.rowno);
    },
    onMouseLeave: function () {
        this.props.mouseLeaveCell(this.props.rowno);
    },
    dgCellClick: function (event) {
        this.props.dgCellClick(this.props.rowno, 'LeftGridRow');
        event.stopPropagation();
    },
    render: function () {
        var leftRowStyle = $.extend(true, {}, this.props.leftRowStyle);
        if (this.state.isMouseEnter == true)
            leftRowStyle.backgroundColor = "#ebeced";
        if (this.state.isSelect == true) {
            leftRowStyle.backgroundColor = '#93dbb0';
        }
        return <div className="kGridRow kRowNo"
                    style={leftRowStyle}
                    onClick={this.dgCellClick}
                    onMouseEnter={this.onMouseEnter}
                    onMouseLeave={this.onMouseLeave}
        >
            <DgSelect ref="select"
                      rowno={this.props.rowno}
                      isSelect={this.state.isSelect}
                      selectClick={this.dgCellClick}
            />
            <div className="kDataGridCell kLeftTopDgRowNo"
                 onClick={this.dgCellClick}>{(this.props.rowno + 1).toString()}</div>
        </div>
    }
});
var DataGrid = k.react.DataGrid = React.createClass({
    LoadCellOpt: function (cellOpt, isMultiSelecct, canAllEdit) {
        this.setState({
            "cellOpt": cellOpt,
            isMultiSelecct: isMultiSelecct == true ? true : false,
            CanAllEdit: canAllEdit == undefined ? true : canAllEdit
        });
    },
    SetCanUse: function (canUse) {
        this.setState({canUse: canUse == undefined ? true : canUse});
    },
    SetCanEdit: function (canAllEdit) {
        this.setState({CanAllEdit: canAllEdit == undefined ? true : canAllEdit});
    },
    LoadData: function (data) {
        var mData = this.mData;
        mData.GridData = (data.gridCols != undefined) ? data.data : data;
        delete mData.EditData;
        delete mData.Select;
        this.selectRows = {};
        this.setState({
            hasData: true,
            theTime: k.GetTimeStrMS()
        });
    },
    ClearData: function () {
        var mData = this.mData;
        mData.GridData = [];
        delete mData.EditData;
        delete mData.Select;
        this.selectRows = {};
        this.setState({
            hasData: true,
            theTime: k.GetTimeStrMS()
        });
    },
    DeleteAllData: function () {
        var data = this.mData, body = {pkCol: this.pkCol}, pkVal;
        var gridData = data.GridData;//获取实际展示数据
        data.EditData = (data.EditData == undefined) ? {} : data.EditData;//确保 存在EditData
        data.EditData['Add'] = (data.EditData['Add'] == undefined) ? [] : data.EditData['Add'];
        data.EditData['Del'] = (data.EditData['Del'] == undefined) ? [] : data.EditData['Del'];
        for (var i = 0, len = gridData.length; i < len; i++) {
            //判断 gridData中那个是在Add中存在的,如果不在Add中存在,说明是原始数据,找到主键列,然后压入Del中,另外主键列不能为""或者undefined
            if (k.ArrayIndexV(data.EditData['Add'], gridData[i]) == -1) {
                pkVal = gridData[i][body.pkCol];
                if (pkVal != '' && pkVal != undefined) data.EditData['Del'].push(pkVal);
            }//判断是否为原始数据
        }//结束展示数据遍历
        data.GridData = [];
        data.EditData['Add'] = [];
        this.selectRows = {};
        this.setState({
            hasData: true,
            theDataId: this.props.parentCtrl + '-' + this.props.mid + '-' + this.props.dsid,
            theTime: k.GetTimeStrMS()
        });
    },
    DelAllSelect: function () {
        var data = this.mData, body = {pkCol: this.pkCol};
        var gridData = data.GridData;//获取实际展示数据
        data.EditData = (data.EditData == undefined) ? {} : data.EditData;//确保 存在EditData
        data.EditData['Add'] = (data.EditData['Add'] == undefined) ? [] : data.EditData['Add'];
        data.EditData['Del'] = (data.EditData['Del'] == undefined) ? [] : data.EditData['Del'];
        data.Select = (data.Select == undefined) ? {} : data.Select;
        var pkVal, selects = [];
        for (var i in data.Select) {//遍历 select 然后看对应的gridData 是否在add中存在
            if (data.Select[i] == true) {//只有为真的情况 才算是选中
                if (k.ArrayIndexV(data.EditData['Add'], gridData[i]) == -1) {
                    pkVal = gridData[i][body.pkCol];
                    if (pkVal != '' && pkVal != undefined) data.EditData['Del'].push(pkVal);
                }//判断是否为原始数据
                selects.push(gridData[i]);//加入到选中数组,待会从gridData删除
            }//只有为真的情况 才算是选中
        }//结束Select数据遍历
        data.Select = {};
        for (var i = 0, len = selects.length; i < len; i++) {
            k.ArrayRemoveV(data.EditData['Add'], selects[i]);
            k.ArrayRemoveV(data.GridData, selects[i]);
        }
        this.selectRows = {};
        this.setState({
            hasData: true,
            theDataId: this.props.parentCtrl + '-' + this.props.mid + '-' + this.props.dsid,
            theTime: k.GetTimeStrMS()
        });
    },
    AddEditData: function (addData) {
        var data = this.mData, body = {data: addData, allColOpt: this.allColOpt};
        data.EditData = (data.EditData == undefined) ? {} : data.EditData;//确保 存在EditData
        data.EditData['Add'] = (data.EditData['Add'] == undefined) ? [] : data.EditData['Add'];
        //添加的数据中,对应可以编辑的列要赋予一个初始值
        var allColOpt = body.allColOpt, colOpt, tmpRow;
        for (var i in allColOpt) {
            colOpt = allColOpt[i];
            if (colOpt['IS_EDIT'] == 'T') {
                for (var d = 0, dlen = body.data.length; d < dlen; d++) {
                    tmpRow = body.data[d];
                    if (tmpRow[colOpt['NAME']] == undefined) tmpRow[colOpt['NAME']] = '';
                }
            }
        }
        //拼接到对应数组中
        k.ArrayConCat(data.GridData, body.data);
        k.ArrayConCat(data.EditData['Add'], body.data);
        this.selectRows = {};
        this.setState({
            hasData: true,
            theDataId: this.props.parentCtrl + '-' + this.props.mid + '-' + this.props.dsid,
            theTime: k.GetTimeStrMS()
        });
    },
    GetUpData: function () {
        //k.flux.getDataInsById('DataGrid', 'SearchPage' + '-' + that.props.mid + '-' + that.props.dsid).getData();
        var data = this.mData;
        var editData = data.EditData;
        if (editData == undefined) return 'noEdit';//如果没有数据,就返回无数据
        if ((editData['Up'] == undefined || editData['Up'].length == 0)
            && (editData['Add'] == undefined || editData['Add'].length == 0)
            && (editData['Del'] == undefined || editData['Del'].length == 0))
            return 'noEdit';
        return editData;
    },
    GetSelectRows: function (sort) {
        var data = this.mData;
        if (data.Select == undefined) return [];
        var GridData = data.GridData, select = data.Select, selectRows = [];
        if (sort == 'desc') {
            var theSelect = [];
            for (var i in select) select[i] == true ? theSelect.push(i) : null;
            k.SortNumArrayDesc(theSelect);
            for (var i = 0, len = theSelect.length; i < len; i++) selectRows.push(GridData[theSelect[i]]);
            return selectRows;
        } else if (sort == 'asc' || sort == undefined) {
            var theSelect = [];
            for (var i in select) select[i] == true ? theSelect.push(i) : null;
            k.SortNumArrayAsc(theSelect);
            for (var i = 0, len = theSelect.length; i < len; i++) selectRows.push(GridData[theSelect[i]]);
            return selectRows;
        }
        for (var i in select) {
            if (select[i] == true)
                selectRows.push(GridData[i]);
        }
        return selectRows;
    },
    GetSelectRowsPk: function (sort) {
        var data = this.mData;
        if (data == undefined || data.Select == undefined) return [];
        var GridData = data.GridData, select = data.Select, selectRows = [];
        if (sort == 'asc' || sort == undefined) {
            var theSelect = [];
            for (var i in select) select[i] == true ? theSelect.push(i) : null;
            k.SortNumArrayAsc(theSelect);
            for (var i = 0, len = theSelect.length; i < len; i++) {
                if (GridData[theSelect[i]][this.pkCol] == undefined) {
                    console.info('无主键第' + theSelect[i].toString() + '行');
                    return [];
                } else if (GridData[theSelect[i]]['DJ_CODE'] != undefined) {
                    selectRows.push({
                        pkid: GridData[theSelect[i]][this.pkCol],
                        DJ_CODE: GridData[theSelect[i]]['DJ_CODE']
                    });
                } else
                    selectRows.push({pkid: GridData[theSelect[i]][this.pkCol]});
            }
        } else if (sort == 'desc') {
            var theSelect = [];
            for (var i in select) select[i] == true ? theSelect.push(i) : null;
            k.SortNumArrayDesc(theSelect);
            for (var i = 0, len = theSelect.length; i < len; i++) {
                if (GridData[theSelect[i]][this.pkCol] == undefined) {
                    console.info('无主键第' + theSelect[i].toString() + '行');
                    return [];
                } else if (GridData[theSelect[i]]['DJ_CODE'] != undefined) {
                    selectRows.push({
                        pkid: GridData[theSelect[i]][this.pkCol],
                        DJ_CODE: GridData[theSelect[i]]['DJ_CODE']
                    });
                } else
                    selectRows.push({pkid: GridData[theSelect[i]][this.pkCol]});
            }
        }
        return selectRows;
    },
    GetData: function () {
        return this.mData;
    },
    GetExcelData: function () {
        //遍历配置表生产excel数据data,第一行是列名
        var excelData = [];//实际数据
        var gridCols = this.gridColsOpt, col, excelRow = [];
        for (var i = 0, len = gridCols.length; i < len; i++) {
            if (gridCols[i]['IS_SHOW'] == 'F') continue;//当是否展示为F的时候,就是不展示到界面,就可以直接略过了
            excelRow.push(gridCols[i]['TEXT']);//把列名加入
        }
        excelData.push(excelRow);//列名得到后,开始遍历实际数据
        var gridData = this.mData, dataRow, cellText;
        for (var r = 0, rlen = gridData.length; r < rlen; r++) {
            dataRow = gridData[r];//获取实际数据行
            excelRow = [];//重置数据行
            for (var i = 0, len = gridCols.length; i < len; i++) {//遍历单元格配置
                col = gridCols[i];//获取单元格配置
                if (col['IS_SHOW'] == 'F') continue;//如果不显示直接下一个
                cellText = dataRow[col['NAME']];//实际单元格数据
                if (col['DZ_ID'] != null && col['DZ_ID'] != '' && col['CONTROL_TYPE'] != 'image') {
                    //如果有对照id,并且不是图形控件,就用对照信息翻译一次,如果没有的话,返回的还是原本内容
                    cellText = k.GetDzTextByPk(col['DZ_ID'], cellText);
                }
                //如果列名有 DATE 就进行时间翻译 是 _DATE 或者 DATE_
                if (col['NAME'].indexOf('_DATE') >= 0 || col['NAME'].indexOf('DATE_') >= 0) {
                    if (cellText != null && cellText != undefined && cellText.indexOf('T') > 0) {
                        cellText = cellText.replace('T', ' ').replace('Z', '');//先去掉 T 和 Zs
                        cellText = new Date(cellText);//转化为标准时间
                        cellText = (new Date(cellText.getTime() + 8 * 60 * 60 * 1000)).toString();//加上8个时区
                        dataRow[col['NAME']] = cellText;//把原本的列 给更新掉！
                    }
                }
                if (k.isNumber(cellText)) {//如果是数值型的话,把小数点保留3位,之所以到这里才判断,是尽量把 continue的情况都考虑完
                    cellText = cellText.toFixed(3);//parseFloat(cellText.toFixed(3));
                }
                //如果名字包含MONEY,则要提取成2位小数点,并且带上 羊角符号
                if (col['NAME'].indexOf('_MONEY') >= 0 || col['NAME'].indexOf('MONEY_') >= 0) {
                    if (k.isNumber(cellText)) {
                        //最多2位小数点
                        cellText = '￥' + ((cellText == undefined || cellText == null) ? 0 : cellText).toFixed(2);
                    }
                }
                excelRow.push(cellText);
            }//结束单元格配置配置
            excelData.push(excelRow);
        }//结束数据遍历
        return excelData;
    },
    getInitialState: function () {
        return {isSelectAllRow: false, isMultiSelecct: true, CanAllEdit: true};
    },
    calcGridStyle: function () {
        this.leftAreaWidth = 100;//最左侧的序号列 勾选列 宽度
        this.leftTopAreaStyle = {width: this.leftAreaWidth.toString() + "px"};//左上角顶点区域宽度样式
        this.headerRowStyle = {
            position: "relative",
            height: "28px",
            paddingLeft: this.leftAreaWidth.toString() + "px",
            zIndex: '1'
        };//顶部首行样式
        if (this.state.scrollLeft != undefined) {
            this.headerRowStyle.marginLeft = '-' + this.state.scrollLeft.toString() + 'px';
        }//顶部首行偏移位置
        this.dataAreaStyle = {
            position: "absolute",
            top: "0px",
            width: "100%",
            height: "100%",
            paddingLeft: this.leftAreaWidth.toString() + "px",
            paddingTop: "28px"
            /*paddingBottom: "45px", 将来用做底部表格的复合计算承载*/
        };//数据区域样式
        this.kClass = (this.kClass == undefined) ? ("k" + k.GetTimeStrMS() + this.props.dsid ) : this.kClass;//获取唯一类id
        var gridCols = this.gridColsOpt = this.props.confCells;//获取表格配置数据
        if (k.isArray(this.state.cellOpt)) gridCols = this.gridColsOpt = this.state.cellOpt;//如果state中自己有
        //console.log(gridCols);
        //遍历计算出各单元格的类字符串\存储列的自定义样式\列输入校验
        var gridStyle = ' ', col,
            cellLeft = this.leftAreaWidth,
            cellWidth = 0,
            rowWidth = 0;
        this.cellRender = {};
        this.needCheckCol = {};
        this.allColOpt = {};
        for (var i = 0, len = gridCols.length; i < len; i++) {
            col = gridCols[i];
            this.allColOpt[col['NAME']] = col;//放入配置对象中
            if (col['IS_PK'] == 'T') this.pkCol = col['NAME'];//设定主键列
            if (col['IS_FK'] == 'T') this.fkCol = col['NAME'];//设定外键列
            if (col['CELL_RENDER'] != null && col['CELL_RENDER'] != '') {
                try {
                    this.cellRender[col['NAME']] = {
                        opt: col,
                        json: JSON.parse(col['CELL_RENDER'])
                    };
                } catch (e) {
                    console.log("解析CELL_RENDER出错：" + col['CELL_RENDER']);
                }
            }//如果存在编辑后的数据,这里将来要做下改动,这里其实是自定义的列行为描述
            if (col['CONTROL_TYPE'] == 'number') {
                this.needCheckCol[col['NAME']] = {checkType: col['CONTROL_TYPE'], opt: col};
            }//校验记录
            if (col['IS_SHOW'] == 'F') continue;//当是否展示为F的时候,就是不展示到界面,就可以直接略过了
            cellWidth = (col['WIDTH'] == null || col['WIDTH'] == 0 ? 100 : Number(col['WIDTH']));//计算出当前单元格宽度
            gridStyle += '.' + this.kClass + '_' + col['NAME']
                + "{width:" + cellWidth.toString() + "px;"
                + "left:" + cellLeft.toString() + "px;}\r\n";
            if (col['IS_DIG'] != undefined && (col['IS_DIG'] == 'T' || col['IS_DIG'].toString().indexOf(':') > 0)) {
                //如果是挖掘列的话,就要增加其他属性
                gridStyle += '.kGridRow .' + this.kClass + '_' + col['NAME'] + "{color: #1515EA;cursor: pointer;}\r\n";
                gridStyle += '.kGridRow .' + this.kClass + '_' + col['NAME'] + ":hover{text-decoration: underline;}\r\n";
            }
            //增加左边距位置,作为下一个单元格的左边距
            //☆☆☆将来:会根据 width 和 单元格的字符串对比进行刷新
            cellLeft += (col['WIDTH'] == null || col['WIDTH'] == 0 ? 100 : Number(col['WIDTH']));//左边距
            rowWidth += (col['WIDTH'] == null || col['WIDTH'] == 0 ? 100 : Number(col['WIDTH']));
        }
        this.rowWidth = rowWidth;
        this.gridStyle = gridStyle;
        //遍历得出首行的单元格
        var headerCells = [], cellClassName;
        for (var i = 0, len = gridCols.length; i < len; i++) {
            col = gridCols[i];
            if (col['IS_SHOW'] == 'F') continue;
            //在这里把单元格的配置全部放入
            cellClassName = 'kHeaderCellText ' + this.kClass + '_' + col['NAME'];
            headerCells.push(
                <div key={col['NAME']} className={cellClassName}>{col['TEXT']}</div>
            );
        }
        //最后进行渲染
        this.headerCells = headerCells;
    },
    calcGridCell: function () {
        this.lineVercitalStyle = {
            position: "absolute",
            left: "0px",
            top: "0px",
            width: "1px",
            height: "0px"
        };//竖线条的style样式
        this.fastDataStyle = {
            position: "absolute",
            left: "0px",
            top: "0px",
            height: "100%",
            width: "100%",
            overflow: "hidden"
        };//实际数据区域的样式,自由定位
        this.dataRows = [];//数据区域的行,
        this.leftRows = [];//左侧区域的行,这里用行表示,是因为左侧可能有多行固定列
        if (this.state.isMount != true) return;//还没有挂在的话 就直接返回
        var fastDataHeight = this.fastDataHeight;//获取刷新区域的高度
        var fastRowLen = Math.ceil(fastDataHeight / 25);//行高25 计算需要展示的行数,ceil 向上取整
        var scrollTop = this.state.scrollTop == undefined ? 0 : (this.state.scrollTop);//当前滚动条高度
        var renderData;//实际的渲染数据
        if (this.state.hasData != true) {
            renderData = [];
            for (var i = 0; i < fastRowLen; i++) {
                renderData.push({});
            } //制造空数据
            this.lineVercitalStyle.height = '0px';//滚动条所在的真实高度
            this.fastDataStyle.overflow = "hidden";//无数据的话 强制隐藏滚动条
            delete this.fastDataStyle['width'];//也不需要设定宽度
        } else {
            renderData = this.mData['GridData'];
            this.lineVercitalStyle.height = (renderData.length * 25).toString() + 'px';//计算出真实的高度
            this.fastDataStyle.width = "100%";//有数据的话，就还原宽度
            this.fastDataStyle.top = (scrollTop - scrollTop % 25).toString() + "px";//顶部超出的位置,用于计算第一列的超出位置
            delete this.fastDataStyle['overflow'];
        }//结束是否有数据的判断
        this.leftAreaStyle = {
            position: "absolute",
            width: this.leftAreaWidth.toString() + "px",
            top: -(scrollTop % 25).toString() + 'px',
            left: "0px",
            paddingTop: "28px",
            /*paddingBottom: "45px", 将来用做底部表格的复合计算承载*/
            height: "100%",
            //overflow: "hidden",
            zIndex: '2'
        };//计算左侧序号区域的样式
        //通过scrollY计算出当前数据的其实行
        var currentRow = Math.floor(scrollTop / 25),//25行高一行,当为 0-25 高度,其实行为 0行, 除以25的左边整数即是实际行数
            endRow = currentRow + fastRowLen,//结束的行号
            rowStyle,//行样式
            leftRowStyle,//左侧固定列的行样式
            rowData,//行数据
            rowCells,//行内元素
            colOpt,//单元格配置
            cellClassName,//单元格类名
            cellStyle,//单元格样式
            cellLeft = 0,//单元格左边距
            cellText,//单元格内字符串
            canRowEdit = true,//受到渲染单元格的控制
            canCellNowEdit = true;//重置本行可以编辑,目前只有 第一个单元格可以控制本行是否可以修改,并且这个单元格是可以改的
        for (; currentRow < endRow; currentRow++) {//开始生成渲染数数据,从当前行一直到结束行
            rowData = renderData[currentRow];//获取当前行数据
            rowCells = [];//重置单元格数组
            cellLeft = 0;//单元格左边距离
            canRowEdit = true;//本行后面的列是否可以编辑
            for (var i = 0, len = this.gridColsOpt.length; i < len; i++) {//遍历单元格配置
                colOpt = this.gridColsOpt[i];//获取单元格配置
                if (colOpt['IS_SHOW'] == 'F') continue;//如果不显示直接下一个
                canCellNowEdit = canRowEdit;//单元格是否可以修改,受到上一个单元格的影响
                cellClassName = 'kDataGridCell ' + this.kClass + '_' + colOpt['NAME'];//单元格的类名
                cellStyle = {
                    left: cellLeft.toString() + 'px',
                    paddingLeft: "4px",
                    textAlign: (colOpt['TEXT_ALIGN'] == null) ? 'center' : colOpt['TEXT_ALIGN']
                };//单元格配置：左边距、内左距、文字居中样式
                cellLeft += (colOpt['WIDTH'] == null || colOpt['WIDTH'] == 0 ? 100 : Number(colOpt['WIDTH']));//下一个单元格的左边距起点
                if (rowData == undefined || rowData[colOpt['NAME']] === undefined) {
                    //null==undefined true null===undefined false
                    //如果行数据没有,或者没有这个列的数据就可以直接走下一个列
                    cellText = '';//如果没有行数据,可能总共就几行，多出来的都是无用行
                    rowCells.push(
                        <div key={currentRow.toString() + '.' + colOpt['NAME']}
                             className={cellClassName}
                             style={cellStyle}>{cellText}</div>
                    );
                    continue;//如果没有行数据,就不用生成别的东西了
                }
                cellText = rowData[colOpt['NAME']];//实际单元格数据
                if (this.cellRender[colOpt['NAME']]
                    && k.isObject(this.cellRender[colOpt['NAME']]['json'])
                    && this.cellRender[colOpt['NAME']]['json']['renderRow'] != undefined
                ) {
                    try {
                        //传入实际数据,并用 三目表达式来判断后续的单元格是否可以编辑
                        canRowEdit = eval('(' +
                            this.cellRender[colOpt['NAME']]['json']['renderRow'].replace('$val', cellText)
                            + ')');
                    } catch (e) {
                        console.info(e.message + e.stack);
                    }
                }//根据渲染的单元格 是否有行编辑控制模式重置行编辑
                if (colOpt['DZ_ID'] != null && colOpt['DZ_ID'] != '' && colOpt['CONTROL_TYPE'] != 'image') {
                    //如果有对照id,并且不是图形控件,就用对照信息翻译一次,如果没有的话,返回的还是原本内容
                    cellText = k.GetDzTextByPk(colOpt['DZ_ID'], cellText);
                }
                //如果列名有 DATE 就进行时间翻译 是 _DATE 或者 DATE_
                if (colOpt['NAME'].indexOf('_DATE') >= 0 || colOpt['NAME'].indexOf('DATE_') >= 0 || colOpt['NAME'].indexOf('_TIME') >= 0) {
                    if (cellText != null && cellText != undefined && cellText.indexOf('T') > 0) {
                        cellText = cellText.replace('T', ' ').replace('Z', '');//先去掉 T 和 Zs
                        cellText = new Date(cellText);//转化为标准时间
                        cellText = (new Date(cellText.getTime() + 8 * 60 * 60 * 1000)).toString();//加上8个时区
                        rowData[colOpt['NAME']] = cellText;//把原本的列 给更新掉！
                    }
                }
                if (k.isNumber(cellText)) {//如果是数值型的话,把小数点保留3位,之所以到这里才判断,是尽量把 continue的情况都考虑完
                    cellText = cellText.toFixed(3);//parseFloat(cellText.toFixed(3));
                }
                //如果名字包含MONEY,则要提取成2位小数点,并且带上 羊角符号
                if (colOpt['NAME'].indexOf('_MONEY') >= 0 || colOpt['NAME'].indexOf('MONEY_') >= 0) {
                    if (k.isNumber(cellText)) {
                        //最多2位小数点
                        cellText = '￥' + ((cellText == undefined || cellText == null) ? 0 : cellText).toFixed(2);
                    }
                }
                //如果可以编辑,并且是表格是带有数据的,且所处当前行可以编辑
                rowCells.push(<DgInputCell
                        key={currentRow.toString() + '.' + colOpt['NAME']}
                        rowno={currentRow}
                        cellClass={cellClassName}
                        cellStyle={cellStyle}
                        cellText={cellText}
                        dzid={colOpt['DZ_ID']}
                        colName={colOpt['NAME']}
                        parentCheckChange={this.checkCellChange}
                        parentHandChange={this.cellChange}
                        ctrType={colOpt['CONTROL_TYPE']}
                        canUse={this.state.canUse == undefined ? true : this.state.canUse}
                        canEdit={this.state.CanAllEdit == false ? false
                            : (colOpt['IS_EDIT'] == 'T' && this.state.hasData == true && canCellNowEdit == true) ? true : false}
                        dataListClick={this.dataListClick}
                        dgCellClick={this.dgCellClick}
                    />
                );
            }//结束遍历配置,行内单元格生成完毕
            rowStyle = {width: this.rowWidth.toString() + 'px'};//行样式
            leftRowStyle = {};//左侧行样式
            if (currentRow % 2 == 0) {
                rowStyle.backgroundColor = '#ffffff';//如果是奇数行背景色为
                leftRowStyle.backgroundColor = '#ffffff';
            } else {
                rowStyle.backgroundColor = '#f5f5f6';//如果是偶数行背景色为
                leftRowStyle.backgroundColor = '#f5f5f6';
            }
            var isSelect = this.state.canUse == false ? false
                : this.selectRows[currentRow] == undefined ? false
                    : this.selectRows[currentRow];
            //单元格生成完以后,就放入到数据行中
            /*if(currentRow<3)
             console.info("currentRow,isSelect",currentRow,isSelect,this.selectRows);*/
            this.dataRows.push(
                <DataGridRow className="kGridRow"
                             rowStyle={rowStyle}
                             key={currentRow.toString() + 'kGridRow'}
                             ref={"dataGridRow" + currentRow.toString()}
                             rowCells={rowCells}
                             isSelect={isSelect}
                             rowno={currentRow}
                             mouseEnterCell={this.mouseEnterCell}
                             mouseLeaveCell={this.mouseLeaveCell}
                >
                </DataGridRow>
            );
            //左侧区域行 加上勾选框 与 序号列
            if (!this.state.hasData || rowData == undefined) {
                this.leftRows.push(
                    <div className="kGridRow kRowNo" key={currentRow.toString() + 'kleftRow'}
                         style={leftRowStyle}>
                        {""}
                    </div>
                );
            } else {
                this.leftRows.push(
                    <LeftGridRow key={currentRow.toString() + 'kleftRow'}
                                 leftRowStyle={leftRowStyle}
                                 rowno={currentRow}
                                 mouseEnterCell={this.mouseEnterCell}
                                 mouseLeaveCell={this.mouseLeaveCell}
                                 isSelect={isSelect}
                                 ref={"leftGridRow" + currentRow.toString()}
                                 dgCellClick={this.dgCellClick}
                    />
                );
            }//结束左侧 序号列的渲染
        }//结束渲染行的遍历
    },
    mouseEnterCell: function (rowno, colName) {
        if (this.refs["dataGridRow" + rowno.toString()] != undefined)
            this.refs["dataGridRow" + rowno.toString()].setState({isMouseEnter: true});
        if (this.refs["leftGridRow" + rowno.toString()] != undefined)
            this.refs["leftGridRow" + rowno.toString()].setState({isMouseEnter: true});
    },
    mouseLeaveCell: function (rowno, colName) {
        if (this.refs["dataGridRow" + rowno.toString()] != undefined)
            this.refs["dataGridRow" + rowno.toString()].setState({isMouseEnter: false});
        if (this.refs["leftGridRow" + rowno.toString()] != undefined)
            this.refs["leftGridRow" + rowno.toString()].setState({isMouseEnter: false});
    },
    dgCellClick: function (rowno, colName) {
        if (this.state.isMultiSelecct == false && k.isNumber(this.lastSelect)) {
            if (this.refs["dataGridRow" + this.lastSelect.toString()] != undefined)
                this.refs["dataGridRow" + this.lastSelect.toString()].setState({isSelect: false});
            if (this.refs["leftGridRow" + this.lastSelect.toString()] != undefined)
                this.refs['leftGridRow' + this.lastSelect.toString()].setState({isSelect: false});
        }//如果不多选的,就把上一次选中设置为不选中
        //触发行选中
        var data = this.mData, isMultiSelecct = this.state.isMultiSelecct;
        data.Select = data.Select == undefined ? {} : data.Select;
        data.Select[rowno] = (data.Select[rowno] == undefined || data.Select[rowno] == false) ? true : false;//对原始值取反
        if (isMultiSelecct == false) {
            for (var i in data.Select) {
                if (i != rowno) delete data.Select[i];
            }
        }//如果不是多选的话,其他全部清空
        this.selectRows = data.Select;
        var isRowSelect = this.selectRows[rowno] == undefined ? false : this.selectRows[rowno];
        this.lastSelect = rowno;
        this.refs["dataGridRow" + rowno.toString()].setState({isSelect: isRowSelect});
        this.refs['leftGridRow' + rowno.toString()].setState({isSelect: isRowSelect});
        if (k.isFunction(this.props.dataListSelect)) {
            var that = this;
            setTimeout(
                function () {
                    that.props.dataListSelect([data['GridData'][rowno]]);
                }, 300);//这个数字是毫秒数
            return;
        }//如果存在弹框选中事件 则调用弹框
        var colOpt = this.allColOpt[colName];
        if (colOpt != undefined
            && colOpt['IS_DIG'] != undefined
            && (colOpt['IS_DIG'] == 'T' || colOpt['IS_DIG'].toString().indexOf(':') > 0)
            && k.isFunction(this.props.digDsEditPage)
        ) {//判断是否为挖掘时间
            var that = this;
            var pkCol = this.pkCol;
            var dsid = this.props.dsid;
            var dig = colOpt['IS_DIG'] == 'T' ? [] : colOpt['IS_DIG'].toString().split(':');
            if (dig.length == 2) {
                dsid = dig[0].toString();
                pkCol = dig[1].toString();
            }//这里重新赋值
            var gridData = this.mData['GridData'];
            setTimeout(
                function () {
                    that.props.digDsEditPage(gridData[rowno], pkCol, dsid);
                }, 300);//这个数字是毫秒数
            return;
        }
    },
    selectAllRows: function () {
        var isSelectAllRow = !this.state.isSelectAllRow;
        var data = this.mData;
        if (data.Select == undefined) data.Select = {};
        if (k.isArray(data.GridData)) {
            if (isSelectAllRow == false) {
                data.Select = {};//如果不是全选的话,就把选中数据置换为空
            } else {
                for (var i = 0, len = data.GridData.length; i < len; i++)
                    data.Select[i] = true;
            }
        }//只有存在表格数据的时候,才需要进行这个操作
        this.setState({
            isSelectAllRow: !this.state.isSelectAllRow
        });
        this.selectRows = data.Select;
    },
    dataListClick: function (rowno, colName, dzid, theCell) {
        //第几行 什么列点击的
        //console.info("dataListClick rowno colName",rowno,colName);
        //console.info(this);
        //传递至 searchPage的datalist进行控制
        this.props.dataListClick(dzid, theCell, this);//传送给的是 SearchPage的dataListClick 而弹框是为 单独列服务的,所以只需要传输列,为防其他情况,才传自身过去
    },
    checkCellChange: function (rowno, colName, text) {
        var rt = '';
        if (this.needCheckCol[colName] != undefined && this.needCheckCol[colName].checkType == 'number') {
            rt = text.replace(/[^(\d||/.)]/g, '');
        } else
            rt = text;
        //console.info('checkCellChange',rowno, colName, text);
        return rt;
    },
    cellChange: function (rowno, colName, value, showText) {
        //console.info(rowno, colName, value, showText); console.info(this.cellRender, colName);
        if (this.cellRender[colName] && k.isObject(this.cellRender[colName]['json'])) {
            var cellRenderJson = this.cellRender[colName]['json'];
            if (cellRenderJson.jsFns != undefined) {
                k.flux.emitAction('DataGrid'/*调用独特的数据表格功能*/
                    , this.theDataId
                    , cellRenderJson['jsFns']
                    , {
                        val: value,
                        text: showText,
                        col: colName,
                        rowno: rowno,
                        pkCol: this.pkCol,
                        fkCol: this.fkCol
                    });
                return;
            }
        }
        var data = this.mData, body = {
            val: value,
            text: showText,
            col: colName,
            rowno: rowno,
            pkCol: this.pkCol,
            fkCol: this.fkCol
        };
        var gridData = data.GridData;
        if (gridData == undefined || gridData.length < body.rowno)  return;//如果没有表格数据,或 修改行 已经超出表格行数,直接返回
        var rowdata = gridData[body.rowno];//获取行数据
        data.EditData = (data.EditData == undefined) ? {} : data.EditData;//确保 存在EditData
        data.EditData['Add'] = (data.EditData['Add'] == undefined) ? [] : data.EditData['Add'];
        data.EditData['Up'] = (data.EditData['Up'] == undefined) ? [] : data.EditData['Up'];
        if (k.ArrayIndexV(data.EditData['Add'], rowdata) >= 0) {
            rowdata[body.col] = body.val;
            return;
        }
        if (rowdata[body.pkCol] == undefined || rowdata[body.pkCol] == null || rowdata[body.pkCol] == '') {
            console.info('更新单元格失效：无主键');
            return;
        }//看这行的主键值是否不为空,否则就返回,因为没有主键值是无法进行更新的
        var pkVal = rowdata[body.pkCol];
        var isInUp = false, editUp = data.EditData['Up'];
        for (var i = 0, len = editUp.length; i < len; i++) {
            if (editUp[i][body.pkCol] == pkVal) {
                editUp[i][body.col] = body.val;//加入到了更新数据中
                isInUp = true;
            }
        }//遍历更新数据
        if (isInUp == false) {
            var edit = {};
            edit[body.pkCol] = pkVal;
            edit[body.col] = body.val;
            editUp.push(edit);
        }//如果不存在更新数据,就造一个添加进去
    },
    ClearEditData: function () {
        var data = this.mData;
        delete data.EditData;
        delete data.Select;
    },
    AddCopy: function (body) {
        var data = this.mData;
        var gridData = data.GridData;
        if (gridData == undefined || gridData.length < body.rowno) return;//如果没有表格数据,或者修改的这一行 都已经超出表格行数,就直接返回吧
        var rowdata = gridData[body.rowno];//获取行数据
        data.EditData = (data.EditData == undefined) ? {} : data.EditData;//确保 存在EditData add
        data.EditData['Add'] = (data.EditData['Add'] == undefined) ? [] : data.EditData['Add'];
        data.EditData['Up'] = (data.EditData['Up'] == undefined) ? [] : data.EditData['Up'];
        if (k.ArrayIndexV(data.EditData['Add'], rowdata) >= 0) {
            rowdata[body.col] = body.val;
        }//如果当前行已经Add中,就直接改即可,不需要考虑别的
        else if (rowdata[body.pkCol] == undefined || rowdata[body.pkCol] == null || rowdata[body.pkCol] == '') {
            var copyData = $.extend(true, {}, rowdata);//复制一份当前行数据
            rowdata[body.col] = body.val;//将当前行修改后添加到Add中
            data.EditData['Add'].push(rowdata);
            //将新的拷贝插入当前行的下方
            gridData.splice(body.rowno + 1, 0, copyData);
        }//如果当前行不在add中,同时主键值为空,代表是添加复制型
        else {
            var pkVal = rowdata[body.pkCol];
            var isInUp = false, editUp = data.EditData['Up'];
            for (var i = 0, len = editUp.length; i < len; i++) {
                if (editUp[i][body.pkCol] == pkVal) {
                    editUp[i][body.col] = body.val;//加入到了更新数据中
                    isInUp = true;
                }
            }//遍历更新数据
            if (isInUp == false) {
                var edit = {};
                edit[body.pkCol] = pkVal;
                edit[body.col] = body.val;
                editUp.push(edit);
            }//如果不在更新数据,就造一个添加进去
        }//如果存在主键值就放入Up中
        this.setState({
            hasData: true,
            theDataId: this.props.parentCtrl + '-' + this.props.mid + '-' + this.props.dsid,
            theTime: k.GetTimeStrMS()
        });
    },
    componentDidMount: function () {
        var that = this;//生成顶部jquery对象,用于显示区域高度
        that.selectRows = {};
        this.theDataId = this.props.parentCtrl + '-' + this.props.mid + '-' + this.props.dsid;
        this.jquery = $(ReactDOM.findDOMNode(this));
        this.fastDataHeight = 591;//620-1-28=591
        //生成一个新的数据表格管理
        this.mData = {};
        //绑定滚动条事件
        $(ReactDOM.findDOMNode(this)).find('.kDataDiv')[0].onscroll = function (event) {
            //console.info('scrollLeft', this.scrollLeft, 'scrollTop', this.scrollTop);
            //在滚动条的算出来真正合适的高度,因为当宽度过长的时候,会有底部滚动条,影响实际高度的展示
            that.fastDataHeight = that.jquery.find('.kFastData').height();
            k.AutoEditor.detach();
            that.setState({
                scrollLeft: this.scrollLeft,
                scrollTop: this.scrollTop,
                scrollHeight: this.scrollHeight,
                isInScroll: true
            });
        };
        //触发第二次渲染,得到控件高度,算出承载行
        this.setState({isMount: true});
    },
    componentDidUpdate: function () {
        /*if(this.state.isInScroll==true
         && this.jquery.parents('.kPage').is('.ktopPage')){
         this.fastDataHeight = $(ReactDOM.findDOMNode(this)).find('.kFastData').height();
         }*/
        //console.info(this.props.dsid,this.fastDataHeight,$(ReactDOM.findDOMNode(this)).find('.kFastData')[0].offsetHeight);
        //console.info('dataGridRender：经过' + (new Date() - this.beginTime).toString() + 'ms,执行完毕.');
    },
    render: function () {
        //console.info('datagrid render' + (new Date).toString());
        //每次渲染都会计算一次首行 和 style
        this.beginTime = new Date();
        this.calcGridStyle();
        //计算表格实际区域内容
        this.calcGridCell();
        var leftTopArea;
        if (this.state.isMultiSelecct == true) {
            leftTopArea = <div className="kDataGridLeftTopArea" style={this.leftTopAreaStyle}>
                <div className="kHeaderCellText kLeftTopDgSelectCol" onClick={this.selectAllRows}>
                    全选<span className="kLeftTopDgSelect"></span>
                </div>
                <div className="kHeaderCellText kLeftTopDgRowNo">序号
                </div>
            </div>
        } else {
            leftTopArea = <div className="kDataGridLeftTopArea" style={this.leftTopAreaStyle}>
                <div className="kHeaderCellText kLeftTopDgSelectCol">
                    <span className="kLeftTopDgSelect"></span>
                </div>
                <div className="kHeaderCellText kLeftTopDgRowNo">序号
                </div>
            </div>
        }
        //关于dataArea由于是绝对定位,导致其内部的线条 会把 padding的距离也算上去,所以里面要再加个 datadiv,这个才是真实真正的数据容器
        return <div className="kDataGridPanel" style={this.props.topStyle}>
            <style>{this.gridStyle}</style>
            {leftTopArea}
            <div className="kDataGridHeaderRow" style={this.headerRowStyle}>
                {this.headerCells}
            </div>
            <div className="kLeftArea" style={this.leftAreaStyle}>
                {this.leftRows}
            </div>
            <div className="kDataArea" style={this.dataAreaStyle}>
                <div className="kDataDiv">
                    <div className="kLineVercital" style={this.lineVercitalStyle}></div>
                    <div className="kFastData" style={this.fastDataStyle}>
                        {this.dataRows}
                    </div>
                </div>
            </div>
        </div>
    }
});