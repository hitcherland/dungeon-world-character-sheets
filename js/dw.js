var jsons = {};
var sheets;

function getSheetsData() {
	return $.getJSON( "charactersheets/sheets.json", function( data ) {
		sheets = data;
	} );
}

function save() {
	function fontCallback( family, bold, italic, fontOptions ) {
		if( family.match( /Averia Libre/) ) {
			return 'Averia Libre';
		} else if( family.match( /Metamorphous/) ) {
			return 'Metamorphous'
		} else {
			console.log( 'family: ', family );
			return 'Averia Libre';
		}
	}

	var doc = new PDFDocument();
	var stream = doc.pipe(blobStream());

	doc.font('fonts/Averia_Libre/AveriaLibre-Regular.ttf', 'Averia Libre')
	doc.registerFont('Averia Libre', 'fonts/Averia_Libre/AveriaLibre-Regular.ttf', 'Averia Libre')
	doc.font('fonts/Metamorphous/Metamorphous-Regular.ttf', 'Metamorphous')
	doc.registerFont('Metamorphous', 'fonts/Metamorphous/Metamorphous-Regular.ttf', 'Metamorphous')

	var pages = $( 'svg' );
	for (var i=0; i<pages.length; i++ ) {
		SVGtoPDF(doc, pages[ i ].outerHTML , 0, 0, { fontCallback: fontCallback });
		if( i!= pages.length -1 ) {
			doc.addPage()
		}
	}

	doc.end();
	stream.on('finish', function() {
		$( '#save_pdf' ).attr( 'href', stream.toBlobURL('application/pdf') );
		$( '#save_pdf' ).attr( 'download', "charactersheet.pdf" );
	});
}

function loadJson( filepath ) {
	$.getJSON( filepath, function( data ) {
		jsons[ filepath ] = data;
	} );
}

function updateSheet( json ) {
	function makeInput( id, value ) {
		$( '#' + id + ' tspan' ).text( value );
		$( '#' + id ).attr( 'contentEditable', 'true' );
		$( '#' + id +' *' ).attr( 'contentEditable', 'true' );
	}
	make_input( 'name', json.name );
}

function loadSheet( name ) {
	getSheetsData().done( function() {
		var class_ = sheets[ name ];
		var len = class_.length - 1;
		for( var i = 0; i < len; i++ ) {
			var page = $( '<div contentEditable="true" class="' + name + '" id="' + name + i + '"></div>' );
			$( document.body ).append( page );
			page.load( class_[ i ] );
		};
	} );
}
