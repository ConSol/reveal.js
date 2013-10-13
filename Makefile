ifneq (,)
This makefile requires GNU Make.
endif
 
SVG_FILES := $(wildcard *.svg)
PNG_FILES := $(patsubst %.svg, %.png, $(SVG_FILES))

all: $(PNG_FILES)

%.png: %.svg
	inkscape -e $@ $<
