var k = window.k ? window.k : {};//下面的操作时确保k 存在,且尽量避免全局作用域的查找，提升性能
if (k.reactIns == undefined) k.reactIns = {};
var reactIns = k.reactIns;//react 控件的实例都存储在这里，用于存储各控件的实例
var insId = k.getDateNumber(new Date);
var TreeItem = React.createClass({
    getInitialState: function () {
        return {itemData: this.props.treeData};
    },
    foldChange: function () {
        if (this.state.childrenLength > 0)
            this.setState({isFold: !this.state.isFold});
    },
    render: function () {
        var state = this.state, data = this.state.itemData, that = this;
        state.isFold = state.isFold != undefined ? state.isFold : data.isFold;
        var children = state.isFold == true ? [] : k.isArray(data.children) ? data.children : [];
        state.childrenLength = k.isArray(data.children) ? data.children.length : 0;
        return <div className="kTreeItem">
            <span className="cursorPointer"
                  onClick={this.foldChange}>{state.childrenLength == 0 ? '' : state.isFold == true ? '+ ' : '- '}</span>
            <span>{data.text}</span>
            {children.map(function (item, inx) {
                return <TreeItem key={"treeItem." + (that.props.treeLevel + 1).toString() + "." + inx.toString()}
                                 treeLevel={that.props.treeLevel + 1} treeData={item} itemInx={inx}/>
            })}
        </div>
    }
});
var Tree = React.createClass({
    getInitialState: function () {
        return {treeData: []};
    },
    componentDidMount: function () {
        this.InsId = 'tree' + this.props.insId;
        reactIns[this.InsId] = this;
    },
    render: function () {
        var state = this.state;
        if (state.treeData.length == 0)
            return null;
        else {
            console.info('LoadTreeData', state.treeData);
            return <div>
                {state.treeData.map(function (item, inx) {
                    return <TreeItem key={"treeItem.0." + inx.toString()} treeLevel={0} treeData={item}
                                     itemInx={inx}/>
                })}
            </div>
        }
    },
    LoadTreeData: function (treeData) {
        this.setState({treeData: k.isArray(treeData) ? treeData : [treeData]});
    }
});
var begin = new Date;
ReactDOM.render(
    <Tree insId={insId}/>,
    document.getElementById('theRoot')
);
reactIns['tree' + insId].LoadTreeData([{
    "text": "一级树1",
    "isFold": false,
    "children": [{
        "text": "二级树1",
        "isFold": false,
        "children": [{"text": "2.1三级树1", "isFold": false, "children": []}]
    }, {
        "text": "二级树2",
        "isFold": true,
        "children": [{"text": "2.2三级树1", "isFold": false, "children": []}]
    }
    ]
}, {
    "text": "一级树2", "isFold": false, "children": []
}]);
console.info('tree：经过' + (new Date() - begin).toString() + 'ms,执行完毕.');