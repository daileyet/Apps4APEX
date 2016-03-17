create or replace package AMB_UTIL_OPTIONS
/**
 * Applications Manager base option utils
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2016/03/07
 */
as
	/**
	 * get option defintion record by name
	 */
	function get_option_base(f_ops_code varchar2) RETURN AMB_OPS_DEFINITION%ROWTYPE;
	
	function get_project_options(f_project_id varchar2) return AMB_TYPES.PROJECT_OPTIONS PIPELINED;
	
	function get_version_options(f_version_id varchar2) return AMB_TYPES.VERSION_OPTIONS PIPELINED;
	
	function get_object_options(f_object_id varchar2) return AMB_TYPES.OBJECT_OPTIONS PIPELINED;
	
	procedure save_version_option(p_record AMB_OPS_VERSION%ROWTYPE,p_error in out AMB_ERROR);
	
	procedure save_object_option(p_record AMB_OPS_OBJECT%ROWTYPE,p_error in out AMB_ERROR);
	
end AMB_UTIL_OPTIONS;