#!/usr/bin/python

from lxml import etree, html
import argparse
import re

parser = argparse.ArgumentParser()
parser.add_argument( 'in_filepath' )
parser.add_argument( 'out_filepath', nargs = '?' )

import os
topdir = os.path.dirname( __file__ )

with open( topdir + '/../css/svg.css' ) as fh:
    css = '<style>' + fh.read().replace( '\n', ' ' ) + '</style>'

style = html.fromstring( css )

def update( in_filepath, out_filepath = None ):
    svg = etree.parse( in_filepath )
    root = svg.getroot()

    namespaces = { 't': 'http://www.w3.org/2000/svg'}

    root.insert( 0, style )
    rects = root.xpath( '//t:rect/t:desc/..', namespaces = namespaces )
    
    group = root.xpath( 't:g', namespaces = namespaces )
    for rect in rects:
        attrib = {
            'width': rect.attrib[ 'width' ],
            'height': rect.attrib[ 'height' ],
            'x': rect.attrib[ 'x' ],
            'y': rect.attrib[ 'y' ],
        }
        parent = rect.getparent()
        desc = rect.xpath( 't:desc', namespaces = namespaces )[ 0 ]
        element = html.fromstring( desc.text );
        element.attrib[ 'xmlns' ] = "http://www.w3.org/1999/xhtml"
        fo = etree.SubElement( parent, 'foreignObject', attrib = attrib );
        fo.append( element );
        parent.remove( rect )

    checkboxes = root.xpath( '//t:desc[contains( text(), "checkbox" )]/..', namespaces = namespaces )
    for checkbox in checkboxes:
        desc = checkbox.xpath( 't:desc', namespaces = namespaces )[ 0 ]
        match = re.search( 'checkbox\[(.*?)\]:\s*(\S*)$', desc.text )
        if match:
            id = match.group( 1 )
            opacity = match.group( 2 )
            if 'style' not in checkbox.attrib:
                checkbox.attrib[ 'style' ] =''
            checkbox.attrib[ 'style' ] += "opacity:{};".format( opacity )
            checkbox.attrib[ 'checkbox' ] = "true" 
#            checkbox.attrib[ 'onclick' ] = 'var v=$( this ).visibility( v=="hidden"?"visible":"hidden" );'
    
    
    root.attrib[ 'preserveAspectRatio' ] = 'none'
    svg.write( out_filepath or in_filepath );

if __name__ == '__main__':
    args = parser.parse_args()
    update( args.in_filepath, args.out_filepath )
