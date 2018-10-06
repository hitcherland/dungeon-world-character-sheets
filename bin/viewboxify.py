#!/usr/bin/python

import argparse
from lxml import etree

parser = argparse.ArgumentParser()
parser.add_argument( 'in_filepath' )
parser.add_argument( 'out_filepath', nargs = '?' )

def update( in_filepath, out_filepath = None ):
	svg = etree.parse( in_filepath )
	root = svg.getroot()
	
	root.attrib[ 'preserveAspectRatio' ] = 'none'
	svg.write( out_filepath or in_filepath );

if __name__ == '__main__':
	args = parser.parse_args()
	update( args.in_filepath, args.out_filepath )
