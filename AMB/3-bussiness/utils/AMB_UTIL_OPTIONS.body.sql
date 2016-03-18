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
		v_version_row:=AMB_BIZ_VERSION.get_version(f_version_id);
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
		v_object_row:=AMB_BIZ_OBJECT.get_object(f_object_id);
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