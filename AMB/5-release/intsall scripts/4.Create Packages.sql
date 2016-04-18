/*AMB_CONSTANT*/
create or replace package AMB_CONSTANT
/**
 * Applications Manager constant defintions
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2016/02/25
 */
as
/**
 * project, version , object key prefix
 */
PREFIX_PROJECT constant varchar(3):='P-';
PREFIX_VERSION constant varchar(3):='V-';
PREFIX_OBJECT constant varchar(3):='O-';

SHORT_PROJECT constant varchar(3):='P';
SHORT_VERSION constant varchar(3):='V';
SHORT_OBJECT constant varchar(3):='O';

COMPILE_WITHOUT_ERROR constant varchar2(10):='SUCCESS';
COMPILE_WITH_ERROR constant varchar2(10):='FAILED';

YES_TRUE constant varchar2(3):='Y';
NO_FALSE constant varchar2(3):='N';
-- point those objects already exist in APEX schema, named build in version
BUILD_IN_VERSION constant varchar2(50):='BUILD_IN_SCHEMA';

IS_BASE_VERSION constant varchar2(3):=YES_TRUE;
NOT_BASE_VERSION constant varchar2(3):=NO_FALSE;

IS_ACTIVE_VERSION constant varchar2(3):=YES_TRUE;
NOT_ACTIVE_VERSION constant varchar2(3):=NO_FALSE;

FULL_CP_INIT_MODE constant varchar2(10):='FULL_COPY';
QUICK_REF_INIT_MODE constant varchar2(10):='QUICK_REF';

OPS_STYLE_SHARED constant varchar2(10):='SHARED';
OPS_STYLE_PRIVATE constant varchar2(10):='PRIVATE';

OPS_CODE_IN_BUILD_ALL constant varchar2(50):='IN_BUILD_ALL_LIST';
OPS_CODE_IN_EXPORT constant varchar2(50):='IN_EXPORT_LIST';
OPS_BUILD_WITHOUT_COMMENTS constant varchar2(50):='BUILD_WITHOUT_COMMENTS';

BUILD_ALL_MODEL constant varchar2(10):='BUILD';
EXPORT_MODEL constant varchar2(10):='EXPORT';
IMPORT_MODEL constant varchar2(10):='IMPORT';
LOAD_MODEL constant varchar2(10):='LOAD';
NORMAL_MODEL constant varchar2(10):='NORMAL';

EXPORT_XML_STYLE constant varchar2(10):='XML';
EXPORT_DDL_STYLE constant varchar2(10):='DDL';

ACTION_NEW constant varchar2(10):='NEW';
ACTION_REPLACE constant varchar2(10):='REPLACE';
ACTION_MANUAL constant varchar2(10):='MANUAL';
ACTION_UPDATE constant varchar2(10):='UPDATE';
ACTION_INSERT constant varchar2(10):='INSERT';
end AMB_CONSTANT;
/
/*AMB_TYPES*/
create or replace package AMB_TYPES
as
TYPE OBJECT_ERRORS is table of USER_ERRORS%ROWTYPE;
TYPE PROJECT_OPTIONS is table of AMB_OPS_PROJECT%ROWTYPE;
TYPE VERSION_OPTIONS is table of AMB_OPS_VERSION%ROWTYPE;
TYPE OBJECT_OPTIONS is table of AMB_OPS_OBJECT%ROWTYPE;
end;
/
/*AMB_LOGGER*/
create or replace PACKAGE AMB_LOGGER AS  
--@author: dailey.dai@oracle.com  
--@desc:   app logger  
   L_DEBUG constant integer  := 1;  
   L_INFO constant integer  := 2;  
   L_WARN constant integer  := 3;  
   L_ERROR constant integer  := 4;  
   L_FATAL constant integer  := 5;  
     
   log_level integer := L_DEBUG;--set to info now  
     
   /*  
    log targets, indicator char index in log_targets  
   */  
     
   T_DBMS_OUTPUT constant integer := 1;  
   T_HTP_P constant integer :=2;  
   T_TABLE_ROW constant integer := 3;  
     
   /*  
   default output to dbms_output.putline and db table  
   */  
   log_targets varchar2(3) := 'YNY';  
     
   procedure log(p_log_type in varchar2, p_log_desc in varchar2,p_log_point in varchar2 DEFAULT NULL);  
     
   procedure trace(p_log_type in varchar2, msg in varchar2);  
   procedure debug(msg in varchar2);  
   procedure info(msg in varchar2);  
   procedure warn(msg in varchar2);  
   procedure error(msg in varchar2);  
   procedure fatal(msg in varchar2);  
END AMB_LOGGER;
/
create or replace PACKAGE BODY  AMB_LOGGER AS  
   --private, use bits to store state of log target  
   function is_target_open(p_le in integer) return boolean  
   as  
       bit_op varchar2(1) := '';  
   begin  
     
       select substr(log_targets,p_le,1 ) into bit_op FROM DUAL;  
       bit_op := upper(bit_op);  
       if bit_op = 'Y' or bit_op='1' then  
           return true;  
       end if;  
       return false;  
   end;  
  
   procedure log(p_log_type in varchar2, p_log_desc in varchar2,p_log_point in varchar2 DEFAULT NULL)  
   as  
     
   begin  
        insert into AMB_LOGS(LOG_TYPE,LOG_TIME,LOG_DESC,LOG_POINT)   
        values(  
        p_log_type,  
        CURRENT_TIMESTAMP,  
        p_log_desc,  
        p_log_point  
        );  
   end log;  
     
   procedure trace(p_log_type in varchar2, msg in varchar2)  
   as  
       v_p clob;  
       v_length PLS_INTEGER := length(msg);  
       v_length_per_line PLS_INTEGER := 4000;  
       v_lines PLS_INTEGER := v_length / v_length_per_line;  
         
       v_start PLS_INTEGER := 1;  
   begin  
       if is_target_open(T_DBMS_OUTPUT)  then  
           dbms_output.put_line(to_char(sysdate, 'YYYY-MM-DD HH24:MI:SS ')||'['||p_log_type||'] - '||msg);  
       end if;  
  
       if is_target_open(T_HTP_P)  then  
           htp.p(to_char(sysdate, 'YYYY-MM-DD HH24:MI:SS ')||'['||p_log_type||'] - '||msg);  
       end if;  
  
       if is_target_open(T_TABLE_ROW)  then  
           insert into AMB_LOGS(LOG_TYPE,LOG_TIME,LOG_DESC,LOG_POINT)   
            values(  
            p_log_type,  
            CURRENT_TIMESTAMP,  
            msg,  
            null  
            );  
       end if;  
   end;  
     
   procedure debug(msg in varchar2)   
   as  
   begin  
       if log_level > L_DEBUG then  
           return ;  
       end if;  
       trace('DEBUG', msg);  
   end;  
     
   procedure info(msg in varchar2)   
   as  
   begin  
       if log_level > L_INFO then  
           return ;  
       end if;  
         
       trace('INFO', msg);  
   end;  
     
     
   procedure warn(msg in varchar2)   
   as  
   begin  
       if log_level > L_WARN then  
           return ;  
       end if;  
         
       trace('WARN', msg);  
   end;  
     
   procedure error(msg in varchar2)   
   as  
   begin  
       if log_level > L_ERROR then  
           return ;  
       end if;  
         
       trace('ERROR', msg);  
   end;  
     
   procedure fatal(msg in varchar2)   
   as  
   begin  
       if log_level > L_FATAL then  
           return ;  
       end if;  
         
       trace('FATAL', msg);  
   end;  
     
