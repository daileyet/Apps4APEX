window.amb = window.amb || {};
window.amb.C = window.amb.C || {};
var C = window.amb.C;
var V = window.amb.V;
var M = window.amb.M;

C.init=function(){
	M.state.addUpdateListener("NAME",function(valObj){
		M.items['object_name'].text(valObj.new_val);
	});
	M.state.addUpdateListener("ID",function(valObj){
		M.items['object_id'].setVal(valObj.new_val);
	});
	M.state.addUpdateListener("CODE",function(valObj){
		M.items['object_code'].setVal(valObj.new_val);
		//update editor content
		V.components.editors.primary.doc.setValue(valObj.new_val);
	});
	M.state.addUpdateListener("COMPILED",function(valObj){
		M.items['compile'].setVal(valObj.new_val);
	});
	M.state.addUpdateListener("STATUS",function(valObj){
		M.items['action'].setVal(valObj.new_val);
	});
	M.items.version.isEmpty()?V.components.dialogs.version_selector.open():V.components.dialogs.version_selector.close();
	
};

// main event handers of page and element 
C.pageLoad=function(){
	V.init();
	M.init();
	C.init();
}
C.create=function(){
	
}
C.treeNodeClick = function(name,id){
	V.components.overlays.code_loader.show();//show loading mask
	M.state.update({//change object id & name
		obj_id:id,
		obj_name:name
	});
	// Ajax load object code & status
	apex.server.process('REFRESH_OBJECT',{
		x01:id
	},{
		dataType:'xml',
		success:function(data){
			M.state.update({
				obj_code:$('code',data).text(),
				obj_status:$('action_status',data).text(),
				obj_compiled:$('compile_tag',data).text(),
			});
			V.components.overlays.code_loader.hide();
		}
	});
}
C.refresh=function(){
	
}
C.save=function(){
	
}
C.compile=function(){
	
}

