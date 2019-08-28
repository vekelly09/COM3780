// Marty Stepp's CSE 14x/190M/403/etc. course web site script
// Sets up various things on my course web site pages,
// such as zebra striping for some table rows,
// links to files, email addresses and campus buildings.

// wrap entire script in an anonymous function to avoid polluting global scope
// (JS module pattern)
(function() {
	// max number of files that will be shown before initially collapsing
	var MAX_FILES_LENGTH = 99;
	
	// URL stub for campus map building links
	var MAPS_URL = "http://www.washington.edu/maps/?l=";

	// Turns spans with class of "building" into links to a campus map to that building.
	function buildingMapLinks() {
		var cells = $$(".building");
		for (var i = 0; i < cells.length; i++) {
			var addr = cells[i].innerHTML;
			var tokens = addr.split(/[ ]+/);
			var building = tokens[0];
			var roomNumber = "";

			if (tokens.length >= 2) {
				roomNumber = tokens[1];
			}
			
			// var area = "southcentral";
			// if (cells[i].hasClassName("north")) {
			//     area = "northcentral";
			// }
			
			// cells[i].update("<a href=\"http://www.washington.edu/home/maps/" + area + ".html?" + building + "\">" + building + "</a> " + roomNumber);
			
			cells[i].update("<a target=\"_blank\" href=\"" + MAPS_URL + building + "\">" + building + "</a> " + roomNumber);
		}
	}
	
	// Displays a warning message on the page if this is not the current quarter's web site.
	function checkPageOutOfDate() {
		if (location.href.match(/CurrentQtr/)) {
			return;
		}
		
		// try to figure out what quarter this web site is for
		// "http://www.cs.washington.edu/education/courses/cse142/11wi/" -> "11wi"
		var quarter = location.href.replace(/.*\/cse([0-9a-zA-Z]+)\/([0-9a-zA-Z]+)\/.*/, "$2");
		if (!quarter || quarter.toLowerCase() == "currentqtr" || quarter.length != 4) {
			return;
		}
		var quarterYear = 2000 + parseInt(quarter.substring(0, 2));   // "11wi" -> 11
		var quarterQtr  = quarter.substring(2);                // "11wi" -> "wi"
		
		var now = new Date();
		var currentYear = now.getYear() + 1900;
		var currentQtr  = "";       // e.g. "11au"
		var currentQtrQtr = "";     // e.g. "au"
		var obsolete = false;

		// try to figure out what quarter it is currently (roughly)
		var QUARTERS = ["wi", "sp", "su", "au"];
		var QUARTER_START = {
			"wi": "Jan 1",
			"sp": "Mar 20",
			"su": "Jun 15",
			"au": "Sep 20"
		};
		var QUARTER_END = {
			"wi": "Mar 19",
			"sp": "Jun 14",
			"su": "Sep 19",
			"au": "Dec 31"
		};
		var QUARTER_FULL_NAME = {
			"wi": "Winter",
			"sp": "Spring",
			"su": "Summer",
			"au": "Autumn"
		};
		
		// "Dec 6 2011 8:15 AM"
		for (var i = 0; i < QUARTERS.length; i++) {
			var qtrName = QUARTERS[i];
			var dateStart = new Date(Date.parse(QUARTER_START[qtrName] + " " + currentYear + " 12:00 AM"));
			var dateEnd   = new Date(Date.parse(QUARTER_END[qtrName]   + " " + currentYear + " 11:59 PM"));
			if (dateStart <= now && now <= dateEnd) {
				// found the current quarter!  now see if this web page is from that quarter.
				currentQtr = currentYear % 100 + qtrName;
				currentQtrQtr = qtrName;
				break;
			}
		}

		if (quarterYear < currentYear) {
			obsolete = true;                    // this web site comes from a past year
		} else if (quarter && currentQtr) {
			obsolete = quarter != currentQtr;   // this web site may come from a past quarter in the same year
		}
		
		var quarterFullName = QUARTER_FULL_NAME[quarterQtr] + " " + quarterYear;
		var currentQuarterFullName = QUARTER_FULL_NAME[currentQtrQtr] + " " + currentYear;
		
		if (obsolete) {
			var div = document.createElement("div");
			
			// try to figure out what course this web site is for
			// "http://www.cs.washington.edu/education/courses/cse142/11wi/" -> "142"
			var course = location.href.replace(/.*\/cse([0-9a-zA-Z]+)\/.*/, "$1") || (location.href.match(/143/) ? "143" : "142");
			var websiteLink = "http://www.cs.washington.edu/" + course;
			
			div.className = "excitingnews";
			div.innerHTML = "NOTE: This old web site is <strong>out of date</strong>.  " +
					"This is the course web site from a past quarter, <strong>" + quarter + "</strong> (" + quarterFullName + "), " +
					"but the current quarter is <strong>" + currentQtr + "</strong> (" + currentQuarterFullName + ").  " +
					"If you are a current student taking the course, this is not your class web site, " +
					"and you should visit the <a href=\"" + websiteLink + "\">current class web site</a> instead.";
			
			var container = $$("div.centerpane")[0] || $("container") || document.body;
			container.insertBefore(div, container.firstChild);
		}
	}
	
	// Returns true if the given image is indicating that its area is expanded.
	function isExpanded(img) {
		return img.src.match(/minus/);
	}
	
	// Sets the given image to be a plus or minus icon.
	function swapPlusMinus(img) {
		if (isExpanded(img)) {
			img.src = img.src.replace(/minus/, "plus");
		} else {
			img.src = img.src.replace(/plus/, "minus");
		}
	}

	// Toggles an element being expanded or collapsed.
	function toggleCollapsed(collapse) {
		collapse.select("ul").each(Element.toggle);
		var img = collapse.select("img.plusicon")[0];
		swapPlusMinus(img);
	}
	
	// Handles click on a link around a plusicon image.
	function collapseableClick(event, element) {
		if (event) {
			event.stop();
		}
		if (!element) {
			element = this;
		}
		var collapse = element.up(".collapseable");
		if (!collapse) { return; }
		
		toggleCollapsed(collapse);
	}

	// Turns spans with class of "ema" into links to email that person.
	function emailAddressLinks() {
		var cells = $$(".ema");
		for (var i = 0; i < cells.length; i++) {
			var addr = cells[i].textContent ? cells[i].textContent : cells[i].innerText;
			var linkText = addr;
			if (cells[i].hasClassName("showema")) {
				linkText += "@cs.washington.edu";
			}
			cells[i].update("<a href=\"mailto:" + addr + "@cs.washington.edu\">" + linkText + "</a>");
		}
	}

	// Expands all lists of files on lecture calendar page.
	function expandAllClick(event) {
		if (event) {
			event.stop();
		}

		var img = this.select("img.plusicon")[0];
		if (!img) { return; }
		
		var expand = !!img.src.match(/plus/);
		swapPlusMinus(img);

		$$(".collapseable").each(function(collapse) {
			// .select("ul").each(Element.toggle);
			var img = collapse.select("img.plusicon")[0];
			if (!!isExpanded(img) !== expand) {
				toggleCollapsed(collapse);
			}
		});
	}

	/** Returns all query parameters on the page as a [key => value] hash. */
	function getQueryParams() {
		var hash = {};
		if (location.search && location.search.length >= 1) {
			var url = location.search.substring(1);
			var chunks = url.split(/&/);
			for (var i = 0; i < chunks.length; i++) {
				var keyValue = chunks[i].split("=");
				if (keyValue[0]) {
					var thisValue = true;
					if (typeof(keyValue[1]) !== "undefined") {
						thisValue = encodeURIComponent(keyValue[1]);
						thisValue = thisValue.replace(/[+]/g, " ");  // unescape URL spaces
					}
					hash[keyValue[0]] = thisValue;
				}
			}
		}
		return hash;
	}

	// try to highlight current date table cell on lecture calendar page
	function highlightCurrentDate() {
		$$(".folder.subheading").each(function(element) {
			var text = typeof(element.textContent) !== "undefined" ? element.textContent : element.innerText;
			text = text.trim().replace(/\n.*/gi, "");
			if (text.match(/[0-9]{1,2}-[0-9]{1,2}/)) {
				// then this is a date
				var today = new Date();
				var tokens = text.split(/-/);
				var month = parseInt(tokens[0], 10);
				var day = parseInt(tokens[1], 10);
				if (month == today.getMonth() + 1 && day == today.getDate()) {
					var td = element.up("td");
					if (td) {
						td.addClassName("today");
						td.id = "today";
					} else {
						element.addClassName("today");
						element.id = "today";
					}

					if (location.hash == "#today") {
						// this line might seem useless, but re-setting the #hash makes
						// the browser jump down to the element with that newly-set id
						location.hash = "#today";
					}
				} else if (month > today.getMonth() + 1 ||
						(month == today.getMonth() + 1 && day > today.getDate())) {
					// let's also set a style on days in the future, just for fun
					var td = element.up("td");
					if (td) {
						td.addClassName("future");
					} else {
						element.addClassName("future");
					}
				}
			}
		});
	}
	
	function insertDates() {
		// inject each date's month/day into "date" spans sequentially
		//                    Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec
		var daysInMonth = [-1, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		var month = 0;
		var day = 0;
		var year = 2012;   // hard-code 2012 because course web site will not change year in the future
		if (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0)) {
			daysInMonth[2]++;  // leap years
		}
		
		var today = new Date();
		var tomorrow = new Date();
		tomorrow.setDate(today.getDate() + 1);
		var yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);
		
		$$(".date").each(function(element) {
			if (element.innerHTML) {
				var tokens = element.innerHTML.split(/\//);
				month = parseInt(tokens[0]);
				day = parseInt(tokens[1]);
			} else if (month > 0 && day > 0) {
				day++;
				if (day > daysInMonth[month]) {
					day = 1;
					month = (month % 12) + 1;
				}
				element.innerHTML = month + "/" + day;
			}
			
			var td = element.up("td");
			if (td) {
				var thisDate = new Date(year, month - 1, day);
				if (thisDate > yesterday && thisDate <= today) {
					td.addClassName("today");
				}
			}
		});
	}

	// Sets +/- icons to expand/collapse various groups of files on the Lectures page.
	function plusMinusLinks() {
		$$(".plusicon").each(function(el) {
			var a = el.up("a");
			a.href = "#";

			if (!a || a.id == "expandall") { return; }
			a.observe("click", collapseableClick);
			
			var collapse = el.up(".collapseable");
			if (collapse) {
				collapseableClick(null, el);   // initially collapsed
			}
		});
		
		if ($("expandall")) {
			$("expandall").observe("click", expandAllClick);
		}
	}
	
	// Shows any "delayed" sections such as labs or sections to pop up on certain dates.
	// Useful for setting up an initially hidden div that will suddenly show up later.
	// Example:
	// <div class="assignmentarea delayed" style="display: none">
	//     <span class="showdate" style="display: none">Dec 6 2011 8:15 AM</span>
	//     ...
	// </div>
	function processDelayedContent() {
		var queryParams = getQueryParams();
		$$(".delayed").each(function(element) {
			var showDateText = "";
			
			// one option: another class attribute with the date/time to show it
			var classes = element.className.split(/[ ]+/);
			for (var i = 0; i < classes.length; i++) {
				if (classes[i].match(/delayed_/)) {
					// "delayed_May_24_2011_11__00_PM"
					showDateText = classes[i].replace(/delayed_/, "");
					showDateText = showDateText.replace(/__/g, ":");
					showDateText = showDateText.replace(/_/g, " ");
				}
			}
			
			// other option: a span with the date/time to show it
			if (!showDateText) {
				var showDateSpan = element.select(".showdate")[0];
				if (showDateSpan) {
					showDateText = showDateSpan.innerHTML;
					showDateSpan.parentNode.removeChild(showDateSpan);
				}
			}
			
			// can also have a "hide date" where the element will go away
			var hideDateText = "";
			var hideDateSpan = element.select(".hidedate")[0];
			if (hideDateSpan) {
				hideDateText = hideDateSpan.innerHTML;
				hideDateSpan.parentNode.removeChild(hideDateSpan);
			}

			var now = new Date();
			if (showDateText) {
				var showDate = new Date(Date.parse(showDateText));
				if (showDate && (queryParams["ta"] || now >= showDate)) {
					element.show();
				}
			}
			
			if (hideDateText) {
				var hideDate = new Date(Date.parse(hideDateText));
				if (hideDate && now >= hideDate) {
					element.hide();
				}
			}
		});
	}

	// Makes "section cells" link to building info about that section.
	function sectionCellLinks() {
		$$(".sectioncell").each(function(el) {
			// "http://www.cs.washington.edu/education/courses/cse190m/10su/staff.shtml" -> "190"
			var course = location.href.replace(/.*\/cse([0-9]{3,4})[a-z]?\/.*/, "$1");
			var quarter = "AUT2011";

			// "http://www.cs.washington.edu/education/courses/cse190m/10su/staff.shtml" -> "10 su"
			var qtrStr = location.href.replace(/.*\/([0-9]{2})([a-zA-Z]{2})\/.*/, "$1 $2");

			var today = new Date();
			var year = today.getYear() + 1900;
			
			var qtrMap = {
				"wi" : "WIN",
				"sp" : "SPR",
				"su" : "SUM",
				"au" : "AUT"
			};
			
			if (qtrStr.length > 0) {
				var tokens = qtrStr.split(/ /);
				if (tokens.length >= 2) {
					year = parseInt(tokens[0], 10) + 2000;
					var qtr = qtrMap[tokens[1]];
					quarter = qtr + year;
				}
			}
			
			el.update("<a target=\"_blank\" href=\"http://www.washington.edu/students/timeschd/" + quarter + "/cse.html#cse" + course + "\">" + el.innerHTML + "</a>");
		});
	}

	// for debugging; shows all delayed elements on the page.
	function showDelayed() {
		$$(".delayed").each(function(element) {
			element.show();
		});
	}
	
	// Colors every other row of tables that have the class 'color_alternating_rows'
	// or the class 'zebrastripe'.
	function zebraStripes() {
		var rows = $$("table.color_alternating_rows tr");
		for (var i = 0; i < rows.length; i += 2) {
			// color every other row gray
			rows[i].addClassName("evenrow");
		}
		rows = $$("table.zebrastripe tr");
		for (var i = 0; i < rows.length; i += 2) {
			// color every other row gray
			rows[i].addClassName("evenrow");
		}
	}


	document.observe("dom:loaded", function() {
		// handle zebra-striping on HTML tables as indicated
		zebraStripes();

		// place links around email addresses
		emailAddressLinks();
		
		// place links to maps to campus buildings
		buildingMapLinks();

		// make links with the class 'popup' show in a new window
		$$("a.popup").each(function(element) {
			element.target = "_blank";
		});
		
		// auto-insert dates on "date" spans
		insertDates();
		
		// show any "delayed" links such as labs or sections to pop up on certain dates
		processDelayedContent();
		
		// put up a warning if this is not the current quarter's web site
		checkPageOutOfDate();
		
		if (location.href.match(/lectures.[s]?html/)) {
			plusMinusLinks();   // set +/- icons to expand/collapse various groups of files
			highlightCurrentDate();

			if ($("maximizelink")) {
				$("maximizelink").href = "#";
				$("maximizelink").observe("click", function() {
					this.siblings().each(Element.toggle);
					return false;
				});
			}
		}
	});
})();


