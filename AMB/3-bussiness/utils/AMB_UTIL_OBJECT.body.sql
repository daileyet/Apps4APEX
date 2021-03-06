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
