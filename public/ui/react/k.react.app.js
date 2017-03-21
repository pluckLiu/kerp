//定义顶部样式 topBaner组件 及 其所需的style
var k = window.k;
var TopBaner = React.createClass({
    render: function () {
        return <div id="topBaner">
            <div className="GMLogo">Logo</div>
            <div className="exitDiv" onClick={this.LoginOut}>
                <span className="exitPng"></span>
                退出
            </div>
            <div className="setDiv">
                <span className="setPng"></span>
                设置
            </div>
            <div className="msgDiv">
                <span className="msgPng"></span>
                消息
            </div>
        </div>
    },
    LoginOut: function () {
        window.location = "login.html";
    }
});
var Bottom = React.createClass({
    render: function () {
        return <div id="bottom">
            <div id="copyRight">2017© Guomai Culture</div>
            <div id="contactUs">
                <span>联系我们</span>
                <span>文字内容</span>
                <span>文字内容</span>
            </div>
        </div>
    }
});
var ModItem = React.createClass({
    getInitialState: function () {
        return {isSelect: false};
    },
    render: function () {
        var isSelect = this.state.isSelect;
        var jiantou = null;
        if (isSelect == false)
            jiantou = <span className="youjt"></span>;
        else
            jiantou = <span className="xiajt"></span>;
        return <div id={this.props.mid} data-sysid={this.props.sysid}
                    className={"modItem " + (isSelect ? "leftSysSelect" : "")}>
            <span className="docPng"></span>
            <span className="sysText">{this.props.name}</span>
            {jiantou}
            <div className="sysMask"></div>
        </div>
    }
});//ModItem
var SysItem = React.createClass({
    getInitialState: function () {
        return {modules: this.props.modules, isSelect: false, isExpand: false};
    },
    render: function () {
        var modules = this.state.modules, isSelect = this.state.isSelect, isExpand = this.state.isExpand, that = this;
        var jiantou = null, mods = [];
        if (modules.length > 0) {
            if (isExpand == false)
                jiantou = <span className="youjt"></span>;
            else {
                jiantou = <span className="xiajt"></span>;
                mods = modules.map(function (item, inx) {
                    return <ModItem key={item.M_ID}
                                    ref={item.M_ID}
                                    mid={item.M_ID}
                                    name={item.M_NAME}
                                    sysid={that.props.sysid}
                    />
                });
            }
        }//只有具有子项的时候 才会判断是否展开 以及 箭头方向
        return <div id={this.props.sysid} className={"sysItem " + (isSelect ? "leftSysSelect" : "")}>
            <span className="docPng"></span>
            <span className="sysText">{this.props.name}</span>
            {jiantou}
            <div className="sysMask"></div>
            {mods}
        </div>
    }
});//子系统item
var SystemTree = React.createClass({
    getInitialState: function () {
        return {sysTree: this.props.sysTree};
    },
    sysClick: function (event) {
        var refs = this.refs;//先取消所有item的选中状态
        for (var sys in refs) {
            refs[sys].setState({isSelect: false});//取消 sysItem的选中状态
            for (var mod in refs[sys]['refs'])
                refs[sys]['refs'][mod].setState({isSelect: false});//取消 modItem的选中状态
        }
        var target = $(event.target).parent();//获取目标点击
        var id = target.attr('id');
        if (target.is('.sysItem')) {//当单击事件对应的元素父级别 是 sysItem 就 设置选中 与 展开
            refs[id].setState({isSelect: true, isExpand: !refs[id].state.isExpand});//点击了 sysItem就必然是选中,然后翻转它当前的是否展开状态
        } else if (target.is('.modItem')) {
            var sysid = target.attr('data-sysid');
            refs[sysid]['refs'][id].setState({isSelect: true});
            var mname = target.children('.sysText').text(),
                appTabIns = k.ctrlIns.getTypeIns("AppTabControl")["one"];
            if (appTabIns.IsTabidExists('mod_' + id)) {
                appTabIns.SelectTab('mod_' + id); //设置选中效果
            } else {
                k.CallServerAPI("getModViewData", {mid: id}, function (data) {
                    appTabIns.AddTabItem({
                        "tabid": "mod_" + id,
                        "header": mname,
                        "childCtrl": "Module",
                        "props": data //由于是模块控件,则直接固定数据,取消多次调用
                    }); //添加tab页
                }, 2000);
            }//判断是否存在这个mid
        }//如果是 modItem
    },
    render: function () {
        return <div id="sysTree" onClick={this.sysClick}>
            {this.state.sysTree.map(function (sysItem) {
                return <SysItem key={sysItem.sysid}
                                ref={sysItem.sysid}
                                sysid={sysItem.sysid}
                                name={sysItem.name}
                                modules={sysItem.modules}
                />
            })}
        </div>
    }
});//子系统包裹层
var TabHeader = React.createClass({
    setSelect: function () {
        this.props.parent.SelectTab(this.props.tabid);
    },
    deleteTabItem: function (event) {
        event.stopPropagation();//一定要停止向上冒泡,不然就会触发updateSelect,而由于已经被删除掉,会导致其他都没有选中了
        this.props.parent.DeleteTab(this.props.tabid);
    },
    render: function () {
        if (this.props.isOnlyOne) {
            return (
                <div className={this.props.isSelect ? "kTabitem kTabitem-select" : "kTabitem"} onClick={this.setSelect}>
                    {this.props.header}
                </div>);
        } else {
            return (
                <div className={this.props.isSelect ? "kTabitem kTabitem-select" : "kTabitem"} onClick={this.setSelect}>
                    {this.props.header}
                    <span className="kClose kTabClose" onClick={this.deleteTabItem}></span>
                </div>);
        }
    }
});
var TabPage = React.createClass({
    scroll: function () {
        //k.AutoEditor.detach();
    },
    render: function () {
        var ChildCtrl = k.react[this.props.childCtrl];
        return (
            <div className={this.props.isSelect ? "kTabPage kTabPage-select" : "kTabPage"} onScroll={this.scroll}>
                <ChildCtrl dataProp={this.props.childProp}/>
            </div>
        );
    }
});
var AppTabControl = React.createClass({
    getInitialState: function () {
        return {appTabData: []}
    },
    componentDidMount: function () {
        var typeIns = k.ctrlIns.getTypeIns("AppTabControl");
        typeIns['one'] = this;
    },
    IsTabidExists: function (tabid) {
        var appTabData = this.state.appTabData;
        for (var i = 0, len = appTabData.length; i < len; i++) {
            if (appTabData[i]["tabid"] == tabid)
                return true;
            else
                return false;
        }
    },
    AddTabItem: function (tabObj) {
        var appTabData = this.state.appTabData, theTab = null, selTab;
        for (var i = 0, len = appTabData.length; i < len; i++) {
            if (appTabData[i]["tabid"] == tabObj.tabid) theTab = appTabData[i];//找到是否已经添加过
            if (appTabData[i]["isSelect"] == true) selTab = appTabData[i];
            appTabData[i]["isSelect"] = false;//所有的tab 选中都改成 未选中
        }
        if (theTab == null) {//如果tab为空,则push进去
            appTabData.push(tabObj);
            theTab = tabObj;
        }
        theTab.isSelect = true;//当前tab设置为选中效果
        if (selTab == theTab) {
            //console.info("同tab控件点击");
            return;//当前添加的tab 和 当前选中的tab 本身就想同的话,直接return 不要再渲染
        }
        this.setState({appTabData: appTabData});//触发渲染
    },
    SelectTab: function (tabid) {
        var appTabData = this.state.appTabData;
        for (var i = 0, len = appTabData.length; i < len; i++) {
            if (appTabData[i]["tabid"] == tabid)
                appTabData[i]["isSelect"] = true;
            else
                appTabData[i]["isSelect"] = false;
        }
        this.setState({appTabData: appTabData});
    },
    DeleteTab: function (tabid) {
        var appTabData = this.state.appTabData, isFind = false, isDelSelect = false, len = appTabData.length;
        for (var i = 0; i < len; i++) {
            if (appTabData[i]["tabid"] == tabid) {
                isFind = true;
                if (appTabData[i].isSelect == true) isDelSelect = true;
                appTabData.splice(i, 1);
                break;
            }
        }//通过tabid 找到对应的数据对象
        if (isFind && isDelSelect) {
            len = appTabData.length;
            appTabData[len - 1].isSelect = true;
        }//如果找到真正要删除的了,就把最后的tab也设置为选中
        this.setState({appTabData: appTabData});
    },
    getTabHeaders: function () {
        var appTabData = this.state.appTabData, that = this;
        var len = appTabData.length;
        return appTabData.map(function (item) {
            return <TabHeader key={item.tabid}
                              tabid={item.tabid}
                              header={item.header}
                              isSelect={item.isSelect}
                              isOnlyOne={len == 1 ? true : false}
                              parent={that}
            />
        });
    },
    getTabPages: function () {
        var appTabData = this.state.appTabData;
        return appTabData.map(function (item) {
            return <TabPage key={item.tabid}
                            tabid={item.tabid}
                            isSelect={item.isSelect}
                            childCtrl={item.childCtrl}
                            childProp={item.props}
            />
        });
    },
    render: function () {
        return (
            <div id="content">
                <div className="kTabs">
                    {this.getTabHeaders()}
                </div>
                {this.getTabPages()}
            </div>
        );
    }
});
k.react["App"] = React.createClass({
    componentDidMount: function () {
    },
    render: function () {
        return <div id="szerp">
            <TopBaner />
            <SystemTree sysTree={this.props.sysTree}/>
            <AppTabControl />
            <Bottom />
        </div>;
    }
});//定义app 组件 及 style