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
