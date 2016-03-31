// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";
/**
 * conf:{begin:'fold open keyword regexp', end:'fold close regexp'}
 */
function plsql_fold(cm, start,conf){

	var line = start.line, lineText = cm.getLine(line);
	  var startCh, tokenType;
		
	  function findOpening(openCh) {
		  
		  var  found = lineText.search(openCh);
		  if(found==-1){
			  return;
		  }
		  tokenType = cm.getTokenTypeAt(CodeMirror.Pos(line, found + 1));
	      if (!/^(comment|string)/.test(tokenType)) return found + 1;
	   
	  }
	  var startToken = conf.begin, endToken = conf.end, startCh = findOpening(startToken);
	 
	 
	  if (startCh == null) return;
	  var count = 1, lastLine = cm.lastLine(), end, endCh;
	  outer: for (var i = line; i <= lastLine; ++i) {
	    var text = cm.getLine(i), pos = i == line ? startCh : 0;
	    for (;;) {
	      var nextOpen = text.substr(pos).search(startToken),
	      nextClose = text.substr(pos).search(endToken);
	      nextOpen=nextOpen<0?nextOpen:(nextOpen+pos+1);
	      nextClose=nextClose<0?nextClose:(nextClose+pos+1);
	      if (nextOpen < 0) nextOpen = text.length;
	      if (nextClose < 0) nextClose = text.length;
	      pos = Math.min(nextOpen, nextClose);
	      if (pos == text.length) break;
	      if (cm.getTokenTypeAt(CodeMirror.Pos(i, pos + 1)) == tokenType) {
	        if (pos == nextOpen) ++count;
	        else if (!--count) { end = i; endCh = pos; break outer; }
	      }
	      ++pos;
	    }
	  }
	  if (end == null || line == end && endCh == startCh) return;
	  return {from: CodeMirror.Pos(line, startCh),
	          to: CodeMirror.Pos(end, endCh)};
}

CodeMirror.registerHelper("fold", "plsql_begin", function(cm, start) {
	return plsql_fold(cm, start,{
		"begin":/\bbegin\b/ig,
		"end":/\bend\b\s*((?!(loop|if|as))\w)*\s*;/ig
	});
});

CodeMirror.registerHelper("fold", "plsql_if", function(cm, start) {
	return plsql_fold(cm, start,{
		"begin":/\bif\b(?!(\s*;))/ig,
		"end":/\bend\b\s*if\s*;/ig
	});
});

CodeMirror.registerHelper("fold", "plsql_loop", function(cm, start) {
	return plsql_fold(cm, start,{
		"begin":/\bloop\b(?!(\s*;))/ig,
		"end":/\bend\b\s*loop\s*;/ig
	});
});
});