END AMB_LOGGER;
/
/*AMB_UTIL*/
create or replace package AMB_UTIL
/**
 * Applications Manager common utilities
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2016/02/25
 */
as

/**
 * genarate guid by oracle guid function	
 */
function generate_guid return varchar2;

/**
* print clob content for console(DBMS_OUTPUT.PUT_LINE) or HTP(htp.prn)
*/
procedure print_clob(p_clob CLOB,p_style varchar2 default 'HTP');

/**
 * when start a aemand process by requested by ajax, response header setting.
 */
procedure set_ajax_header(p_response_type varchar2 default 'text/json');

procedure download_file(p_mine varchar2,p_file_clob CLOB,p_filename varchar2);

function clobfromblob(p_blob blob) return clob;

end AMB_UTIL;
/
create or replace package body AMB_UTIL
as

function generate_guid return varchar2
as
begin
	return SYS_GUID();
end generate_guid;

procedure print_clob(p_clob CLOB,p_style varchar2 default 'HTP')
  AS  
    v_clob_length number:=DBMS_LOB.GETLENGTH(p_clob);  
    v_offset number:=1;  
    v_temp CLOB;
    v_temp_length number;
  BEGIN  
     
   WHILE v_offset < v_clob_length  
    LOOP  
    IF p_style = 'console' then
      DBMS_OUTPUT.PUT_LINE(DBMS_LOB.SUBSTR(p_clob,4000,v_offset));
      v_offset:=v_offset+4000;  
    else
      --print without '\n'
      v_temp:=DBMS_LOB.SUBSTR(p_clob,32767,v_offset);
      v_temp_length:=DBMS_LOB.GETLENGTH(v_temp);  
      htp.prn(v_temp);
      --print with '\n'
      --htp.p() 
      v_offset:=v_offset+v_temp_length;  
    end if;
    
    END LOOP;  
END;

procedure set_ajax_header(p_response_type varchar2 default 'text/json')
as
begin
	owa_util.mime_header(p_response_type, FALSE );
	htp.p('Cache-Control: no-cache');
	htp.p('Pragma: no-cache');
	owa_util.http_header_close;
end;

procedure download_file(p_mine varchar2,p_file_clob CLOB,p_filename varchar2)
as
	v_length INTEGER;
begin
	v_length:=DBMS_LOB.GETLENGTH(p_file_clob); 
	owa_util.mime_header( nvl(p_mine,'application/octet'), FALSE );
	htp.p('Content-length: ' || v_length);
	htp.p('Content-Disposition: attachment; filename="'||p_filename||'"');
	owa_util.http_header_close;
	print_clob(p_file_clob);
end;

function clobfromblob(p_blob blob) return clob is
      l_clob         clob;
      l_dest_offsset integer := 1;
      l_src_offsset  integer := 1;
      l_lang_context integer := dbms_lob.default_lang_ctx;
      l_warning      integer;

   begin

      if p_blob is null then
         return null;
      end if;

      dbms_lob.createTemporary(lob_loc => l_clob
                              ,cache   => false);

      dbms_lob.converttoclob(dest_lob     => l_clob
                            ,src_blob     => p_blob
                            ,amount       => dbms_lob.lobmaxsize
                            ,dest_offset  => l_dest_offsset
                            ,src_offset   => l_src_offsset
                            ,blob_csid    => dbms_lob.default_csid
                            ,lang_context => l_lang_context
                            ,warning      => l_warning);

      return l_clob;

   end;

end AMB_UTIL;
/
/*AMB_UTIL_CODE*/
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
/
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
  
  
  procedure clean_comments(p_code in out CLOB)
  as
  	v_comments_regx varchar2(500):='(\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(--(.*)[\r\n]*)+';
  begin
	p_code:=REGEXP_REPLACE(p_code,v_comments_regx,'',1,0,'m');
  end;
