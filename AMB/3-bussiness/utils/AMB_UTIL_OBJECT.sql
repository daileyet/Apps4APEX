create or replace package AMB_UTIL_OBJECT
/**
 * Applications Manager object utilities
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2016/03/01
 */
as

/**
 * genarate project guid as key	
 */
function generate_guid return varchar2;


/**
 * generate the LOV query sql for project object type
 */
function list_object_type_query return varchar2;

/**
 * generate the LOV query sql for project object subtype
 */
function list_object_subtype_query return varchar2;

/**
 * generate the left region content with object list
 */
function generate_objects_list_region(f_version_id varchar2) return CLOB;

/**
 * check the parameter object id is exist and if the parameter version id is given, check the object is include in the givn version
 */
function is_validate(f_object_id varchar2,f_version_id varchar2 default NULL) return boolean;

end AMB_UTIL_OBJECT;