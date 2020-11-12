// Modify : Goang 20181116 (tableStyle)

var _gaq = _gaq || [];

$(document).ready(function(){

	var d = new DataConverter('converter');
	d.create(345,500);

	$(".settingsElement").change(updateSettings);

	$(window).bind('resize',function() {
		// w = win.width() - widthOffset;
		// h = win.height() - heightOffset;
		// d.resize(w,h);
		// sidebar.height(h);
	});


	function updateSettings (evt) {
		if (evt) {
			_gaq.push(['_trackEvent', 'Settings',evt.currentTarget.id ]);
		};

		d.includeWhiteSpace = $('#includeWhiteSpaceCB').attr('checked');

		if (d.includeWhiteSpace) {
			$("input[name=indentType]").removeAttr("disabled");
			var indentType = $('input[name=indentType]:checked').val();
			if (indentType === "tabs") {
				d.indent = "\t";
			} else if (indentType === "spaces") {
				d.indent = "  "
			}
		} else {
			$("input[name=indentType]").attr("disabled", "disabled");
		}

		d.headersProvided = $('#headersProvidedCB').attr('checked');

		if (d.headersProvided) {
			$("input[name=headerModifications]").removeAttr("disabled");

			var hm = $('input[name=headerModifications]:checked').val();
			if (hm === "downcase") {
				d.downcaseHeaders = true;
				d.upcaseHeaders = false;
			} else if (hm === "upcase") {
				d.downcaseHeaders = false;
				d.upcaseHeaders = true;
			} else if (hm === "none") {
				d.downcaseHeaders = false;
				d.upcaseHeaders = false;
			}
		} else {
			$("input[name=headerModifications]").attr("disabled", "disabled");
		}




		d.delimiter = $('input[name=delimiter]:checked').val();
		d.decimal = $('input[name=decimal]:checked').val();

		d.tableStyle = $('input[name=tableStyle]:checked').val();//1116

		d.useUnderscores = true;

		d.convert();
	};

	updateSettings();

})



$(document).ready(function() {
	$("#converter").css({
		width : '100%'
		, height : 'calc(100vh - 10px)'
	}).split({
		orientation: "vertical",
		limit: 100,
		position: "50%"
	});
	// $(".splitWrap").split({
	// 	orientation: "vertical",
	// 	limit: 250,
	// 	position: "50%"
	// });

	$('.toggle_btn').on('click', function(){
		$('body').toggleClass('option_on');
	}).click();
});