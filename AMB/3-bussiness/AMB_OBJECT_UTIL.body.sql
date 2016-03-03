create or replace package body AMB_OBJECT_UTIL
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
	return '' ||
	'select ''Table'' as d ,	''TABLE'' as r from dual '    ||
	' union '||
	'select ''View'' as d ,	''VIEW'' as r from dual '         ||
	' union '||
	'select ''Index'' as d ,	''INDEX'' as r from dual '    ||
	' union '||
	'select ''Sequence'' as d ,	''SEQUENCE'' as r from dual ' ||
	' union '||
	'select ''Type'' as d ,	''TYPE'' as r from dual '          ||
	' union '||
	'select ''Package'' as d ,	''PACKAGE'' as r from dual '    ||
	' union '||
	'select ''Procedure'' as d ,	''PROCEDURE'' as r from dual ' ||
	' union '||
	'select ''Function'' as d ,	''FUNCTION'' as r from dual '    ||
	' union '||
	'select ''Trigger'' as d ,	''TRIGGER'' as r from dual '    ||
	' union '||
	'select ''Database Link'' as d ,	''DATABASE LINK'' as r from dual '    ||
	' union '||
	'select ''Materialized View'' as d ,	''MATERIALIZED VIEW'' as r from dual '    ||
	' union '||
	'select ''Synonym'' as d ,	''SYNONYM'' as r from dual '
	;
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

procedure new_object(p_record AMB_OBJECT%ROWTYPE)
as
v_obj_id varchar2(500);
begin
	v_obj_id:=generate_guid;
	INSERT INTO AMB_OBJECT(ID,VERSION_ID,NAME,TYPE)
	VALUES(v_obj_id,p_record.VERSION_ID,p_record.NAME,p_record.TYPE);
	
	EXCEPTION WHEN OTHERS THEN
		AMB_LOGGER.ERROR('New Object Error.');
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
end AMB_OBJECT_UTIL;
