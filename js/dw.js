var jsons = {};
var sheets;

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

function activateCheckboxes() {
    var count=0
    var hash = window.location.hash;
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
                saveURL();
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
            window.location.hash = hash;
            if( hash !== undefined ) {
                loadURL( hash );
            }
            $( 'object' ).each(function() { 
                $( 'input', this.contentDocument ).change( function() {
                    saveURL(); 
                });
            });
        }
    }
    test();
}

function saveURL() {
    function __getter__( id, get ) {
        return $( id, this.contentDocument ).map( function() { return get.call( this ); }).get();
    }

    function checkboxes() {
        return __getter__.call( this, 'desc:contains("checkbox")', function() { return $( this ).parent().css( 'opacity' ) } );
    }

    function textinputs() {
        return __getter__.call( this, 'input[type="text"]', function() { return $( this ).val() } );
    }

    var data = $( 'object' ).map( function() {
        var cb = checkboxes.call( this );
        var ti = textinputs.call( this );
        return [ [ cb, ti ] ];
    });

    var data = JSONC.pack( data.get() );
    window.location.hash = data;
}

function loadURL(hash) {
    function __setter__( id, data, set ) {
        var elements = $( id, this.contentDocument );
        var ids = elements.map( function( i, element ) { 
            set.call( this, data[ i ] );
        }).get();
    }

    function checkboxes(  data ) {
        __setter__.call( this, 'desc:contains("checkbox")', data, function( value ) {
            $( this ).parent().css( 'opacity', value );
        });
    }

    function textinputs( data ) {
        __setter__.call( this, 'input[type="text"]', data, function( value ) {
            $( this ).val( value );
        });
    }

    var json = JSONC.unpack( hash );
    $( 'object' ).map( function( i ) {
        var data = json[ i ];
        checkboxes.call( this, data[ 0 ] );
        textinputs.call( this, data[ 1 ] );
    });
}

activateCheckboxes();
