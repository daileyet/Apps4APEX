create or replace package body AMB_UTIL_CODE
as

  procedure execute_ddl(p_ddl_sql clob)
  as    
  begin  
      EXECUTE IMMEDIATE p_ddl_sql;  
        
      EXCEPTION WHEN OTHERS THEN  
        RAISE;  
  end execute_ddl;  
  
  function is_object_exists(p_obj_name in varchar2) return boolean
  as  
      v_row_count number;  
  begin  
      SELECT count(1) into v_row_count FROM ALL_OBJECTS where OBJECT_NAME = p_obj_name;  
      return v_row_count>0;  
  end is_object_exists;  
  
end AMB_UTIL_CODE;