end AMB_UTIL_CODE;
/
/*AMB_UTIL_OPTIONS*/
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
/
create or replace package body AMB_UTIL_OPTIONS
as
	function get_option_base(f_ops_code varchar2) RETURN AMB_OPS_DEFINITION%ROWTYPE
	as
		v_result AMB_OPS_DEFINITION%ROWTYPE;
	begin
		select * into v_result from AMB_OPS_DEFINITION WHERE OPS_CODE = f_ops_code;
		
		RETURN v_result;
	end;
	
	function get_project_options(f_project_id varchar2) return AMB_TYPES.PROJECT_OPTIONS PIPELINED
	as
	begin
		FOR pops in (select 
			f_project_id AS PROJECT_ID,
			aod.OPS_CODE AS OPS_CODE,
			NVL(aop.OPS_VALUE,aod.OPS_DEFAULT) OPS_VALUE,
			aop.OPS_STYLE,
			NVL(aop.OPS_DESC,aod.OPS_DESC) OPS_DESC
			from AMB_OPS_DEFINITION aod
			left join (
			select * from AMB_OPS_PROJECT
			WHERE PROJECT_ID=f_project_id
			) aop
			on aod.OPS_CODE = aop.OPS_CODE
			WHERE INSTR(aod.OPS_TRAGET,AMB_CONSTANT.SHORT_PROJECT)>0
		)
		LOOP
			PIPE ROW(pops);
		END LOOP;
	end;
	
	function get_version_options(f_version_id varchar2) return AMB_TYPES.VERSION_OPTIONS PIPELINED
	as
		v_version_row AMB_VERSION%ROWTYPE;
		v_project_id varchar2(100);
	begin
		IF f_version_id IS NOT NULL THEN
			select * into v_version_row from AMB_VERSION WHERE ID = f_version_id;
		END IF;
		v_project_id:=v_version_row.PROJECT_ID;
		FOR vops in (
			SELECT 
			aov_out.VERSION_ID,
			aov_out.OPS_CODE,
			NVL(aov_out.OPS_VALUE,aop_out.OPS_VALUE) OPS_VALUE,
			aov_out.OPS_STYLE,
			NVL(aov_out.OPS_DESC,aop_out.OPS_DESC) OPS_DESC
			FROM
            (
				select 
					f_version_id AS VERSION_ID,
					aod.OPS_CODE,
					aov.OPS_VALUE,
					aov.OPS_STYLE,
					aov.OPS_DESC from AMB_OPS_DEFINITION aod
				    left join (
					select * from AMB_OPS_VERSION
					WHERE VERSION_ID=f_version_id
				   ) aov
				on aod.OPS_CODE = aov.OPS_CODE
				WHERE INSTR(aod.OPS_TRAGET,AMB_CONSTANT.SHORT_VERSION)>0
			) aov_out
			LEFT JOIN TABLE(get_project_options(v_project_id)) aop_out
			ON aov_out.OPS_CODE = aop_out.OPS_CODE
		)
		LOOP
			PIPE ROW(vops);
		END LOOP;
	end;
	
	function get_object_options(f_object_id varchar2) return AMB_TYPES.OBJECT_OPTIONS PIPELINED
	as
		v_version_id varchar2(100);
		v_object_row AMB_OBJECT%ROWTYPE;
	begin
		IF f_object_id IS NOT NULL THEN
			select * into v_object_row from AMB_OBJECT WHERE ID = f_object_id;
		END IF;
		v_version_id:=v_object_row.VERSION_ID;
		FOR oops IN (
			SELECT
				aoo_out.OBJECT_ID,
				aoo_out.OPS_CODE,
				NVL(aoo_out.OPS_VALUE,aov_out.OPS_VALUE) OPS_VALUE,
				aoo_out.OPS_STYLE,
				NVL(aoo_out.OPS_DESC,aov_out.OPS_DESC) OPS_DESC
			FROM
			(
				select 
					f_object_id AS OBJECT_ID,
					aod.OPS_CODE,
					aoo.OPS_VALUE,
					aoo.OPS_STYLE,
					aoo.OPS_DESC
				from AMB_OPS_DEFINITION aod
				left join (
					select * from AMB_OPS_OBJECT
					WHERE OBJECT_ID=f_object_id
				) aoo
				on aod.OPS_CODE = aoo.OPS_CODE
				WHERE INSTR(aod.OPS_TRAGET,AMB_CONSTANT.SHORT_OBJECT)>0
			) aoo_out
			LEFT JOIN TABLE(get_version_options(v_version_id)) aov_out
			ON aoo_out.OPS_CODE = aov_out.OPS_CODE
		)
		LOOP
			PIPE ROW(oops);
		END LOOP;
		
	end;
	
	procedure save_version_option(p_record AMB_OPS_VERSION%ROWTYPE,p_error in out AMB_ERROR)
	as
		v_count number:=0;
	begin
		SELECT COUNT(*) into v_count FROM AMB_OPS_VERSION WHERE OPS_CODE = p_record.OPS_CODE and VERSION_ID=p_record.VERSION_ID;
		IF v_count = 0  THEN
			INSERT INTO AMB_OPS_VERSION values(p_record.VERSION_ID,p_record.OPS_CODE,p_record.OPS_VALUE,p_record.OPS_STYLE,p_record.OPS_DESC);
		ELSE
			UPDATE AMB_OPS_VERSION
			SET OPS_VALUE = p_record.OPS_VALUE,
			OPS_STYLE = p_record.OPS_STYLE,
			OPS_DESC = p_record.OPS_DESC
			WHERE VERSION_ID =p_record.VERSION_ID  and  OPS_CODE=p_record.OPS_CODE;
		END IF;
	EXCEPTION WHEN OTHERS THEN
		p_error.error_message := 'Save Version Options Error:' || SQLERRM;
		AMB_LOGGER.ERROR(p_error.error_message);
	end;
	
	procedure save_object_option(p_record AMB_OPS_OBJECT%ROWTYPE,p_error in out AMB_ERROR)
	AS
		v_count number:=0;
	BEGIN
		SELECT COUNT(*) into v_count FROM AMB_OPS_OBJECT WHERE OPS_CODE = p_record.OPS_CODE and OBJECT_ID=p_record.OBJECT_ID;
		IF v_count = 0  THEN
			INSERT INTO AMB_OPS_OBJECT values(p_record.OBJECT_ID,p_record.OPS_CODE,p_record.OPS_VALUE,p_record.OPS_STYLE,p_record.OPS_DESC);
		ELSE
			UPDATE AMB_OPS_OBJECT
			SET OPS_VALUE = p_record.OPS_VALUE,
			OPS_STYLE = p_record.OPS_STYLE,
			OPS_DESC = p_record.OPS_DESC
			WHERE OBJECT_ID =p_record.OBJECT_ID  and  OPS_CODE=p_record.OPS_CODE;
		END IF;
	EXCEPTION WHEN OTHERS THEN
		p_error.error_message := 'Save Object Options Error:' || SQLERRM;
		AMB_LOGGER.ERROR(p_error.error_message);
	END;
end AMB_UTIL_OPTIONS;
/
/*AMB_UTIL_PROJECT*/
create or replace package AMB_UTIL_PROJECT
as
/**
 * genarate project guid as key	
 */
function generate_guid return varchar2;
end AMB_UTIL_PROJECT;
/
create or replace package body AMB_UTIL_PROJECT
as
/**
 * genarate project guid as key	
 */
function generate_guid return varchar2
as
begin
	return AMB_CONSTANT.PREFIX_PROJECT||AMB_UTIL.generate_guid;
end;
end AMB_UTIL_PROJECT;
/
/*AMB_UTIL_VERSION*/
create or replace package AMB_UTIL_VERSION
/**
 * Applications Manager project version utilities
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2016/02/25
 */
as
/**
 * genarate project version guid as key	
 */
function generate_guid return varchar2;
/**
 * generate the LOV query sql for project version environment
 */
function list_enviroment_query return varchar2;
/**
 * check the given version is the base version or not
 */
function is_base(f_version_id varchar2) return boolean;

function list_initialize_mode_query return varchar2;

function list_base_version_query(f_project_id varchar2) return varchar2;
end AMB_UTIL_VERSION;
/
create or replace package body AMB_UTIL_VERSION
as
/**
 * genarate project version guid as key	
 */
function generate_guid return varchar2
as
begin
	return AMB_CONSTANT.PREFIX_VERSION||AMB_UTIL.generate_guid;
end;

function list_enviroment_query return varchar2
as
begin
	return '' ||
	'select ''Dev'' as d ,	''DEV'' as r from dual '||
	' union '||
	'select ''Prod'' as d ,	''PROD'' as r from dual '
	||
	' union '||
	'select ''Test'' as d ,	''TEST'' as r from dual '
	;
end;

