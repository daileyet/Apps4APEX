window.amb = window.amb || {};
window.amb.M = window.amb.M || {};
var M = window.amb.M;
var V = window.amb.V;
var Vn = V.names;

M.init=function(){
	M.state = new M.State();
	M.items = {// apex page items name
			'object_id': M.Item.create(Vn.I_id,true)
			,'version': M.Item.create(Vn.I_version,true)
			,'object_name': M.Item.create(Vn.RI_obj_name,false)
			,'top_section': M.Item.create(Vn.S_top,false)
			,'main_section': M.Item.create(Vn.S_main,false)
			,'main_section_heading': M.Item.create(Vn.S_main_heading,false)
			,'alert_region': M.Item.create(Vn.N_cp_err,false)
			,'alert_region_msg': M.Item.create(Vn.N_cp_err_msg,false)
			,'alert_region_close': M.Item.create(Vn.N_cp_err_close,false)
	};
	M.buttons = {
		//object section
		'fullscreen':M.Button.create(Vn.B_fullscreen),
		'refresh':M.Button.create(Vn.B_refresh),
		'save':M.Button.create(Vn.B_save),
		'compile':M.Button.create(Vn.B_compile),
		'obj_option':M.Button.create(Vn.B_obj_option,function(newval_obj_id){
			var clickSource = this.attr('onclick');
			clickSource = clickSource.replace(/P4_OBJECT:(.*)(\\u0026|&)/g, 'P4_OBJECT:'+newval_obj_id+'&');
			this.attr('onclick',clickSource);
		}),
		//version sections
		'create':M.Button.create(Vn.B_create),
		'init':M.Button.create(Vn.B_init),
		'build_all':M.Button.create(Vn.B_build_all),
		'export':M.Button.create(Vn.B_export),
		
		'info_obj_proxy':M.Button.create(Vn.L_obj_info),
		'info_obj':M.Button.create(Vn.B_obj_info,function(newval_obj_id){
			var clickSource = this.attr('onclick');
			clickSource = clickSource.replace(/P2_ID:(.*)(\\u0026|&)/g, 'P2_ID:'+newval_obj_id+'&');
			this.attr('onclick',clickSource);
		})
		
	};
	M.state.update({
		obj_id:M.items.object_id.getVal(),
		obj_version:M.items.version.getVal()
	});
};

/**
 * State Type
 */
