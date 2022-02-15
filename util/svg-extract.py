
# http://helpfulsheep.com/2015-03-25-converting-svg-fonts-to-svg/

import sys, re

if len(sys.argv) < 2:
	print('Usage: python {} webfont-file.svg'.format(sys.argv[0]))
	sys.exit()
with open(sys.argv[1], 'r') as r:
	lines = r.read().split('\n')
	glyphs = [x for x in lines if '<glyph' in x]
	# for every glyph element in the file
	for i in range(0, len(glyphs)):
		filename = re.search(r'glyph-name="([^"]+)"', glyphs[i])
		filename = filename.group(1) if filename else str(i + 1).rjust(3, '0')

		with open(filename + ".svg", 'w') as w:
			w.write('<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">\n')
			# replace 'glyph' with 'path' and flip vertically
			w.write(glyphs[i].replace('<glyph', '<path transform="scale(1, -1) translate(0, -512)"') + '\n')
			w.write('</svg>')