function is_base(f_version_id varchar2) return boolean
as
	v_cnt NUMBER:=0;
begin
	SELECT COUNT(*) INTO v_cnt from AMB_VERSION 
	WHERE ID=f_version_id AND IS_BASE = AMB_CONSTANT.IS_BASE_VERSION
	;
	RETURN v_cnt>0;
end;

function list_initialize_mode_query return varchar2
as
begin
	return 'select ''Quick Reference'' as dis, '''||AMB_CONSTANT.QUICK_REF_INIT_MODE ||''' as val from dual '
	||' union '
	|| 'select ''Full Copy'' as dis, '''||AMB_CONSTANT.FULL_CP_INIT_MODE||''' as val from dual '
	
	;
end;

function list_base_version_query(f_project_id varchar2) return varchar2
as
begin
   return 'SELECT ENVIRONMENT ||'' ''||EDITION as dis,ID as val from AMB_VERSION where PROJECT_ID='''||f_project_id||''' AND IS_BASE='''||AMB_CONSTANT.IS_BASE_VERSION||''' AND ACTIVE ='''||AMB_CONSTANT.IS_ACTIVE_VERSION ||''' ';
end;

end AMB_UTIL_VERSION;
/
/*AMB_UTIL_OBJECT*/
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

function check_validate(f_object_id varchar2,f_version_id varchar2 default NULL) return VARCHAR2;
/**
 * fetch the object compile error detail message
 */
function get_compile_error(f_object_id varchar2) return AMB_TYPES.OBJECT_ERRORS;

function format_compile_error(f_errors AMB_TYPES.OBJECT_ERRORS) return VARCHAR2;

function is_in_build_all_list(f_object_id varchar2) return boolean;
function check_in_build_all_list(f_object_id varchar2) return VARCHAR2;
function is_in_export_list(f_object_id varchar2) return boolean;
function check_in_export_list(f_object_id varchar2) return VARCHAR2;

function is_build_without_comments(f_object_id varchar2) return boolean;

function count_by_type(f_object_type varchar2,f_version_id varchar2) return number;
end AMB_UTIL_OBJECT;
/
create or replace package body AMB_UTIL_OBJECT
as
/**
 * genarate project guid as key	
 */
function generate_guid return varchar2
as
begin
	return AMB_CONSTANT.PREFIX_OBJECT||AMB_UTIL.generate_guid;
end;

function list_object_type_query return varchar2
as
begin
	return 'select display_name, code from AMB_OBJECT_TYPE order by sort_key ASC';
end;

function list_object_subtype_query return varchar2
as
begin
	return '' ||
	'select ''Definition'' as d ,	'' '' as r from dual '    ||
	' union '||
	'select ''Body'' as d ,	''BODY'' as r from dual '
	;
end;

function generate_objects_list_region(f_version_id varchar2) return CLOB
as
v_html CLOB;
begin
	for types in (select TYPE AS OBJ_TYPE,COUNT(*) AS OBJ_NUM FROM AMB_OBJECT WHERE VERSION_ID=f_version_id GROUP BY TYPE ORDER BY TYPE ASC )
	loop
		v_html:=v_html||'<h4>'||types.OBJ_TYPE||'</h4>';
		v_html:=v_html||'<div><ul>';
		for objs in (select * from AMB_OBJECT WHERE VERSION_ID=f_version_id and TYPE = types.OBJ_TYPE ORDER BY NAME ASC)
		loop
			v_html:=v_html||'<li>';
			v_html:=v_html||objs.NAME;
			v_html:=v_html||'</li>';
		end loop;
		v_html:=v_html||'</ul></div>';
	end loop;
	return v_html;
end;


function is_validate(f_object_id varchar2,f_version_id varchar2 default NULL) return boolean
as
	v_validate boolean:=FALSE;
begin
	for objs in ( select VERSION_ID from AMB_OBJECT where ID=f_object_id)
	loop
		IF f_version_id IS NULL OR objs.VERSION_ID = f_version_id THEN
			v_validate:=TRUE;
		END IF;
		EXIT;
	end loop;
	return v_validate;
end;

function check_validate(f_object_id varchar2,f_version_id varchar2 default NULL) return VARCHAR2
AS
BEGIN
	IF is_validate(f_object_id,f_version_id) THEN
		RETURN AMB_CONSTANT.YES_TRUE;
	END IF;
	RETURN NULL;
END;

function get_compile_error(f_object_id varchar2) return AMB_TYPES.OBJECT_ERRORS
as
	v_object AMB_OBJECT%ROWTYPE;
	v_obj_errors AMB_TYPES.OBJECT_ERRORS:=AMB_TYPES.OBJECT_ERRORS();
    v_row USER_ERRORS%ROWTYPE;
    --v_index number:=1;
begin
	select * into v_object from AMB_OBJECT WHERE ID=f_object_id;
    
    FOR errs in (SELECT * FROM USER_ERRORS e WHERE e.NAME=v_object.NAME AND e.TYPE = v_object.TYPE ORDER BY e.SEQUENCE ASC)
    LOOP
       select errs.NAME,errs.TYPE,errs.SEQUENCE,errs.LINE,errs.POSITION,errs.TEXT,errs.ATTRIBUTE,errs.MESSAGE_NUMBER into v_row from dual;
       v_obj_errors.EXTEND(1);
	   v_obj_errors(v_obj_errors.COUNT):=v_row;
       --v_index:=v_index+1;
    END LOOP;
	RETURN v_obj_errors;
	EXCEPTION WHEN OTHERS THEN
		AMB_LOGGER.ERROR('GET_COMPILE_ERROR:'||SQLERRM);
		RETURN v_obj_errors;
end;

function format_compile_error(f_errors AMB_TYPES.OBJECT_ERRORS) return VARCHAR2
AS
	--v_output VARCHAR2(4000):='<li class="htmldbStdErr">No compilation error.</li>';
	v_output VARCHAR2(4000);
	v_row USER_ERRORS%ROWTYPE;
begin
	for i in 1..f_errors.COUNT
	loop
		v_row:=f_errors(i);
		v_output:=v_output||'<li class="htmldbStdErr">Compilation failed,line <a class="compile-error-line">' || v_row.LINE ||'</a> '||apex_escape.html(v_row.TEXT)||'</li>';
	end loop;
	IF v_output IS NULL THEN
		v_output := '<li class="htmldbStdErr">No compilation error found. Please compile again.</li>';
	END IF;
	RETURN v_output;
end;

function is_in_build_all_list(f_object_id varchar2) return boolean
AS
	v_ops_val varchar2(500):='true';
begin
	select OPS_VALUE INTO v_ops_val from TABLE(AMB_UTIL_OPTIONS.get_object_options(f_object_id))
	WHERE OPS_CODE = AMB_CONSTANT.OPS_CODE_IN_BUILD_ALL;
	
	IF UPPER(v_ops_val) = 'FALSE' THEN
		return FALSE;
	END IF;
	RETURN TRUE;
	EXCEPTION WHEN OTHERS THEN
		RETURN TRUE;
end;

function check_in_build_all_list(f_object_id varchar2) return VARCHAR2
AS
BEGIN
	IF IS_IN_BUILD_ALL_LIST(f_object_id) THEN
		return AMB_CONSTANT.YES_TRUE;
	END IF;
	RETURN NULL;
END;

function is_in_export_list(f_object_id varchar2) return boolean
AS
	v_ops_val varchar2(500):='true';
begin
	select OPS_VALUE INTO v_ops_val from TABLE(AMB_UTIL_OPTIONS.get_object_options(f_object_id))
	WHERE OPS_CODE = AMB_CONSTANT.OPS_CODE_IN_EXPORT;
	
	IF UPPER(v_ops_val) = 'FALSE' THEN
		return FALSE;
	END IF;
	RETURN TRUE;
	EXCEPTION WHEN OTHERS THEN
		RETURN TRUE;
END;

function check_in_export_list(f_object_id varchar2) return VARCHAR2
AS
BEGIN
	IF is_in_export_list(f_object_id) THEN
		return AMB_CONSTANT.YES_TRUE;
	END IF;
	RETURN NULL;
END;

function is_build_without_comments(f_object_id varchar2) return boolean
AS
	v_ops_val varchar2(500):='false';
BEGIN
	select OPS_VALUE INTO v_ops_val from TABLE(AMB_UTIL_OPTIONS.get_object_options(f_object_id))
	WHERE OPS_CODE = AMB_CONSTANT.OPS_BUILD_WITHOUT_COMMENTS;
	
	IF UPPER(v_ops_val) = 'TRUE' THEN
		return TRUE;
	END IF;
	RETURN FALSE;
	EXCEPTION WHEN OTHERS THEN
		RETURN FALSE;
END;

function count_by_type(f_object_type varchar2,f_version_id varchar2) return number
as
	v_count NUMBER;
begin
	select count(*) into v_count from AMB_OBJECT WHERE VERSION_ID=f_version_id AND TYPE=f_object_type;
	RETURN v_count;
end;
end AMB_UTIL_OBJECT;
/
/*AMB_BIZ_OBJECT*/
create or replace package AMB_BIZ_OBJECT
/**
 * Applications Manager object core lib
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2016/03/03
 */
as
/**
 * create a new object entry
 */
procedure new_object(p_record in out AMB_OBJECT%ROWTYPE,p_error in out AMB_ERROR);
/**
 * save a object ctx, mostly just save object content
 */
procedure save_object_ctx(p_record AMB_OBJECT%ROWTYPE,p_error in out AMB_ERROR);
/**
 * get object code content and consider the reference field
 */
function get_object_ctx(f_object_id varchar2) return CLOB;
/**
 * get stored in AMB_OBJECT object record
 */
function get_object(f_object_id varchar2) RETURN AMB_OBJECT%ROWTYPE;
/**
 * compile a object
 */
procedure compile_object(p_record AMB_OBJECT%ROWTYPE,p_error in out AMB_ERROR);
end AMB_BIZ_OBJECT;
/
create or replace package body AMB_BIZ_OBJECT
as
procedure new_object(p_record in out AMB_OBJECT%ROWTYPE,p_error in out AMB_ERROR)
as
v_obj_id varchar2(500);
begin
	v_obj_id:=AMB_UTIL_OBJECT.generate_guid;
	p_record.ID:=v_obj_id;
	INSERT INTO AMB_OBJECT(ID,VERSION_ID,NAME,TYPE,CREATE_DATE,CREATE_BY,DESCRIPTION)
	VALUES(v_obj_id,p_record.VERSION_ID,p_record.NAME,p_record.TYPE,CURRENT_TIMESTAMP,p_record.CREATE_BY,p_record.DESCRIPTION);
	
	EXCEPTION WHEN OTHERS THEN
		p_error.error_message := 'New Object Error:' || SQLERRM;
		AMB_LOGGER.ERROR(p_error.error_message);
end;

procedure save_object_ctx(p_record AMB_OBJECT%ROWTYPE,p_error in out AMB_ERROR)
as
begin
	IF p_record.ID IS NOT NULL THEN
		UPDATE AMB_OBJECT
		SET
		CONTENT= p_record.CONTENT,
		UPDATE_DATE = CURRENT_TIMESTAMP,
		UPDATE_BY = p_record.UPDATE_BY
		WHERE ID=p_record.ID;
	END IF;
	EXCEPTION WHEN OTHERS THEN
		p_error.error_message := 'Save Object Content Error:' || SQLERRM;
		AMB_LOGGER.ERROR(p_error.error_message);
end;

function get_object_ctx(f_object_id varchar2) return CLOB
AS
	v_ctx CLOB:=NULL;
	v_refer_id varchar2(100):=NULL;
BEGIN
	IF f_object_id IS NULL OR NOT AMB_UTIL_OBJECT.is_validate(f_object_id) THEN
		return v_ctx;
	END IF;
	SELECT CONTENT,REFERENCE INTO v_ctx,v_refer_id FROM AMB_OBJECT WHERE ID=f_object_id;
	
	IF v_ctx IS NULL AND v_refer_id IS NOT NULL THEN
		v_ctx:= get_object_ctx(v_refer_id);
	END IF;
	
	return v_ctx;
END;

function get_object(f_object_id varchar2) RETURN AMB_OBJECT%ROWTYPE
as
v_object AMB_OBJECT%ROWTYPE;
begin
	IF f_object_id IS NOT NULL THEN
		select * into v_object from AMB_OBJECT WHERE ID = f_object_id;
	END IF;
	return v_object;
end;

procedure compile_object(p_record AMB_OBJECT%ROWTYPE,p_error in out AMB_ERROR)
as
	v_object_ctx CLOB:=p_record.CONTENT;
	v_obj_errors AMB_TYPES.OBJECT_ERRORS;
begin
	
	BEGIN
		IF v_object_ctx IS NULL THEN
			v_object_ctx:=get_object_ctx(p_record.ID);
		END IF;
		IF v_object_ctx IS NOT NULL THEN
			--check need keep or clean comments after build/compile
			IF AMB_UTIL_OBJECT.is_build_without_comments(p_record.ID) THEN
				AMB_UTIL_CODE.clean_comments(v_object_ctx);
			END IF;
			AMB_UTIL_CODE.execute_ddl(v_object_ctx);
			UPDATE AMB_OBJECT
				SET COMPILED = AMB_CONSTANT.COMPILE_WITHOUT_ERROR
				WHERE ID = p_record.ID;
		END IF;
		EXCEPTION 
			WHEN OTHERS THEN
				p_error.error_message := 'Compile Object Error:' || SQLERRM;
				UPDATE AMB_OBJECT
				SET COMPILED = AMB_CONSTANT.COMPILE_WITH_ERROR
				WHERE ID = p_record.ID;
				AMB_LOGGER.ERROR(p_error.error_message);
				v_obj_errors:=AMB_UTIL_OBJECT.get_compile_error(p_record.ID);
				IF v_obj_errors.COUNT > 0 THEN
					p_error.error_message := AMB_UTIL_OBJECT.format_compile_error(v_obj_errors);
				END IF;
	END;
end;

end;
/
/*AMB_BIZ_PROJECT*/
create or replace package AMB_BIZ_PROJECT
/**
 * Applications Manager project core lib
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2016/04/13
 */
as
--get active version count under given project
function count_active_version(f_project_id varchar2) return number;

function list_compare_version_query(f_project_id varchar2,f_model varchar2 default AMB_CONSTANT.NORMAL_MODEL,f_target_object varchar2 default NULL,f_exclude_version varchar2 default NULL) return VARCHAR2;
end;
/
create or replace package body AMB_BIZ_PROJECT
as
--get active version count under given project
function count_active_version(f_project_id varchar2) return number
AS
v_count number:=0;
begin
	SELECT COUNT(*) INTO v_count FROM AMB_VERSION WHERE PROJECT_ID = f_project_id AND ACTIVE=AMB_CONSTANT.IS_ACTIVE_VERSION;
	RETURN v_count;
end;

function list_compare_version_query(f_project_id varchar2,f_model varchar2 default AMB_CONSTANT.NORMAL_MODEL,f_target_object varchar2 default NULL,f_exclude_version varchar2 default NULL) return VARCHAR2
as
	v_query VARCHAR2(4000);
	v_object AMB_OBJECT%ROWTYPE;
begin
	v_query:='select AMB_VERSION.ENVIRONMENT ||'' ''||AMB_VERSION.EDITION as dis,AMB_VERSION.ID as ret from AMB_VERSION AMB_VERSION '
	||' where AMB_VERSION.PROJECT_ID ='''||f_project_id||'''  AND　AMB_VERSION.ACTIVE= '''||AMB_CONSTANT.IS_ACTIVE_VERSION||''' ';
	
	IF f_exclude_version IS NOT NULL THEN
		v_query:=v_query|| ' AND AMB_VERSION.ID <> '''||f_exclude_version||''' ';
	END IF;
	
	IF f_model = AMB_CONSTANT.NORMAL_MODEL AND f_target_object IS NOT NULL THEN
		v_object:=AMB_BIZ_OBJECT.get_object(f_target_object);
		v_query:=v_query||' AND EXISTS (SELECT * FROM AMB_OBJECT WHERE AMB_VERSION.ID=AMB_OBJECT.VERSION_ID AND NAME='''||v_object.NAME||''' AND TYPE= '''||v_object.TYPE||''' )';
		
		v_query:=v_query|| ' UNION SELECT ''Build in Schema'','''||AMB_CONSTANT.BUILD_IN_VERSION ||''' FROM DUAL '
		|| ' WHERE EXISTS (  select * from user_objects uo WHERE uo.OBJECT_NAME = '''||v_object.NAME||''' AND uo.OBJECT_TYPE = '''||v_object.TYPE||''' )' ;
	END IF;
	
	RETURN v_query;
end;

end;
/
/*AMB_BIZ_VERSION*/
create or replace package AMB_BIZ_VERSION
/**
 * Applications Manager version core lib
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2016/03/14
 */
as
/**
 * initialize new version objects from base version
 */
procedure init_version(p_new_version varchar2,p_base_version varchar2,p_mode varchar2,p_error in out AMB_ERROR);
/**
 * get stored in AMB_VERSION version record
 */
function get_version(f_version_id varchar2) RETURN AMB_VERSION%ROWTYPE;
/**
 * initial object build & export list(AMB_BEI_LIST) records
 */
procedure initial_object_list(p_version_id varchar2,p_error in out AMB_ERROR);

function get_export_content(f_version_id varchar2,f_style varchar2 default AMB_CONSTANT.EXPORT_XML_STYLE) return CLOB;
/**
 * initial object import list(AMB_BEI_LIST) records
 */
procedure store_import_as_list(p_version_id varchar2,p_import_unique_name VARCHAR2,p_error in out AMB_ERROR);

procedure process_import(p_version_id varchar2,p_error in out AMB_ERROR);

procedure process_build_all(p_version_id varchar2,p_error in out AMB_ERROR);

procedure process_load(p_version_id varchar2,p_error in out AMB_ERROR);

end;
/
create or replace package body AMB_BIZ_VERSION
as
procedure init_version(p_new_version varchar2,p_base_version varchar2,p_mode varchar2,p_error in out AMB_ERROR)
as
begin
	DELETE FROM AMB_OBJECT WHERE VERSION_ID = p_new_version;
	
	IF p_mode = AMB_CONSTANT.FULL_CP_INIT_MODE THEN
		INSERT INTO AMB_OBJECT_INTERIM(ID,VERSION_ID,NAME,TYPE,CONTENT,REFERENCE,CREATE_DATE,CREATE_BY,UPDATE_DATE,UPDATE_BY,DESCRIPTION,COMPILED)
		SELECT 
		AMB_UTIL_OBJECT.generate_guid AS ID,
		p_new_version AS VERSION_ID,
		NAME,
		TYPE,
		AMB_BIZ_OBJECT.get_object_ctx(ID) AS CONTENT,		
		NULL AS REFERENCE,
		CURRENT_TIMESTAMP AS CREATE_DATE,
		CREATE_BY,
		NULL AS UPDATE_DATE,
		NULL AS UPDATE_BY,
		DESCRIPTION,
		COMPILED
		FROM AMB_OBJECT
		WHERE VERSION_ID = p_base_version;
		
		INSERT INTO AMB_OBJECT(ID,VERSION_ID,NAME,TYPE,CONTENT,REFERENCE,CREATE_DATE,CREATE_BY,UPDATE_DATE,UPDATE_BY,DESCRIPTION,COMPILED)
		SELECT 
		ID,
		VERSION_ID,
		NAME,
		TYPE,
		CONTENT,		
		NULL AS REFERENCE,
		CREATE_DATE,
		CREATE_BY,
		UPDATE_DATE,
		UPDATE_BY,
		DESCRIPTION,
		COMPILED
		FROM AMB_OBJECT_INTERIM
		WHERE VERSION_ID = p_new_version;
		
		DELETE FROM AMB_OBJECT_INTERIM WHERE VERSION_ID = p_new_version;
		
	ELSIF p_mode = AMB_CONSTANT.QUICK_REF_INIT_MODE THEN
		INSERT INTO AMB_OBJECT(ID,VERSION_ID,NAME,TYPE,CONTENT,REFERENCE,CREATE_DATE,CREATE_BY,UPDATE_DATE,UPDATE_BY,DESCRIPTION,COMPILED)
		SELECT 
		AMB_UTIL_OBJECT.generate_guid AS ID,
		p_new_version AS VERSION_ID,
		NAME,
		TYPE,
		NULL AS CONTENT,		
		ID AS REFERENCE,
		CURRENT_TIMESTAMP AS CREATE_DATE,
		CREATE_BY,
		NULL AS UPDATE_DATE,
		NULL AS UPDATE_BY,
		DESCRIPTION,
		COMPILED
		FROM AMB_OBJECT
		WHERE VERSION_ID = p_base_version;
	
	END IF;
	EXCEPTION WHEN OTHERS THEN
		p_error.error_message := 'Initialize Version Objects Error:' || SQLERRM;
		AMB_LOGGER.ERROR(p_error.error_message);
		
end;

function get_version(f_version_id varchar2) RETURN AMB_VERSION%ROWTYPE
as
	v_version AMB_VERSION%ROWTYPE;
begin
	IF f_version_id IS NOT NULL THEN
		select * into v_version from AMB_VERSION WHERE ID = f_version_id;
	END IF;
	return v_version;
end;

-- build & export
procedure initial_object_list(p_version_id varchar2,p_error in out AMB_ERROR)
AS
BEGIN
	
	DELETE FROM AMB_BEIL_LIST WHERE VERSION_ID=p_version_id;
	
	INSERT INTO AMB_BEIL_LIST(ID,VERSION_ID,TYPE,NAME,NEED_BUILD,NEED_EXPORT)
	SELECT ID,VERSION_ID,TYPE,NAME,
	CASE WHEN AMB_UTIL_OBJECT.check_in_build_all_list(ID) IS NOT NULL THEN
		AMB_CONSTANT.YES_TRUE
	ELSE
		AMB_CONSTANT.NO_FALSE
	END AS NEED_BUILD,
	CASE WHEN AMB_UTIL_OBJECT.check_in_export_list(ID) IS NOT NULL THEN
		AMB_CONSTANT.YES_TRUE
	ELSE
		AMB_CONSTANT.NO_FALSE
	END AS NEED_EXPORT
	FROM AMB_OBJECT ao
	WHERE ao.VERSION_ID=p_version_id
	--AND ao.ID NOT IN (SELECT ID FROM AMB_BUILD_EXPORT_LIST WHERE VERSION_ID=p_version_id) 
	;
	EXCEPTION WHEN OTHERS THEN
		p_error.error_message := 'Initialize Version Object Build & Export List Error:' || SQLERRM;
		AMB_LOGGER.ERROR(p_error.error_message);
END;

function get_export_content(f_version_id varchar2,f_style varchar2 default AMB_CONSTANT.EXPORT_XML_STYLE) return CLOB
as
v_output CLOB;
v_version_row AMB_VERSION%ROWTYPE;
begin
	v_version_row:=get_version(f_version_id);
	IF f_style = AMB_CONSTANT.EXPORT_XML_STYLE THEN
		select dbms_xmlgen.getxml(
		'select NAME,TYPE,CONTENT,CREATE_DATE,CREATE_BY,DESCRIPTION	 from AMB_EXPORT_VW WHERE VERSION_ID= '''||f_version_id||''' ORDER BY SORT_KEY,NAME')  
		into v_output from dual;
	ELSE
		v_output:=			'-----------------------------------------------------'||chr(13)||chr(10);
		v_output:=v_output||'--'||v_version_row.APP_NAME||' '||v_version_row.ENVIRONMENT||' '||v_version_row.EDITION ||'--'||chr(13)||chr(10);
		v_output:=v_output||'--@date:'||TO_CHAR(SYSDATE,'DD-Mon-YYYY hh24:mi:ss')||'--'||chr(13)||chr(10);
		v_output:=v_output||'-----------------------------------------------------'||chr(13)||chr(10);
		FOR objs in (select * from AMB_EXPORT_VW WHERE VERSION_ID=f_version_id ORDER BY SORT_KEY,NAME)
		LOOP
			v_output:=v_output||objs.CONTENT||chr(13)||chr(10) ||' -- End of object '||objs.NAME ||chr(13)||chr(10);
		END LOOP;
	END IF;
	return v_output;
end;


procedure store_import_as_list(p_version_id varchar2,p_import_unique_name VARCHAR2,p_error in out AMB_ERROR)
as
	v_import_record APEX_APPLICATION_TEMP_FILES%ROWTYPE;
	v_content CLOB;
begin
	DELETE FROM AMB_BEIL_LIST WHERE VERSION_ID=p_version_id;
	SELECT * INTO v_import_record FROM APEX_APPLICATION_TEMP_FILES WHERE NAME = p_import_unique_name;
	v_content:= AMB_UTIL.clobfromblob(v_import_record.BLOB_CONTENT);
	
	INSERT INTO AMB_BEIL_LIST(ID,VERSION_ID,NAME,TYPE,CONTENT,CREATE_DATE,CREATE_BY,DESCRIPTION,NEED_IMPORT)
	SELECT 
	AMB_UTIL_OBJECT.generate_guid AS ID,
	p_version_id AS VERSION_ID,
	x.object_name AS NAME,
	x.object_type AS TYPE,
	x.content AS CONTENT,
	TO_TIMESTAMP_TZ(x.create_date) AS CREATE_DATE,
	x.create_by AS CREATE_BY,
	x.description AS DESCRIPTION,
	AMB_CONSTANT.YES_TRUE AS NEED_IMPORT
	FROM XMLTABLE(
		'for $i in /ROWSET/ROW return $i'
		passing XMLTYPE(v_content) columns
		object_name VARCHAR2(30) path 'NAME',
		object_type VARCHAR2(50) path 'TYPE',
		content CLOB path 'CONTENT',
		create_date VARCHAR2(500) path 'CREATE_DATE',
		create_by VARCHAR2(500) path 'CREATE_BY',
		description VARCHAR2(4000) path 'DESCRIPTION'
	) x;
	EXCEPTION WHEN OTHERS THEN
		p_error.error_message := 'Initialize Version Object Import List Error:' || SQLERRM;
		AMB_LOGGER.ERROR(p_error.error_message);
end;


procedure process_import(p_version_id varchar2,p_error in out AMB_ERROR)
as
	v_row_affect number;
	v_failed EXCEPTION;
	v_each_error varchar2(4000);
BEGIN
	
	for imps in (select * from AMB_IMPORT_VW where VERSION_ID=p_version_id AND NEED_IMPORT=AMB_CONSTANT.YES_TRUE)
	loop
		v_row_affect:=0;
		BEGIN
			IF imps.ACTION = AMB_CONSTANT.ACTION_INSERT THEN
				INSERT INTO AMB_OBJECT(ID,VERSION_ID,NAME,TYPE,CONTENT,CREATE_DATE,CREATE_BY,DESCRIPTION)
				VALUES(imps.ID,imps.VERSION_ID,imps.NAME,imps.TYPE,imps.CONTENT,imps.CREATE_DATE,imps.CREATE_BY,imps.DESCRIPTION);
				v_row_affect:=SQL%ROWCOUNT;
			END IF;
			
			IF imps.ACTION = AMB_CONSTANT.ACTION_UPDATE THEN
				UPDATE AMB_OBJECT
				SET CONTENT=imps.CONTENT,
				DESCRIPTION = imps.DESCRIPTION,
				UPDATE_DATE = CURRENT_TIMESTAMP
				WHERE ID= imps.ALREADY_ID;
				v_row_affect:=SQL%ROWCOUNT;
			END IF;
			IF v_row_affect = 0 THEN
				RAISE v_failed;
			END IF;
			UPDATE AMB_BEIL_LIST
			SET IS_SUCCESS = AMB_CONSTANT.YES_TRUE,
			FAILED_MSG=NULL
			WHERE ID = imps.ID;
		EXCEPTION 
		WHEN v_failed THEN
			v_each_error:='The object can not be found.';
			UPDATE AMB_BEIL_LIST
			SET IS_SUCCESS = AMB_CONSTANT.NO_FALSE,
			FAILED_MSG=v_each_error
			WHERE ID = imps.ID;
		WHEN OTHERS THEN
			v_each_error:=SQLERRM;
			UPDATE AMB_BEIL_LIST
			SET IS_SUCCESS = AMB_CONSTANT.NO_FALSE,
			FAILED_MSG=v_each_error
			WHERE ID = imps.ID;
		END;
	end loop;
	EXCEPTION WHEN OTHERS THEN
		p_error.error_message := 'Process Version Object Import List Error:' || SQLERRM;
		AMB_LOGGER.ERROR(p_error.error_message);
END;


procedure process_build_all(p_version_id varchar2,p_error in out AMB_ERROR)
AS
	v_obj_error AMB_ERROR;
	v_record AMB_OBJECT%ROWTYPE;
	v_failed EXCEPTION;
BEGIN
	for buds in (
		select * from AMB_BUILD_VW where VERSION_ID=p_version_id and NEED_BUILD=AMB_CONSTANT.YES_TRUE AND ACTION <> AMB_CONSTANT.ACTION_MANUAL
		order by SORT_KEY
	)
	loop
		BEGIN
			v_obj_error:=AMB_ERROR.EMPTY_ERROR;
			v_record.ID:= buds.ID;
			v_record.CONTENT:=buds.CONTENT;
			AMB_BIZ_OBJECT.compile_object(v_record,v_obj_error);
			IF NOT v_obj_error.IS_EMPTY THEN
				RAISE v_failed;
			END IF;
			UPDATE AMB_BEIL_LIST
			SET IS_SUCCESS = AMB_CONSTANT.YES_TRUE,
			FAILED_MSG=NULL
			WHERE ID = buds.ID;
		EXCEPTION WHEN OTHERS THEN
			UPDATE AMB_BEIL_LIST
			SET IS_SUCCESS = AMB_CONSTANT.NO_FALSE,
			FAILED_MSG=v_obj_error.error_message
			WHERE ID = buds.ID;
		END;
	end loop;
	EXCEPTION WHEN OTHERS THEN
		p_error.error_message := 'Process Version Object Build List Error:' || SQLERRM;
		AMB_LOGGER.ERROR(p_error.error_message);
END;

procedure process_load(p_version_id varchar2,p_error in out AMB_ERROR)
as
	v_row_affect number;
	v_failed EXCEPTION;
	v_each_error varchar2(4000);
	v_code clob;
begin
	for lods in (
		select * from AMB_LOAD_VW where VERSION_ID=p_version_id order by SORT_KEY
	)
	LOOP
		v_row_affect:=0;
		BEGIN
			IF lods.CONTENT IS NULL THEN
				v_code:= AMB_UTIL_CODE.get_ddl(lods.TYPE,lods.NAME);
				AMB_UTIL_CODE.make_pure_ddl(v_code);
			END IF;
			IF lods.ACTION = AMB_CONSTANT.ACTION_INSERT THEN
				INSERT INTO AMB_OBJECT(ID,VERSION_ID,NAME,TYPE,CONTENT,CREATE_DATE,CREATE_BY,DESCRIPTION)
				VALUES(lods.ID,lods.VERSION_ID,lods.NAME,lods.TYPE,v_code,lods.CREATE_DATE,lods.CREATE_BY,lods.DESCRIPTION);
				v_row_affect:=SQL%ROWCOUNT;
			END IF;
			IF lods.ACTION = AMB_CONSTANT.ACTION_UPDATE THEN
				UPDATE AMB_OBJECT
				SET CONTENT=v_code,
				DESCRIPTION = NVL(DESCRIPTION,lods.DESCRIPTION),
				UPDATE_DATE = CURRENT_TIMESTAMP
				WHERE NAME= lods.NAME
				AND TYPE = lods.TYPE
				AND VERSION_ID = lods.VERSION_ID
				;
				v_row_affect:=SQL%ROWCOUNT;
			END IF;
			IF v_row_affect = 0 THEN
				RAISE v_failed;
			END IF;
			UPDATE AMB_BEIL_LIST
			SET IS_SUCCESS = AMB_CONSTANT.YES_TRUE,
			FAILED_MSG=NULL
			WHERE ID = lods.ID;
		EXCEPTION 
		WHEN v_failed THEN
			v_each_error:='The object can not be found.';
			UPDATE AMB_BEIL_LIST
			SET IS_SUCCESS = AMB_CONSTANT.NO_FALSE,
			FAILED_MSG=v_each_error
			WHERE ID = lods.ID;
		WHEN OTHERS THEN
			v_each_error:=SQLERRM;
			UPDATE AMB_BEIL_LIST
			SET IS_SUCCESS = AMB_CONSTANT.NO_FALSE,
			FAILED_MSG=v_each_error
			WHERE ID = lods.ID;
		END;
	END LOOP;
	EXCEPTION WHEN OTHERS THEN
		p_error.error_message := 'Process Version Object Load List Error:' || SQLERRM;
		AMB_LOGGER.ERROR(p_error.error_message);
end;
--/////////////////////////////////////
end;
/

