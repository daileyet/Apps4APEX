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



end;