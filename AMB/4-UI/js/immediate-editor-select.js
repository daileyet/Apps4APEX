// define sub controller class select 
(function(win, $){
var ImmediateController_Select = Class.extend(classes['ImmediateController'], {
	render : function() {
		var oldVal = this.getOldVal();
		var controlHtml = '<select class="immediate-controller">'
				+ (function(options) {
					var str_options = "";
					var j, k;
					for (j = 0, k = options.length; j < k; j++) {
						var option = options[j];
						var str_display = option.display == "" ? option.value
								: option.display;
						var str_option = "<option value='" + option.value
								+ "'>" + str_display + "</option>";
						if (oldVal['value'] == option.value
								|| oldVal['display'] == option.display) {
							str_option = "<option value='" + option.value
									+ "' selected >" + str_display
									+ "</option>";
						}
						str_options = str_options + str_option;
					}
					return str_options;
				})(this._element.data || []) + '</select>';
		return controlHtml;
	},
	type : "ImmediateController_Select.ImmediateController.Class",
	events : function() {
		var _this = this;
		return {
			focusout : _this.actionHander
		};
	},
	getNewVal : function() {
		var $CELL = this._$cell;
		var $controller = $CELL.find('.immediate-controller');
		var newValue = $controller.val();
		var newDisplay = $controller[0].selectedOptions[0].text;
		return {
			display : newDisplay,
			value : newValue
		};
	}
});
classes['ImmediateController_Select'] = ImmediateController_Select;
classes['ImmediateController'].register('select', ImmediateController_Select);
})(window, jQuery || apex.jQuery);