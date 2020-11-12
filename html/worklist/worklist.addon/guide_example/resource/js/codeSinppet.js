/**
* codeSinppet
* --------------------------------------
* @Goang
* @2018.11.29
* --------------------------------------
* @plugin
* 	 clipboardjs : https://clipboardjs.com
* 	 highlightjs :
* - HtmlEscape : @author Ulrich Jensen, http://www.htmlescape.net
*/


	var codeSinppet =(function(){
			var hex=new Array('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f');
			var jMap = {}

			var setMap = function(){
				jMap = {
					codePanel : $('.codePanel')
					// , oriCode :$('.code', this.codePanel)
					, directClass : 'direct' // 직접 입력시 제외 클래스
				}
			}

			//-------------------------
			// insert Snippet
			//-------------------------
			function setSnippet(){
				jMap.codePanel.each(function(){
					//다이렉트 입력시 예외
					if($(this).hasClass(jMap.directClass)) return false;

					var $code = $(this).find('.codeWrap');
					var oriSource = $code.html().trim();//jQuery.trim() : 앞뒤 공백제거
					var appendHtml = ''
					+'<div class="parseWrap">'
					+'	<pre><code class="html">'+escapeHTML_custom(oriSource)+'</code></pre>'
					+'</div>'
				;

					$(this).append(appendHtml);
				});
			}

			//-------------------------
			// Highlight
			//-------------------------
			var setHighlight = function(){
				jMap.codePanel.find('pre code').each(function(i, block) {
					hljs.highlightBlock(block);
				});
			}

			//-------------------------
			// Clipboard & Folding
			//-------------------------
			var setClipboard = function(_target){
				var appendOptionBar =''
					+'<div class="optionBox ">'
					+'	<a href="javascript:void(0);" class="btn fr fold_btn">+</a>'
					+'	<a href="javascript:void(0);" class="btn fr copy_btn">Copy</a>'
					+'</div>'
				;
				var $parseWrap = jMap.codePanel.find('.parseWrap');
				$parseWrap.prepend(appendOptionBar);//Append optionBtn


				//Clipboard
				var $copyBtn = $parseWrap.find(".copy_btn");
				var copyObj = new ClipboardJS(".copy_btn",{
					target: function(e) {
						var copyTxt = e.parentNode.nextElementSibling;
						return copyTxt;
					}
				});

				$copyBtn.on('click', function(){
					$(this).text('Copied!!!');
				});

				copyObj.on("success", function(e) {
					// console.log(e);
					setTimeout(function(){
						$copyBtn.text('Copy');
					},500)
					e.clearSelection();
				});

				copyObj.on("error", function(e) {
					// console.log(e);
				});

				jMap.codePanel.each(function(){
					var $codeWrap = $(this).find('.codeWrap')
						, $pareseWrap = $(this).find('.parseWrap')
						// , $copyBtn = $pareseWrap.find('.copy_btn')
						, $foldBtn = $pareseWrap.find('.fold_btn')
						, $foldCon = $pareseWrap.find('pre')
					;

					// Folding
					// var h= $foldCon.attr('data-height', $foldCon.find('code').height());
					$pareseWrap.addClass('init');

					$foldBtn.on('click', function(){
						$foldCon.parent().toggleClass('init');
						if($foldCon.parent().hasClass('init')){
							$(this).text('+');
						}else{
							$(this).text('-');
						}

					});
				});


			}


			var escapeHTML_custom = function(_value){
				var preescape = _value
				var escaped="";

				var i=0;
				// var brEscape=document.getElementById('br').checked;
				// var tagEscape=document.getElementById('tag').checked;
				// var others=document.getElementById('other').checked;
				// var nbsp=document.getElementById('nbsp').checked;
				var brEscape=true
				var tagEscape=true
				var others=true
				var nbsp=true

				for(i=0; i<preescape.length; i++){
					var p=preescape.charAt(i);

					if(others) p=""+escapeCharx(p);
					if(tagEscape) p=""+escapeTags(p);
					if(brEscape) p=""+escapeBR(p);
					if(nbsp) p=""+escapeNBSP(p);

					escaped=escaped+p;
				}

				return escaped;
			}

			//-------------------------
			// HtmlEscape ORI Code
			//-------------------------
			function escapeHTML() {
				var x=document.getElementById("from_text");
				var preescape="" + x.value;
				var escaped="";

				var i=0;
				var brEscape=document.getElementById('br').checked;
				var tagEscape=document.getElementById('tag').checked;
				var others=document.getElementById('other').checked;
				var nbsp=document.getElementById('nbsp').checked;

				for(i=0;i<preescape.length;i++){
					var p=preescape.charAt(i);

					if(others) p=""+escapeCharx(p);
					if(tagEscape) p=""+escapeTags(p);
					if(brEscape) p=""+escapeBR(p);
					if(nbsp) p=""+escapeNBSP(p);

					escaped=escaped+p;
				}

				x=document.getElementById("to_text");
				x.value=escaped;
			}

			function escapeBR(original) {
				var thechar=original.charCodeAt(0);

				switch(thechar) {
						case 10: return "<br/>"; break; //newline
						case '\r': break;
				}
				return original;
			}

			function escapeNBSP(original) {
				var thechar=original.charCodeAt(0);
				switch(thechar) {
						case 32: return "&nbsp;"; break; //space
				}
				return original;
			}

			function escapeTags(original) {
				var thechar=original.charCodeAt(0);
				switch(thechar) {
						case 60:return "&lt;"; break; //<
						case 62:return "&gt;"; break; //>
						case 34:return "&quot;"; break; //"
				}
				return original;
			}

			function escapeCharx(original) {
				var found=true;
				var thechar=original.charCodeAt(0);
				switch(thechar) {
						case 38:return "&amp;"; break;
						case 198:return "&AElig;"; break;
						case 193:return "&Aacute;"; break;
						case 194:return "&Acirc;"; break;
						case 192:return "&Agrave;"; break;
						case 197:return "&Aring;"; break;
						case 195:return "&Atilde;"; break;
						case 196:return "&Auml;"; break;
						case 199:return "&Ccedil;"; break;
						case 208:return "&ETH;"; break;
						case 201:return "&Eacute;"; break;
						case 202:return "&Ecirc;"; break;
						case 200:return "&Egrave;"; break;
						case 203:return "&Euml;"; break;
						case 205:return "&Iacute;"; break;
						case 206:return "&Icirc;"; break;
						case 204:return "&Igrave;"; break;
						case 207:return "&Iuml;"; break;
						case 209:return "&Ntilde;"; break;
						case 211:return "&Oacute;"; break;
						case 212:return "&Ocirc;"; break;
						case 210:return "&Ograve;"; break;
						case 216:return "&Oslash;"; break;
						case 213:return "&Otilde;"; break;
						case 214:return "&Ouml;"; break;
						case 222:return "&THORN;"; break;
						case 218:return "&Uacute;"; break;
						case 219:return "&Ucirc;"; break;
						case 217:return "&Ugrave;"; break;
						case 220:return "&Uuml;"; break;
						case 221:return "&Yacute;"; break;
						case 225:return "&aacute;"; break;
						case 226:return "&acirc;"; break;
						case 230:return "&aelig;"; break;
						case 224:return "&agrave;"; break;
						case 229:return "&aring;"; break;
						case 227:return "&atilde;"; break;
						case 228:return "&auml;"; break;
						case 231:return "&ccedil;"; break;
						case 233:return "&eacute;"; break;
						case 234:return "&ecirc;"; break;
						case 232:return "&egrave;"; break;
						case 240:return "&eth;"; break;
						case 235:return "&euml;"; break;
						case 237:return "&iacute;"; break;
						case 238:return "&icirc;"; break;
						case 236:return "&igrave;"; break;
						case 239:return "&iuml;"; break;
						case 241:return "&ntilde;"; break;
						case 243:return "&oacute;"; break;
						case 244:return "&ocirc;"; break;
						case 242:return "&ograve;"; break;
						case 248:return "&oslash;"; break;
						case 245:return "&otilde;"; break;
						case 246:return "&ouml;"; break;
						case 223:return "&szlig;"; break;
						case 254:return "&thorn;"; break;
						case 250:return "&uacute;"; break;
						case 251:return "&ucirc;"; break;
						case 249:return "&ugrave;"; break;
						case 252:return "&uuml;"; break;
						case 253:return "&yacute;"; break;
						case 255:return "&yuml;"; break;
						case 162:return "&cent;"; break;
						default:
							found=false;
							break;
					}
					if(!found) {
						if(thechar>127) {
							var c=thechar;
							var a4=c%16;
							c=Math.floor(c/16);
							var a3=c%16;
							c=Math.floor(c/16);
							var a2=c%16;
							c=Math.floor(c/16);
							var a1=c%16;
						//  alert(a1);
							return "&#x"+hex[a1]+hex[a2]+hex[a3]+hex[a4]+";";
						}
						else {
							return original;
						}
					}
			}

			//-------------------------
			// init
			//-------------------------
			var initModule = function(){
				setMap();
				setSnippet();
				setHighlight();
				setClipboard();
			}

			return {
				escapeHTML : escapeHTML
				, initModule : initModule
			}
	})();

	$(document).ready(function() {
		codeSinppet.initModule()
	});