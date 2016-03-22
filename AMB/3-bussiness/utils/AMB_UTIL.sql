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


procedure print_clob(p_clob CLOB,p_style varchar2 default 'HTP');

/**
 * when start a aemand process by requested by ajax, response header setting.
 */
procedure set_ajax_header(p_response_type varchar2 default 'text/json');

procedure download_file(p_mine varchar2,p_file_clob CLOB,p_filename varchar2);

end AMB_UTIL;
