var jsons = {};
var sheets;

function getSheetsData() {
	return $.getJSON( "charactersheets/sheets.json", function( data ) {
		sheets = data;
	} );
}

function saveSVG() {
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

function activateCheckboxes() {
    var count=0
    function test() {
        var objects = $( 'object' );
        var pass=false;
        if( objects.length > 0 )
            pass = true;

        objects.each( function () {
            if( !pass )
                return;

            var elements = $( 'desc:contains("checkbox")', this.contentDocument ).parent().off().bind( 'touchstart mousedown', function() { 
                var o=$(this).css( 'opacity' ); 
                $(this).css( 'opacity', 1 - o ); 
            });

            if( elements.length == 0 ) {
                console.log( "failed on:", this );
                pass = false;
            }
        });

        if(!pass && count < 10) {
            count++;
            setTimeout( test, 1000 );
        } else {
            console.debug( "done" );
        }
    }
    test();
}

function readCheckboxes() {
    var output = {};
    $( 'object' ).each( function() {
        var object_output = {}
        var elements = $( 'desc:contains("checkbox")', this.contentDocument ).each( function() {
            var o=$( this ).parent().css( 'opacity' ); 
            object_output[ this.id ] = o; 
        });
        output[ this.data ] = object_output;
    } );
    return output;
}

function loadCheckboxes( json ) {
    $( 'object' ).each( function() {
        var data = json[ this.data ];
        var ids = Object.keys( data );
        for( var i = 0; i < ids.length; i++ ) {
            var opacity = data[ ids[ i ] ];
            var debug = $( 'desc#' + ids[ i ], this.contentDocument )
            debug.parent().css( 'opacity', opacity );
        }
    } );
}

function readTextInputs() {
    var output = {};
    $( 'object' ).each( function() {
        var object_output = {}
        $( 'input[type="text"]', this.contentDocument ).each( function() {
            var value = $( this ).val();
            object_output[ this.id ] = value;
        });
        output[ this.data ] = object_output;
    });
    return output;
}

function loadTextInputs( json ) {
    console.log( json );
    $( 'object' ).each( function() {
        var data = json[ this.data ]
        var ids = Object.keys( data );
        $( 'input[type="text"]', this.contentDocument ).each( function() {
            for( var i = 0; i < ids.length; i++ ) {
                var value = data[ ids[ i ] ];
                var debug = $( 'input#' + ids[ i ], this.contentDocument );
                console.debug( debug, ids[ i ] );
                debug.val( value );
            };
        });
    });
}

function saveURL() {
    var json = {
        'checkboxes': readCheckboxes(),
        'textInputs': readTextInputs(),
    };

    var packed = JSONC.pack( json );
    return packed;
}

function loadURL( url ) {
    var json = JSONC.unpack( url );
    loadCheckboxes( json[ 'checkboxes' ] );
    loadTextInputs( json[ 'textInputs' ] );
}

activateCheckboxes();
