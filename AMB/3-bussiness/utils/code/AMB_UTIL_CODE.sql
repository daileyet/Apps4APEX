create or replace package AMB_UTIL_CODE
/**
 * Applications Manager code execute utilities
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2016/03/07
 */
as

  -- execute ddl pl/sql, like create procedure/function/table  
  procedure execute_ddl(p_ddl_sql clob);
  
  -- check object is exits by given object name  
  function is_object_exists(p_obj_name in varchar2) return boolean;  
  
  procedure drop_object(p_obj_name in varchar2,p_obj_type in varchar2 default NULL);
  
  function get_ddl(f_object_type varchar2,f_object_name varchar2) return CLOB;
  
  /**
   * remove schema and table space name from load local object ddl
   */
  procedure make_pure_ddl(p_ddl in out CLOB,p_schema in varchar2 default NULL,p_tablespace in varchar2 default 'APEX_(\d)+');
  
  -- remove all comments from code
  procedure clean_comments(p_code in out CLOB);

end AMB_UTIL_CODE;