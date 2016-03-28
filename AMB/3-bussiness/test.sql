CREATE OR REPLACE EDITIONABLE PACKAGE "HCMCA_TEST"."AMB_UTIL_CODE" 
/** * Applications Manager code execute utilities * @author:dailey.dai@oracle.com * @since: 1.0 * @date: 2016/03/07 */ 
as 
-- execute ddl pl/sql, like create procedure/function/table procedure execute_ddl(p_ddl_sql clob); 
-- check object is exits by given object name 
function is_object_exists(p_obj_name in varchar2) return boolean; 
procedure drop_object(p_obj_name in varchar2,p_obj_type in varchar2 default NULL); 
end AMB_UTIL_CODE; 

CREATE OR REPLACE EDITIONABLE PACKAGE BODY "HCMCA_TEST"."AMB_UTIL_CODE" as 

procedure execute_ddl(p_ddl_sql clob) as 
begin EXECUTE IMMEDIATE p_ddl_sql; 
EXCEPTION WHEN OTHERS THEN RAISE; 
end execute_ddl; 

function is_object_exists(p_obj_name in varchar2) return boolean 
as v_row_count number; 
begin 
	SELECT count(1) into v_row_count FROM ALL_OBJECTS where OBJECT_NAME = p_obj_name; 
	return v_row_count>0; 
end is_object_exists; 
	
procedure drop_object(p_obj_name in varchar2,p_obj_type in varchar2 default NULL) 
as v_exist boolean:=FALSE; 
v_ddl_sql varchar2(500); 
begin v_exist:=is_object_exists(p_obj_name); IF v_exist THEN FOR objs in (select * from ALL_OBJECTS where OBJECT_NAME = p_obj_name and (p_obj_type IS NULL OR OBJECT_TYPE=p_obj_type)) LOOP v_ddl_sql:='DROP '|| objs.OBJECT_TYPE || ' '||objs.OBJECT_NAME; execute_ddl(v_ddl_sql); EXIT; END LOOP; END IF; end; end AMB_UTIL_CODE; 