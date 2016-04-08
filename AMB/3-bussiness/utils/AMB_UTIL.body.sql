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
      v_temp:=DBMS_LOB.SUBSTR(p_clob,4000,v_offset);
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