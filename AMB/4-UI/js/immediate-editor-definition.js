/**
 * plugin for immediate editor
 * 
 * @desc:immediate edit controller defintion
 * @author:dailey.dai@oracle.com
 * @date:2015/06/18
 * @param win
 *            window
 * @param $
 *            jQuery
 */
(function(win, $) {
	// define parent class ImmediateController
	var ImmediateController = Class.create();
	classes['ImmediateController'] = ImmediateController;
	// define static factory method
	ImmediateController.register = function(elementType, controllerClass) {
		if (!ImmediateController._staticMap) {
			ImmediateController._staticMap = {};
		}
		ImmediateController._staticMap[elementType] = controllerClass;
	}
	ImmediateController.create = function(element, $cell, $trigger) {
		if (!ImmediateController._staticMap) {
			ImmediateController._staticMap = {};
		}
		var controllerClass = ImmediateController;
		try {
			controllerClass = ImmediateController._staticMap[element.controller];
		} catch (e) {
		}
		if (!controllerClass) {
			controllerClass = ImmediateController;
		}
		var controllerObj = new controllerClass(element, $cell, $trigger);
		return controllerObj;
	}

	// define method and property
	ImmediateController.prototype = {
		type : "ImmediateController.Class",
		init : function(element, $cell, $trigger) {
			this._element = element;
			this._$cell = $cell;
			this._$trigger = $trigger;
			this._dataModel = {
				oldVal : {},
				newVal : {},
				rowid : ''
			};
		},
		refreshDataModel : function() {
			this._dataModel.oldVal = this.getOldVal(); // update oldVal in
			// model
			// update oldVal in model
			try {
				this._dataModel.newVal = this.getNewVal();
			} catch (e) {
			}
			this._dataModel.rowid = this.getRowId(); // update oldVal in
			// model
			return this;
		},
		getOldVal : function() {
			var el = this._element, $CELL = this._$cell, $oldVal = $(
					el.oldValSelector, $CELL);
			var oldValue = $oldVal.data('immediate-oldval-value'), oldDisplay = $oldVal
					.data('immediate-oldval-display');
			oldDisplay = (oldDisplay == "" || oldDisplay == undefined) ? $oldVal
					.text()
					: oldDisplay;
			oldValue = (oldValue == "" || oldValue == undefined) ? oldDisplay
					: oldValue;
			return {
				display : oldDisplay,
				value : oldValue
			};
		},
		getNewVal : function() {
			var $CELL = this._$cell, newValue = $CELL.find(
					'.immediate-controller').val();
			return {
				display : newValue,
				value : newValue
			};
		},
		getRowId : function() {
			var el = this._element, $CELL = this._$cell, $triggerElement = this._$trigger, $oldVal = $(
					el.oldValSelector, $CELL), rowid = $oldVal
					.data('immediate-id');
			rowid = (rowid == undefined || rowid == "") ? $triggerElement
					.data('immediate-id') : rowid;
			return rowid;
		},
		updateView : function() {
			var el = this._element, $CELL = this._$cell, $oldVal = $(
					el.oldValSelector, $CELL), data = this._dataModel;
			if ($oldVal.data('immediate-oldval-value')) {
				$oldVal.data('immediate-oldval-value', data['newVal']['value']);
			}
			if ($oldVal.data('immediate-oldval-display')) {
				$oldVal.data('immediate-oldval-display',
						data['newVal']['display']);
			}
			$oldVal.text(data['newVal']['display']);
			return this;
		},
		render : function() {
			var orignVal = this.getOldVal().value;
			var controlHtml = '<input type="text" class="immediate-controller" value="'
					+ orignVal + '"/>';
			return controlHtml;
		},
		actionHander : function() {
			var _this = this, el = _this._element, $CELL = _this._$cell, $triggerElement = _this._$trigger;
			_this.refreshDataModel();
			if (_this._dataModel['newVal'] == _this._dataModel['oldVal']
					|| _this._dataModel['newVal']['value'] == _this._dataModel['oldVal']['value']
					|| _this._dataModel['newVal']['value'].toString() == _this._dataModel['oldVal']['value']
							.toString()) {
				$CELL.find(".immediate-wrapper").toggleClass('immediate-hiden');
				$CELL.find(".immediate-place").toggleClass('immediate-hiden');
				return;
			}
			var beforeFn = _this._element.beforeProcessCallback;
			if(beforeFn!=undefined && $.isFunction(beforeFn)){
				beforeFn.call(_this);
			}
			apex.server.process(el.processName, {
				'x01' : _this._dataModel['rowid'],
				'x02' : _this._dataModel['newVal']['value'],
				'x03' : el.db_column
			}, {
				dataType : 'json',
				success : function(ajax_data) {
					var callback = el.processCallback || {
						'success' : function() {
						},
						'fail' : function() {
						}
					};
					var callback_function = "fail";
					if (ajax_data.type == "SUCCESS") {
						callback_function = "success";
						_this.updateView();
					}
					callback[callback_function]({
						'$cell' : $CELL,
						'data' : _this._dataModel
					});// end of invoker callback
					$CELL.find(".immediate-wrapper").toggleClass(
							'immediate-hiden');
					$CELL.find(".immediate-place").toggleClass(
							'immediate-hiden');
				}
			});
		},
		events : function() {
			var _this = this;
			return {
				focusout : _this.actionHander
			};
		},
		active : function() {
			// *********************************************************************
			// render immediate element
			var element = this._element, $CELL = this._$cell, $immediate = $CELL
					.find(".immediate-place"), $wrapper = $CELL
					.find(".immediate-wrapper");
			if ($immediate.length > 0) {
				$immediate.toggleClass('immediate-hiden');
				$wrapper.toggleClass('immediate-hiden');
				this.delayFocus();
				return true;
			}
			// wrapper original place
			var str_origianl = "<div class='immediate-wrapper immediate-hiden'>"
					+ $CELL.html() + "</div>";
			$CELL.empty();
			$(str_origianl).appendTo($CELL);
			// create immediate place and controller
			var str_immediate = "<div class='immediate-place'>" + this.render()
					+ "</div>";
			$(str_immediate).appendTo($CELL);
			// *********************************************************************
			// attach immediate event
			var events = this.events(), $controller = $(
					'.immediate-controller', $CELL);
			this.delayFocus();
			var _this = this;
			for ( var event_name in events) {
				var hander = events[event_name];
				$controller.unbind(event_name).bind(event_name, {},
						function(event) {
							hander.call(_this);
						})
			}
			return this;
		},
		delayFocus : function(sec) {
			var $CELL = this._$cell, delaySec = 1, MAX_LENGTH = 10000;
			var $controller = $('.immediate-controller', $CELL);
			if (sec != undefined && $.isNumeric(sec)) {
				delaySec = sec;
			}
			setTimeout(function() {
				$controller.focus();
				$controller.setCursorPosition(MAX_LENGTH);
			}, delaySec * 1000);
		}
	};
	// end of define parent class ImmediateController
	// define sub controller class select
	var ImmediateController_Number = Class
			.extend(
					classes['ImmediateController'],
					{
						render : function() {
							var orignVal = this.getOldVal().value;
							var controlHtml = '<input type="number" class="immediate-controller" value="'
									+ orignVal + '"/>';
							return controlHtml;
						}
					});
	classes['ImmediateController_Number'] = ImmediateController_Number;
	ImmediateController.register('number', ImmediateController_Number);
})(window, jQuery || apex.jQuery);