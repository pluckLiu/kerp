/*************************************************************************
 * k 可视化配置,
 * 只有在请求了这个地址连接后才生成 可视化配置界面
 *************************************************************************/
(function (window,$) {
    k["dev"]={
        init:function(){
            //如果 已进入开发者模式,就退出掉
            if(this.IsInDev()){
                this.EndVisualDev();
                return;
            }
            this.BeginVisualDev();
        },
        Container:null,
        guidBtn:null,
        content:null,
        BeginVisualDev:function(){
            //获取 k.Tab选中的tabitem的id
            //拿这个id 调用ajax,进行检索,获取配置界面的配置信息
            //如果返回值,提示说：不是模块,则弹出提示,恢复原有的界面
            //如果有正确的返回值,确保在底下创建一个页面,然后开始承载
            var mid= k.app.Tab.GetSelectItemId(),that=this;
            this.mid=mid;
            this.midTp= k.app.Tab.GetSelectPage();
            k.ajax('VisualConfig',{
                data:{'mid':mid,json:1},
                async:false,
                success:function(data){
                    if(k.isString(data)){
                        alert(data);
                    }else if(data.error!=undefined){
                        alert(data.error);
                    }else{
                        that.Render(data);
                    }
                }
            });
        },
        btn:{
            'saveCfg':function(dsid,page){
                //先获取到主dsid是什么
                var pkdsid=page.DjGrid.jqGrid.find('.kCell[id=DS_ID]').text();
                var sd={};
                var that=this;
                var theMod= k.app.mod[that.mid];
                //然后把各个DataGrid数据进行一次格式化
                sd['d0']=page.DjGrid.GetEditData({'PK_COL':'DS_ID','PKVAL':pkdsid});
                sd['d1']=page.DataGrid_W.GetEditData();
                sd['d2']=page.DataGrid_WB.GetEditData();
                sd['d3']=page.DataGrid_G.GetEditData();
                sd['d4']=page.DataGrid_D.GetEditData();
                sd['d5']=page.DataGrid_DB.GetEditData();
                sd['dsids']={'d0':'ds_sysPage','d1':'ds_wcols','d2':'ds_wbtns','d3':'ds_gcols','d4':'ds_djcols','d5':'ds_djbtns'};
                k.ajax("saveDs",{
                    data:{dsid:'ds_sysPage',ed:JSON.stringify(sd),pkVal:dsid,json:1},
                    async:false,
                    success:function(data){
                        if(data.error!=undefined){
                            alert(data.error);
                            return;
                        }
                        page.DjGrid.ResetEditData();
                        page.DataGrid_W.ResetEditData();
                        page.DataGrid_WB.ResetEditData();
                        page.DataGrid_G.ResetEditData();
                        page.DataGrid_D.ResetEditData();
                        page.DataGrid_DB.ResetEditData();
                        //再次重新加载
                        that.EndVisualDev();
                        that.BeginVisualDev();
                        //获取模块对应的相关数据,然后加载出来
                        var mask= k.LoadingMask(that.midTp).ShowMsg("获取模块信息中...");
                        that.midTp.empty();//清空jquery数据
                        k.ajax("showModule",{
                            data:{mid:that.mid,sysid:'',json:1},
                            success:function(data){
                                k.app.mod[that.mid]=k.ModCtrl(that.mid,theMod.sysid,data,that.midTp,mask);
                                that.EndVisualDev();//重新加载后,取消可视化配置
                            }
                        });

                    }
                });
            },
            'calc':function(mdsid,page){
                var that=this;
                var dsid=page.Tab.GetSelectItemId();//获取当前明细tab对应的dsid
                var dg=null;
                if(dsid=='ds_wcols'){
                    dg=page.DataGrid_W;
                }else if(dsid =='ds_wbtns'){
                    dg=null;
                }else if(dsid =='ds_gcols'){
                    dg=page.DataGrid_G;
                }else if(dsid =='ds_djcols'){
                    dg=page.DataGrid_D;
                }else if(dsid =='ds_djbtns'){
                    dg=null;
                }//结束获取 datagrid控件
                k.ajax('visualCalc',{
                    data:{dsid:mdsid,json:1},
                    success:function(data){
                        if(data.error!=undefined){
                            alert(data.error);
                        }
                        //遍历数据,进行添加行
                        if(data.cols!=undefined && dg!=null){
                            var row=null,Col=null,isInGrid=false;
                            //进行遍历 COL CME
                            //NAME TEXT
                            for(var i in data.cols){
                                Col=data.cols[i];
                                //遍历一下当前dg的行,看是否有这个列名
                                for(var j in dg.GridData){
                                    if(dg.GridData[j]['NAME']==Col['COL']){
                                        isInGrid=true;
                                    }
                                }
                                //如果在dg中不存在的话,就添加
                                if(isInGrid==false){
                                    row=dg.MakeNewRow();
                                    $.extend(row,{'NAME':Col['COL'],'TEXT':Col['CME'],'DS_ID':mdsid});
                                    dg.AppendEditRow(row);//添加编辑行
                                }
                                isInGrid=false;//重置
                            }
                        }//如果列是存在的


                    }
                });
            },
            'adddi':function(mdsid,page){
                var dsid=page.Tab.GetSelectItemId();
                var dg=null;
                if(dsid=='ds_wcols'){
                    dg=page.DataGrid_W;
                }else if(dsid =='ds_wbtns'){
                    dg=page.DataGrid_WB;
                }else if(dsid =='ds_gcols'){
                    dg=page.DataGrid_G;
                }else if(dsid =='ds_djcols'){
                    dg=page.DataGrid_D;
                }else if(dsid =='ds_djbtns'){
                    dg=page.DataGrid_DB;
                }
                var row=dg.MakeNewRow();
                $.extend(row,{'DS_ID':mdsid});
                dg.AppendEditRow(row);
            },
            'deldi':function(mdsid,page){
                var dsid=page.Tab.GetSelectItemId();
                var dg=null;
                if(dsid=='ds_wcols'){
                    dg=page.DataGrid_W;
                }else if(dsid =='ds_wbtns'){
                    dg=page.DataGrid_WB;
                }else if(dsid =='ds_gcols'){
                    dg=page.DataGrid_G;
                }else if(dsid =='ds_djcols'){
                    dg=page.DataGrid_D;
                }else if(dsid =='ds_djbtns'){
                    dg=page.DataGrid_DB;
                }
                dg.DeleteRowByIx();
            }
        },
        Render:function(data){
            var that=this;
            this.IsIndev=true;
            //解析对照信息
            k.DzCalc(data.dz);
            //让竖向滚动条出来
            $('body').css({
                "overflow-y":"auto"
            });
            //加上自己的容器
            if(this.Container==null){
                this.Container
                    =$('<div id="kdev" style="position:relative;margin:0px 50px 50px 50px;border:1px solid #202020"/>')
                    .appendTo('body');
            }
            this.Container.empty();
            //遍历dsdn
            var dsid='',desc,dsname,Page,cfg=data.vsConfig,dsdata=data.data;
            if(data.dsdn !=undefined && cfg!=undefined && dsdata!=undefined){
                var dsbtns=new Array();
                dsbtns.push({'JS_FUNC':'saveCfg','BUTN_TEXT':'保存'});
                dsbtns.push({'JS_FUNC':'calc','BUTN_TEXT':'计算配置列'});
                dsbtns.push({'JS_FUNC':'adddi','BUTN_TEXT':'添加明细'});
                dsbtns.push({'JS_FUNC':'deldi','BUTN_TEXT':'删除明细'});
                for(var i in data.dsdn){
                    Page={}
                    desc=data.dsdn[i];
                    dsid=desc.substring(0,desc.indexOf('-'));
                    dsname=desc.substring(desc.indexOf('-')+1,1000);
                    //生成一个明细gird的提示条block
                    $('<div style="position:relative;height:25px;width:95%;margin:5px 0px 0px 2%;"><div class="kDjCaption"/><div class="kLineMiddle" /></div>')
                        .appendTo(this.Container)
                        .children('.kDjCaption').text(dsid+'配置信息');
                    k.CreateBtns($('<div id="'+dsid+'_epDsbtns" style="min-width:380px;margin-left:3%;" />')
                            .appendTo(this.Container)
                        ,dsbtns)
                        .on('click','.kbutton',function(e){
                            var tar=$(e.delegateTarget);
                            var bt=$(this);
                            var fn=bt.attr("fn");
                            if(that.btn[fn]){
                                that.btn[fn].apply(that,[tar.data('dsid'),tar.data('page')]);
                            }
                        })
                        .data('dsid',dsid)
                        .data('page',Page);
                    //单行sys_page
                    Page.DjGrid= k.DjGrid($('<div id="'+dsid+'" style="width:100%;margin:5px 50px 0px 50px;" />').appendTo(this.Container),{
                        rowcols:4,
                        cols:cfg['ds_sysPage']
                    }).LoadData(dsdata[i]['ds_sysPage']);
                    //生成一个明细gird的提示条block
                    $('<div style="position:relative;height:25px;width:95%;margin-left:2%;"><div class="kDjCaption">各数据列配置信息</div><div class="kLineMiddle" /></div>')
                        .appendTo(this.Container);
                    //再生成 tab控件
                    Page.Tab= k.TabCtrl($('<div id="'+dsid+'-gridCfg" style="width:100%;padding:0px 50px;height:350px;position:relative;" />')
                        .appendTo(this.Container));
                    //然后把查询列、查询按钮、表格列、详情列、详情按钮加载出来
                    //查询列
                    Page.TabPage_W=Page.Tab.Add('查询列配置',{id:'ds_wcols',CanClose:false});
                    Page.DataGrid_W=k.DataGrid($('<div class="searchGrid" style="margin-top:8px;"/>').appendTo(Page.TabPage_W),
                        {
                        cols:cfg.ds_wcols,
                        CanCellEdit:1,
                        CanMoreSelect:false,
                        CanRowNoMoreSelect:true,
                        Height:300,
                        PK_COL:'PK_ID'
                    }).LoadData(dsdata[i]['ds_wcols']);
                    //查询按钮
                    Page.TabPage_WB=Page.Tab.Add('查询按钮配置',{id:'ds_wbtns',CanClose:false});
                    Page.DataGrid_WB=k.DataGrid($('<div class="searchGrid" style="margin-top:8px;"/>').appendTo(Page.TabPage_WB),
                        {
                            cols:cfg.ds_wbtns,
                            CanCellEdit:1,
                            CanMoreSelect:false,Height:300,
                            PK_COL:'PK_ID'
                        }).LoadData(dsdata[i]['ds_wbtns']);
                    //表格列
                    Page.TabPage_G=Page.Tab.Add('表格列配置',{id:'ds_gcols',CanClose:false});
                    Page.DataGrid_G=k.DataGrid($('<div class="searchGrid" style="margin-top:8px;"/>').appendTo(Page.TabPage_G),
                        {
                            cols:cfg.ds_gcols,
                            CanCellEdit:1,
                            CanMoreSelect:false,Height:300,
                            PK_COL:'PK_ID'
                        }).LoadData(dsdata[i]['ds_gcols']);
                    //详情列
                    Page.TabPage_D=Page.Tab.Add('详情列配置',{id:'ds_djcols',CanClose:false});
                    Page.DataGrid_D=k.DataGrid($('<div class="searchGrid" style="margin-top:8px;"/>').appendTo(Page.TabPage_D),
                        {
                            cols:cfg.ds_djcols,
                            CanCellEdit:1,
                            CanMoreSelect:false,Height:300,
                            PK_COL:'PK_ID'
                        }).LoadData(dsdata[i]['ds_djcols']);
                    //详情按钮
                    Page.TabPage_DB=Page.Tab.Add('详情按钮配置',{id:'ds_djbtns',CanClose:false});
                    Page.DataGrid_DB=k.DataGrid($('<div class="searchGrid" style="margin-top:8px;"/>').appendTo(Page.TabPage_DB),
                        {
                            cols:cfg.ds_djbtns,
                            CanCellEdit:1,
                            CanMoreSelect:false,Height:300,
                            PK_COL:'PK_ID'
                        }).LoadData(dsdata[i]['ds_djbtns']);
                }
            }//结束遍历
        },
        EndVisualDev:function(){
            //由于 每次请求 kdev.js 都是一个新的 k.dev 对象,所以要用juqery 来删除
            $('#kdev').remove();
            //取消 竖向滚动条
            $('body').css({
                "overflow-y":"hidden"
            });
            //让主界面高度变会正常
            $('#ainit').css({
                "height":"100%"
            });
            this.Container=null;
        },
        IsInDev:function(){
            if($('#kdev').length>0)
                return true;
            else
                return false;
        }
    };
})(window,jQuery);
