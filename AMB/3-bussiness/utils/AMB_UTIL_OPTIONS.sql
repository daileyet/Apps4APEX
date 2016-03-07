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
	function get_option_base(f_ops_name varchar2) RETURN AMB_OPS_DEFINITION;
	
end AMB_UTIL_OPTIONS;