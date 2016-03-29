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
  	v_whole_ddl CLOB;
  	v_regex constant varchar2(500):='CREATE(.*)(PACKAGE|TYPE)\s+BODY\s+(.*)('||f_object_name||'|"'||f_object_name||'")';
  	function get_definition_ddl(f_whole_ddl CLOB) return CLOB
  	as
  		v_index number;
  	begin
	  	v_index:= REGEXP_INSTR(f_whole_ddl,v_regex,1,1,0,'im');
	  	IF v_index =0 THEN
	  		return SUBSTR(f_whole_ddl,1);
	  	ELSE
	  		return SUBSTR(f_whole_ddl,1,v_index-1);
	  	END IF;
	end;
	function get_body_ddl(f_whole_ddl CLOB) return CLOB
	as
		v_index number;
	begin
		v_index:= REGEXP_INSTR(f_whole_ddl,v_regex,1,1,0,'im');
		IF v_index = 0 THEN
			RETURN NULL;
		ELSE
	  		return SUBSTR(f_whole_ddl,v_index);
	  	END IF;
	end;
	
  begin
	v_whole_ddl:= DBMS_METADATA.GET_DDL(replace(UPPER(f_object_type),' BODY',''),f_object_name);
	
	IF UPPER(f_object_type) IN ('TYPE','PACKAGE') THEN
		return get_definition_ddl(v_whole_ddl);
	END IF;
	
	IF UPPER(f_object_type) IN ('TYPE BODY','PACKAGE BODY') THEN
		return get_body_ddl(v_whole_ddl);
	END IF;
	
	return v_whole_ddl;
	EXCEPTION WHEN OTHERS THEN
		return  'Get This Object DDL Error:' || SQLERRM;
  end;
  
  procedure make_pure_ddl(p_ddl in out CLOB,p_schema in varchar2 default null,p_tablespace in varchar2 default 'APEX_(\d)+')
  as
  	v_schema constant varchar2(500):=NVL(p_schema,sys_context('USERENV', 'CURRENT_SCHEMA'));
  	v_regex_schema constant varchar2(500):='('||v_schema||'\.)|("'||v_schema||'"\.)';
  	v_regex_tablesapce constant varchar2(500):='TABLESPACE "'||p_tablespace||'"';
  begin
		p_ddl:=REGEXP_REPLACE(p_ddl,v_regex_schema,'',1,0,'im');
		p_ddl:=REGEXP_REPLACE(p_ddl,v_regex_tablesapce,'',1,0,'im');
  end;
  
end AMB_UTIL_CODE;