// UTILITY FUNCTIONS

/** Deletes whitespace from the front of the given string. */
String.prototype.ltrim = function() {
	for (var k = 0; k < this.length && this.charAt(k) <= " "; k++) {
	}
	return this.substring(k, this.length);
};

/** Inserts spaces at the front of the given string until it reaches the given length,
 *  then returns the padded string.
 */
String.prototype.padL = function(length, nbsp) {
	var str = this;
	while (str.length < length) {
		str = (nbsp ? "&nbsp;" : " ") + str;
	}
	return str;
};

/** Inserts spaces at the front of the given string until it reaches the given length,
 *  then returns the padded string.
 */
String.prototype.padR = function(length, nbsp) {
	var str = this;
	while (this.length < length) {
		str = str + (nbsp ? "&nbsp;" : " ");
	}
	return str;
};

/** Deletes whitespace from the end of the given string. */
String.prototype.rtrim = function() {
	for ( var j = this.length - 1; j >= 0 && this.charAt(j) <= " "; j--) {
	}
	return this.substring(0, j + 1);
};

/** Converts escape sequences into visible characters. */
String.prototype.toPrintableChar = function() {
	if (this == "\n") {
		return "\\n";
	} else if (this == "\r") {
		return "\\r";
	} else if (this == "\t") {
		return "\\t";
	} else if (this == " " && navigator.userAgent.match(/Internet Explorer/)) {
		return "&nbsp;";   // IE sux
	} else {
		return this;
	}
};

/** Deletes whitespace from the front and end of the given string. */
String.prototype.trim = function() {
	return this.ltrim().rtrim();
};



/*
// old functions I used before Prototype
getElementsByClassName = function(tagName, className, root) {
	var elements;
	if (!root) {
		root = document;
	}
	elements = root.getElementsByTagName(tagName);
	
	if (!(className instanceof Array)) {
		className = [className];
	}

	var result = [];
	for (var i = 0; i < elements.length; i++) {
		for (var j = 0; j < className.length; j++) {
			if (hasClass(elements[i], className[j])) {
				result.push(elements[i]);
			}
		}
	}
	return result;
};

hasClass = function(element, className) {
	if (!element) {
		return false;
	} else if (!className || className == "*") {
		return true;
	} else if (!element.className) {
		return false;
	}
	
	var classes = getClasses(element);
	for (var i = 0; i < classes.length; i++) {
		if (classes[i] == className) {
			return true;
		}
	}
	return false;
};

getClasses = function(element) {
	return element.className.split(/\s+/);
};
*/