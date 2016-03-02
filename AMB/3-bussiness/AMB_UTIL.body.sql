create or replace package body AMB_UTIL
as

function generate_guid return varchar2
as

begin
	return SYS_GUID();
end generate_guid;



procedure print_clob(p_clob CLOB)
  AS  
    v_clob_length number:=1000;  
    v_offset number:=1;  
  BEGIN  
     
    WHILE v_offset < v_clob_length  
    LOOP  
      htp.p(DBMS_LOB.SUBSTR(p_clob,32767,v_offset));  
      v_offset:=v_offset+32767;  
    END LOOP;  
  END;  

end AMB_UTIL;