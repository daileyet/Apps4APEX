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
  
  
  procedure drop_object(p_obj_name in varchar2,p_obj_type in varchar2 default NULL)
  as
  	v_exist boolean:=FALSE;
  	v_ddl_sql varchar2(500);
  begin
	  v_exist:=is_object_exists(p_obj_name);
	  IF v_exist THEN
	  	FOR objs in (select * from ALL_OBJECTS where OBJECT_NAME = p_obj_name and (p_obj_type IS NULL OR OBJECT_TYPE=p_obj_type))
	  	LOOP
	  		v_ddl_sql:='DROP '|| objs.OBJECT_TYPE || ' '||objs.OBJECT_NAME;
	  		execute_ddl(v_ddl_sql);
	  		EXIT;
	  	END LOOP;
	  END IF;
  end;
  
  function get_ddl(f_object_type varchar2,f_object_name varchar2) return CLOB
  as
  begin
	return DBMS_METADATA.GET_DDL(f_object_type,f_object_name);
  end;
  
end AMB_UTIL_CODE;