M.State = function(){
	this.obj_id="";
	this.obj_name="";
	this.obj_status="";
	this.obj_code="";
	this.obj_compiled="";
	this.obj_version="";
	this.obj_compile_error="";
	this.events = {
		ID:[],NAME:[],STATUS:[],VERSION:[],CODE:[],COMPILED:[],COMPILE_ERROR:[],AUTO_SAVE:[],AUTO_SAVE_INTERVAL:[]
	};
	this.obj_auto_save=true;
	this.obj_auto_save_interval=30*1000;
};
M.State.prototype.update=function(stateObj){
	var oldState = {
			obj_id:M.state.obj_id,
			obj_name:M.state.obj_name,
			obj_status:M.state.obj_status,
			obj_code:M.state.obj_code,
			obj_compiled:M.state.obj_compiled,
			obj_version:M.state.obj_version,
			obj_compile_error:M.state.obj_compile_error,
			obj_auto_save:M.state.obj_auto_save,
			obj_auto_save_interval:M.state.obj_auto_save_interval
	};
	stateObj == undefined || stateObj.obj_id==undefined ||( 
			M.state.obj_id = stateObj.obj_id,
			this.fireUpdateEvent('ID',{old_val:oldState.obj_id,new_val:stateObj.obj_id})
			);
	stateObj == undefined || stateObj.obj_name==undefined ||(
			M.state.obj_name = stateObj.obj_name,
			this.fireUpdateEvent('NAME',{old_val:oldState.obj_name,new_val:stateObj.obj_name})
			);
	stateObj == undefined || stateObj.obj_status==undefined ||(
			M.state.obj_status = stateObj.obj_status,
			this.fireUpdateEvent('STATUS',{old_val:oldState.obj_status,new_val:stateObj.obj_status})
			);
	stateObj == undefined || stateObj.obj_code==undefined || (
			M.state.obj_code = stateObj.obj_code,
			this.fireUpdateEvent('CODE',{old_val:oldState.obj_code,new_val:stateObj.obj_code})
			);
	stateObj == undefined || stateObj.obj_compiled==undefined || (
			M.state.obj_compiled = stateObj.obj_compiled,
			this.fireUpdateEvent('COMPILED',{old_val:oldState.obj_compiled,new_val:stateObj.obj_compiled})
			);
	stateObj == undefined || stateObj.obj_version==undefined || (
			M.state.obj_version = stateObj.obj_version,
			this.fireUpdateEvent('VERSION',{old_val:oldState.obj_version,new_val:stateObj.obj_version})
	);
	stateObj == undefined || stateObj.obj_compile_error==undefined || (
			M.state.obj_compile_error = stateObj.obj_compile_error,
			this.fireUpdateEvent('COMPILE_ERROR',{old_val:oldState.obj_compile_error,new_val:stateObj.obj_compile_error})
	);
	stateObj == undefined || stateObj.obj_auto_save==undefined || (
			M.state.obj_auto_save = stateObj.obj_auto_save,
			this.fireUpdateEvent('AUTO_SAVE',{old_val:oldState.obj_auto_save,new_val:stateObj.obj_auto_save})
	);
	stateObj == undefined || stateObj.obj_auto_save_interval==undefined || (
			M.state.obj_auto_save_interval = stateObj.obj_auto_save_interval,
			this.fireUpdateEvent('AUTO_SAVE_INTERVAL',{old_val:oldState.obj_auto_save_interval,new_val:stateObj.obj_auto_save_interval})
	);
};
M.State.prototype.fireUpdateEvent=function(propertyName,valObj){
	var listeners = this.events[propertyName];
	for(var i=0,j=listeners.length;i<j;i++){
		listeners[i].call(this,valObj);
	}
}
M.State.prototype.addUpdateListener=function(propertyName,fnListener){
	this.events[propertyName].push(fnListener);
}

/**
 * Item Type
 */
M.Item = function(name, isapex) {// item object
	this.name = name;
	this.isApex = (isapex == undefined ? false : isapex);
	this.getVal = function() {
		if (this.name==undefined) return "";
		return this.isApex?$v(this.name):$(this.name).val();
	}
	this.setVal=function(val){
		if (this.name==undefined) return;
		this.isApex?$s(this.name,val):$(this.name).val(val);
	}
	this.get$=function(){
		return this.isApex?$(apex.item(this.name).node):$(this.name);
	}
	this.hide=function(){
		var $item = this.get$();
		$item.hide();
	}
	this.show=function(){
		var $item = this.get$();
		$item.show();
	}
	this.text=function(sVal){
		var $item = this.get$();
		if(sVal==undefined)
			return $item.text();
		else
			$item.text(sVal);
		
	}
	this.html=function(sHtml){
		var $item = this.get$();
		if(sVal==undefined)
			return $item.html();
		else
			$item.html(sHtml);
	}
	this.isEmpty=function(){
		var sVal = this.getVal();
		if(sVal==""){
			return true;
		}
		return false;
	}
}

M.Item.create=function(name, isapex){
	return new window.amb.M.Item(name, isapex);
}

M.Button = function(name,refreshFn){
	this.name=name;
	this.refreshHander = refreshFn;
	
	this.bindClick=function(fnClick){
		$(this.name).click(fnClick);
	}
	this.attr=function(sAttrName,sVal){
		if(sVal==undefined)
			return $(this.name).attr(sAttrName);
		else
			$(this.name).attr(sAttrName,sVal);
	}
	this.title=function(sVal){
		if(sVal==undefined){
			return this.attr('title');
		}else{
			this.attr('title',sVal);
		}
	}
	this.click=function(data){
		apex.event.trigger($(this.name),"click",data);
	}
	this.refresh=function(objArg){
		if(this.refreshHander){
			this.refreshHander.call(this,objArg);
		}
	}
}

M.Button.create=function(name,refreshFn){
	return new M.Button(name,refreshFn);
}


