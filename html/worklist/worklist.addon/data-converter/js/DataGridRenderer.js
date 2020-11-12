//
//  DataGridRenderer.js
//  Part of Mr-Data-Converter
//
//  Created by Shan Carter on 2010-10-18.
//


var DataGridRenderer = {
	addCaption : function(){
		$("table").each(function() {
			//제외 테이블
			// if($(this).hasClass('xxx_table')) return false;

			var ARth = []
				, $summary = $(this).attr('summary')
				, $caption = $(this).find('caption')
				, captionStr = $caption.text()
				, $th = $(this).find('th')
				, joinStr = ''
				, arCnt = 0
			;
			$th.each(function(i) {
				var thTxt = $(this).text()
					.replace(/\s/g, "")
					.replace('필수항목', '')
					.replace($(this).find('a').text(), '') //버튼 텍스트 삭제
					.replace(/^\s/g, "")//첫 공백 삭제, &nbsp;
					.replace(/\s$/g, "")//마지막 공백 삭제, &nbsp;
				;
				if($(this).find('input').length){
					var title = $(this).find('input').attr('title');
					ARth[arCnt] = title;
				}
				else if(Number(thTxt.length) <=0) return true; //공백문자 제거
				else ARth[arCnt] = thTxt;
				arCnt++;
			});

			joinStr = ARth.join(', ');

			/*$(this).removeAttr('summary');
			if($caption.length > 0) {
				$caption.text('').text(joinStr + ' 항목으로 이루어진 정보테이블입니다.');
			} else{
				$(this).prepend('<caption>'+joinStr+ ' 항목으로 이루어진 정보테이블입니다.</caption>');
			}*/

			console.log('joinStr: '+joinStr)
			return String(joinStr)
		});
	}
	//---------------------------------------
	// HTML Table
	//---------------------------------------
	, html: function (dataGrid, headerNames, headerTypes, indent, newLine, tableStyle) {
		//inits...
		var commentLine = "<!--";
		var commentLineEnd = "-->";
		var numRows = dataGrid.length;
		var numColumns = headerNames.length;

		//caption 
		var ARth = []
				, joinStr = ''
				, arCnt = 0
			;

		//begin render loop
		var outputText = "";

		outputText += '<div class="'+$('#tableClass').val()+'">'+newLine;
		// outputText += indent+'<table summary="insert_!@#$|-summary">'+newLine;
		outputText += indent+'<table>'+newLine;
		outputText += indent+indent+'<caption>insert_!@#$|-caption</caption>'+newLine;
		outputText += indent+indent+'<colgroup>'+newLine;
			for (var i=0; i < numColumns; i++) {
				// outputText += indent+indent+indent+'<col style="width:auto"/>'+newLine;
				outputText += indent+indent+indent+'<col />'+newLine;
			}
		outputText += indent+indent+"</colgroup>"+newLine;

		//1. tableStyle : Col
		if(tableStyle =='col'){
			outputText += indent+indent+'<thead>'+newLine;
			outputText += indent+indent+indent+'<tr>'+newLine;

				for (var j=0; j < numColumns; j++) {
					outputText += indent+indent+indent+indent+'<th scope="col">'+headerNames[j]+'</th>'+newLine;
					ARth[arCnt++] = headerNames[j];
				};
			outputText += indent+indent+indent+'</tr>'+newLine;
			outputText += indent+indent+'</thead>'+newLine;

			outputText += indent+indent+'<tbody>'+newLine;
				for (var i=0; i < numRows; i++) {
					var row = dataGrid[i];
					var rowClassName = '';
					outputText += indent+indent+indent+'<tr>'+newLine;
						for (var j=0; j < numColumns; j++) {
							outputText += indent+indent+indent+indent+'<td>'+row[j]+'</td>'+newLine;
						};
					outputText += indent+indent+indent+'</tr>'+newLine;
				};
		}//end of tableStyle

		//2. tableStyle : Row
		else if(tableStyle == 'row'){
			outputText += indent+indent+'<tbody>'+newLine;

			//첫행
			outputText += indent+indent+indent+'<tr>'+newLine;
				for (var j=0; j < numColumns; j++) {
					if(j == 0){
						outputText += indent+indent+indent+indent+'<th scope="row">'+headerNames[j]+'</th>'+newLine;
						ARth[arCnt++] = headerNames[j];
					}else{
						outputText += indent+indent+indent+indent+'<td>'+headerNames[j]+'</td>'+newLine;
					}
				};
			outputText += indent+indent+indent+'</tr>'+newLine;

			for (var i=0; i < numRows; i++) {
				var row = dataGrid[i];
				var rowClassName = '';

				outputText += indent+indent+indent+'<tr>'+newLine;
					for (var j=0; j < numColumns; j++) {
						if(j == 0){
							outputText += indent+indent+indent+indent+'<th scope="row">'+row[j]+'</th>'+newLine;
							ARth[arCnt++] = row[j];
						}else{
							outputText += indent+indent+indent+indent+'<td>'+row[j]+'</td>'+newLine;
						}
					};
				outputText += indent+indent+indent+'</tr>'+newLine;
			};
		}//end of tableStyle

		//3. tableStyle : Mix
		else if(tableStyle == 'mix'){
			outputText += indent+indent+'<thead>'+newLine;
			outputText += indent+indent+indent+'<tr>'+newLine;

				for (var j=0; j < numColumns; j++) {
					outputText += indent+indent+indent+indent+'<th scope="col">'+headerNames[j]+'</th>'+newLine;
					ARth[arCnt++] = headerNames[j];
				};
			outputText += indent+indent+indent+'</tr>'+newLine;
			outputText += indent+indent+'</thead>'+newLine;

			outputText += indent+indent+'<tbody>'+newLine;
			for (var i=0; i < numRows; i++) {
				var row = dataGrid[i];
				var rowClassName = '';

				outputText += indent+indent+indent+'<tr>'+newLine;
					for (var j=0; j < numColumns; j++) {
						if(j == 0){
							outputText += indent+indent+indent+indent+'<th scope="row">'+row[j]+'</th>'+newLine;
							ARth[arCnt++] = row[j];
						}else{
							outputText += indent+indent+indent+indent+'<td>'+row[j]+'</td>'+newLine;
						}
					};
				outputText += indent+indent+indent+'</tr>'+newLine;
			};
		}//end of tableStyle

		outputText += indent+indent+'</tbody>'+newLine;
		outputText += indent+'</table>'+newLine;;
		outputText += '</div>';


		//insert summary 
		joinStr = ARth.join(', ') + ' 항목으로 이루어진 테이블입니다.';

		outputText = outputText.replace('insert_!@#$|-summary', '')
		outputText = outputText.replace('insert_!@#$|-caption', joinStr)
		// console.log('joinStr : '+joinStr)

		


		return outputText;
	},

	html_ori: function (dataGrid, headerNames, headerTypes, indent, newLine) {
		//inits...
		var commentLine = "<!--";
		var commentLineEnd = "-->";
		var outputText = "";
		var numRows = dataGrid.length;
		var numColumns = headerNames.length;

		//begin render loop
		outputText += "<table>"+newLine;
		outputText += indent+"<thead>"+newLine;
		outputText += indent+indent+"<tr>"+newLine;

		for (var j=0; j < numColumns; j++) {
			outputText += indent+indent+indent+'<th class="'+headerNames[j]+'-cell">';
			outputText += headerNames[j];
			outputText += '</th>'+newLine;
		};
		outputText += indent+indent+"</tr>"+newLine;
		outputText += indent+"</thead>"+newLine;
		outputText += indent+"<tbody>"+newLine;
		for (var i=0; i < numRows; i++) {
			var row = dataGrid[i];
			var rowClassName = ""
			if (i === numRows-1) {
				rowClassName = ' class="lastRow"';
			} else if (i === 0){
				rowClassName = ' class="firstRow"';
			}
			outputText += indent+indent+"<tr"+rowClassName+">"+newLine;
			for (var j=0; j < numColumns; j++) {
				outputText += indent+indent+indent+'<td class="'+headerNames[j]+'-cell">';
				outputText += row[j]
				outputText += '</td>'+newLine
			};
			outputText += indent+indent+"</tr>"+newLine;
		};
		outputText += indent+"</tbody>"+newLine;
		outputText += "</table>";

		return outputText;
	},

	//---------------------------------------
	// JSON properties
	//---------------------------------------

	json: function (dataGrid, headerNames, headerTypes, indent, newLine) {
		//inits...
		var commentLine = "//";
		var commentLineEnd = "";
		var outputText = "[";
		var numRows = dataGrid.length;
		var numColumns = headerNames.length;

		//begin render loop
		for (var i=0; i < numRows; i++) {
			var row = dataGrid[i];
			outputText += "{";
			for (var j=0; j < numColumns; j++) {
				if ((headerTypes[j] == "int")||(headerTypes[j] == "float")) {
					var rowOutput = row[j] || "null";
				} else {
					var rowOutput = '"' + ( row[j] || "" ) + '"';
				};

			outputText += ('"'+headerNames[j] +'"' + ":" + rowOutput );

				if (j < (numColumns-1)) {outputText+=","};
			};
			outputText += "}";
			if (i < (numRows-1)) {outputText += ","+newLine};
		};
		outputText += "]";

		return outputText;
	},

	//---------------------------------------
	// JSON Array of Columns
	//---------------------------------------
	jsonArrayCols: function (dataGrid, headerNames, headerTypes, indent, newLine) {
		//inits...
		var commentLine = "//";
		var commentLineEnd = "";
		var outputText = "";
		var numRows = dataGrid.length;
		var numColumns = headerNames.length;

		//begin render loop
		outputText += "{"+newLine;
		for (var i=0; i < numColumns; i++) {
			outputText += indent+'"'+headerNames[i]+'":[';
			for (var j=0; j < numRows; j++) {
				if ((headerTypes[i] == "int")||(headerTypes[i] == "float")) {
					outputText += dataGrid[j][i] || 0;
				} else {
					outputText += '"'+(dataGrid[j][i] || "")+'"' ;
				}
				if (j < (numRows-1)) {outputText+=","};
			};
			outputText += "]";
			if (i < (numColumns-1)) {outputText += ","+newLine};
		};
		outputText += newLine+"}";


		return outputText;
	},


	//---------------------------------------
	// JSON Array of Rows
	//---------------------------------------
	jsonArrayRows: function (dataGrid, headerNames, headerTypes, indent, newLine) {
		//inits...
		var commentLine = "//";
		var commentLineEnd = "";
		var outputText = "";
		var numRows = dataGrid.length;
		var numColumns = headerNames.length;

		//begin render loop
		outputText += "["+newLine;
		for (var i=0; i < numRows; i++) {
			outputText += indent+"[";
			for (var j=0; j < numColumns; j++) {
				if ((headerTypes[j] == "int")||(headerTypes[j] == "float")) {
					outputText += dataGrid[i][j] || 0;
				} else {
					outputText += '"'+(dataGrid[i][j] || "")+'"' ;
				}
				if (j < (numColumns-1)) {outputText+=","};
			};
			outputText += "]";
			if (i < (numRows-1)) {outputText += ","+newLine};
		};
		outputText += newLine+"]";


		return outputText;
	},



	//---------------------------------------
	// JSON Dictionary
	//---------------------------------------
	jsonDict: function(dataGrid, headerNames, headerTypes, indent, newLine) {
		//inits...
		var commentLine = "//";
		var commentLineEnd = "";
		var outputText = "";
		var numRows = dataGrid.length;
		var numColumns = headerNames.length;

		//begin render loop
		outputText += "{" + newLine;
		for (var i = 0; i < numRows; i++) {
			outputText += indent + '"' + dataGrid[i][0] + '": ';
			if (numColumns == 2) {
				outputText += _fmtVal(i, 1, dataGrid);
			} else {
				outputText += '{ ';
				for (var j = 1; j < numColumns; j++) {
					if (j > 1) outputText += ', ';
					outputText += '"' + headerNames[j] + '"' + ":" + _fmtVal(i, j, dataGrid);
				}
				outputText += '}';
			}
			if (i < (numRows - 1)) {
				outputText += "," + newLine;
			}
		}
		outputText += newLine + "}";

		function _fmtVal(i, j) {
			if ((headerTypes[j] == "int")||(headerTypes[j] == "float")) {
				return dataGrid[i][j] || 0;
			} else {
				return '"'+(dataGrid[i][j] || "")+'"' ;
			}
		}

		return outputText;
	},



	//---------------------------------------
	// XML Nodes
	//---------------------------------------
	xml: function (dataGrid, headerNames, headerTypes, indent, newLine) {
		//inits...
		var commentLine = "<!--";
		var commentLineEnd = "-->";
		var outputText = "";
		var numRows = dataGrid.length;
		var numColumns = headerNames.length;

		//begin render loop
		outputText = '<?xml version="1.0" encoding="UTF-8"?>' + newLine;
		outputText += "<rows>"+newLine;
		for (var i=0; i < numRows; i++) {
			var row = dataGrid[i];
			outputText += indent+"<row>"+newLine;
			for (var j=0; j < numColumns; j++) {
				outputText += indent+indent+'<'+headerNames[j]+'>';
				outputText += row[j] || ""
				outputText += '</'+headerNames[j]+'>'+newLine
			};
			outputText += indent+"</row>"+newLine;
		};
		outputText += "</rows>";

		return outputText;

	},
}