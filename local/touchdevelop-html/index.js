var Translator = (function Translator () {
  var STYLE_KEYWORD = "pink_txt";
  var STYLE_STRING = "blue_txt";
  var STYLE_NUMBER = "dgray_txt";
  var STYLE_COMMENT = "green_txt";
  var START_LINE = "<span class=\"code_line\">";
  var END_LINE = "</span><br/>";

  function translateToTouchDevelop(data) {
    var output = START_LINE + stylise(STYLE_COMMENT, "// " + data.name) + END_LINE;
    output += START_LINE + stylise(STYLE_KEYWORD, "action") + " main()" + END_LINE;
    if (data.backgroundColor) output += START_LINE + "wall &rarr; set background(" + colorToTouchDevelop(data.backgroundColor, 1) + ")" + END_LINE;
    output += START_LINE + stylise(STYLE_KEYWORD, "var")
      + " page := media &rarr; create picture(" + stylise(STYLE_NUMBER, 480) + ", " + stylise(STYLE_NUMBER, 600)
      + ")" + END_LINE;

    var imageNum = 0;
    var e;
    for (e in data.elements) {
      if (!data.elements[e].type) return output;

      var element = data.elements[e];

      if(element.type == "circle") {
        // Generate TouchDevelop code for circle

        // first draw fill
        output += START_LINE + "page &rarr; fill ellipse ("
          + stylise(STYLE_NUMBER, (element.x - element.r))		// left
          + ", " + stylise(STYLE_NUMBER, (element.y - element.r)) // top
          + ", " + stylise(STYLE_NUMBER, (2 * element.r))	// width
          + ", " + stylise(STYLE_NUMBER, (2 * element.r))	// height
          + ", " + stylise(STYLE_NUMBER, 0)		// angle
          + ", " + colorToTouchDevelop(element.backgroundColor, 0.8) // fill colour
          + ")" + END_LINE;

        // ...then draw border
        output += START_LINE + "page &rarr; draw ellipse ("
          + stylise(STYLE_NUMBER, (element.x - element.r))		// left
          + ", " + stylise(STYLE_NUMBER, (element.y - element.r))	// top
          + ", " + stylise(STYLE_NUMBER, (2 * element.r))	// width
          + ", " + stylise(STYLE_NUMBER, (2 * element.r))	// height
          + ", " + stylise(STYLE_NUMBER, 0)		// angle
          + ", " + colorToTouchDevelop(element.borderColor, 0.8)	// border colour
          + ", " + stylise(STYLE_NUMBER, element.borderThickness)	// border thickness
          + ")" + END_LINE;

      } else if(element.type == "rect") {
        // Generate TouchDevelop code for rectangle

        // first draw fill
        output += START_LINE + "page &rarr; fill rect ("
          + stylise(STYLE_NUMBER, element.x)							// left
          + ", " + stylise(STYLE_NUMBER, element.y)						// top
          + ", " + stylise(STYLE_NUMBER, element.width)					// width
          + ", " + stylise(STYLE_NUMBER, element.height)				// height
          + ", " + stylise(STYLE_NUMBER, 0)												// angle
          + ", " + colorToTouchDevelop(element.backgroundColor, 0.8)	//fill colour
          + ")" + END_LINE;

        // ... then draw border
        output += START_LINE + "page &rarr; draw rect ("
          + stylise(STYLE_NUMBER, element.x)							// left
          + ", " + stylise(STYLE_NUMBER, element.y)						// top
          + ", " + stylise(STYLE_NUMBER, element.width)					// width
          + ", " + stylise(STYLE_NUMBER, element.height)				// height
          + ", " + stylise(STYLE_NUMBER, 0)												// angle
          + ", " + colorToTouchDevelop(element.borderColor, 0.8)		// border colour
          + ", " + stylise(STYLE_NUMBER, element.borderThickness)		// border thickness
          + ")" + END_LINE;

      }  else if(element.type == "text") {
        // Generate TouchDevelop code for text

        output += START_LINE + "page &rarr; draw text ("
          + stylise(STYLE_NUMBER, element.x)							// left
          + ", " + stylise(STYLE_NUMBER, element.y)						// top
          + ", " + stylise(STYLE_STRING, "\"" + element.text + "\"")	// text
          + ", " + stylise(STYLE_NUMBER, element.fontSize)				// font size
          + ", " + stylise(STYLE_NUMBER, 0)												// angle
          + ", " + colorToTouchDevelop(element.fontColor, 0.8)			// colour
          + ")" + END_LINE;

      } else if(element.type == "image") {
        // Generate TouchDevelop code for image

        imageNum ++;
        output += START_LINE + stylise(STYLE_KEYWORD, "var") + " image" + imageNum
          + " := web &rarr; download picture ("
          + stylise(STYLE_STRING, "\"Image " + imageNum + " URL\"")
          + ")" + END_LINE;																// get picture

        output += START_LINE + "image" + imageNum + " &rarr; resize("
          + stylise(STYLE_NUMBER, element.width)
          + ", " + stylise(STYLE_NUMBER, element.height)				//resize to correct proportions
          + ")" + END_LINE;

        output += START_LINE + "page &rarr; blend ("											// add image to 'page'
          + "image" + imageNum
          + ", " + stylise(STYLE_NUMBER, element.x)						// left
          + ", " + stylise(STYLE_NUMBER, element.y)						// top
          + ", " + stylise(STYLE_NUMBER, 0)												// angle
          + ", " + stylise(STYLE_NUMBER, 1)												// opacity
          + ")" + END_LINE;
      }

    }

    return output;
  }

  function stylise(style, text) {
    return "<span class=\"" + style + "\">" + text + "</span>";
  }

  function colorToTouchDevelop(col, alpha) {
    var rLeft = col.indexOf("(") + 1;
    var gLeft = col.indexOf(",") + 1;
    var bLeft = col.indexOf(",", gLeft) + 1;
    var bRight = col.indexOf(")");

    var r = col.substring(rLeft, gLeft - 1) / 255;
    var g = col.substring(gLeft, bLeft - 1) / 255;
    var b = col.substring(bLeft, bRight) / 255;

    if (alpha == 1) {
      return "color &rarr; from rgb (" + stylise(STYLE_NUMBER, Math.round(r*100)/100) + ", " + stylise(STYLE_NUMBER, Math.round(g*100)/100) + ", " + stylise(STYLE_NUMBER, Math.round(b*100)/100) + ")";
    } else {
      return "color &rarr; from argb (" + stylise(STYLE_NUMBER, Math.round(alpha*100)/100) + ", " + stylise(STYLE_NUMBER, Math.round(r*100)/100) + ", " + stylise(STYLE_NUMBER, Math.round(g*100)/100) + ", " + stylise(STYLE_NUMBER, Math.round(b*100)/100) + ")";
    }
  }

  return translateToTouchDevelop;
})();

module.exports = Translator;