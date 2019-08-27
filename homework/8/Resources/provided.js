// CSE 190 M, Homework 7 (Baby Names)
// Helper script for TA grading

(function() {
	var timer = null;
	var startTime = null;
	
	// dynamically load the JStep library
	if (typeof(JStep) === "undefined" && location.search.match(/__grading=(true|on|1|yes)/)) {
		document.write('\n<script type="text/javascript" src="http://www.webstepbook.com/jstep.js"><\/script>\n');
	}
	
	var removeBG = function() {
		document.body.style.backgroundColor = document.body.oldBackgroundColor;
		document.body.removeClassName("fail");
		// $("__gradingmessages").innerHTML = "";
	};
	
	var filterOutGradingElements = function(a) {
		var a2 = [];
		for (var i = 0; i < a.length; i++) {
			var up = a[i].up("#__gradingarea");
			if (!up && a[i] != $("__gradingarea")) {
				a2.push(a[i]);
			}
		}
		return a2;
	};
	
	var $$f = function(str) {
		var elements = $$(str);
		return filterOutGradingElements(elements);
	};
	
	var tryToSelectName = function(event) {
		event.stop();
		removeBG();
		var name = this.value;
		var select = $("allnames") || $$("select")[0] || $$("input[type='text']")[0] || $$("input")[0];
		if (select) {
			// set name
			select.value = name;
			select.simulate("change");
			if (select.value != name && select.options && select.options.length > 0) {
				// some students do weird things like lowercase all the names;
				// try to find the name manually among the options
				for (var i = 0; i < select.options.length; i++) {
					if (select.options[i].textContent.trim().toLowerCase() == name.toLowerCase()) {
						select.selectedIndex = i;
						break;
					}
				}
			}
			
			if (select.tagName.toLowerCase() == "select") {
				// some students listen to onclick on the select's options instead
				if (select.selectedIndex >= 0 && select.options[select.selectedIndex]) {
					select.options[select.selectedIndex].simulate("click");
				}
			}
			
			// set gender
			if ($("genderf") && $("genderm") && $("genderf").checked != (this.gender == "f")) {
				$("genderf").checked = (this.gender == "f");
				$("genderm").checked = (this.gender == "m");
				$("genderf").simulate("change");
				$("genderm").simulate("change");
			}
			
			// simulate clicking the "Search" button
			var search = $("search");
			if (search) {
				search.simulate("mousedown");
				search.simulate("click");
			}
		}
	};
	
	var checkGraph = function(event) {
		event.stop();
		removeBG();
		if (!this.data) { return; }
		
		var divs = $$("#graph tr div");
		JStep.Test.assertEquals(this.data.length, divs.length, "should be " + this.data.length + " bars of ranking data");
		
		JStep.Test.assertStyle(divs, "width", "50px");
		var barCount = Math.min(this.data.length, divs.length);
		for (var i = 0; i < barCount; i++) {
			JStep.Test.assertStyle(divs[i], "height", (this.data[i] == 0 ? 0 : Math.floor((1000 - this.data[i]) / 4)) + "px");
			if (this.data[i] != 0) {
				JStep.Test.assertStyle(divs[i], "background-color", "rgb(255, 187, 187)", "background-color of bar #" + (i+1) + " of " + barCount);
			}
			JStep.Test.assertStyle(divs[i], "text-align", "center", "text-align of bar #" + (i+1) + " of " + barCount);
			JStep.Test.assertStyle(divs[i], "font-weight", {"bold": true, "700": true}, "font-weight of bar #" + (i+1) + " of " + barCount);
			
			// popular names, rank 1-10, should be in red
			var expectedColor = {"rgb(0, 0, 0)": true, "#000": true, "#000000": true, "black": true};   // black
			if (this.data[i] >= 1 && this.data[i] <= 10) {
				// might be in an inner tag like a span
				expectedColor = {"rgb(255, 0, 0)": true, "#F00": true, "#FF0000": true, "red": true};   // red
			}
			JStep.Test.assertStyle(divs[i], "color", expectedColor, "text color of bar #" + (i+1) + " of " + barCount);
		}
		
		JStep.Test.showResults();
	};

	var checkCelebs = function(event) {
		event.stop();
		removeBG();
		if (!this.celebs) { return; }
		
		var lis = $$("#celebs li");
		JStep.Test.assertEquals(this.celebs.length, lis.length, "should be " + this.celebs.length + " list items of celebrities");
		
		for (var i = 0; i < Math.min(this.celebs.length, lis.length); i++) {
			JStep.Test.assertEquals(this.celebs[i], lis[i].textContent.replace(/\s+/g, " ").replace(/film[s]?/g, "films").trim(), "text content of list item");
		}
		
		JStep.Test.showResults();
	};

	var checkMeaning = function(event) {
		event.stop();
		removeBG();
		if (!this.meaning) { return; }
		
		var actualMeaningText = $("originmeaning").textContent.replace(/\s+/g, " ").replace(/Searching\.\.\. /g, "").trim();
		JStep.Test.assertEquals(this.meaning, actualMeaningText, "name meaning text");
		JStep.Test.assertStyle($$("#originmeaning q"), "font-style", "italic");
		JStep.Test.showResults();
	};

	var checkFonts = function(event) {
		event.stop();
		removeBG();

		var fonts = {"Georgia, serif": true, "Georgia,serif": true, "Georgia": true};
		var tags = $$f("body, select, option:first-child, label");
		JStep.Test.assertStyle(tags, "font-family", fonts);
		JStep.Test.assertStyle(tags, "font-size", "16px");
		
		var h1s = $$f("h1");
		JStep.Test.assertStyle(h1s, "font-family", fonts);
		JStep.Test.assertStyle(h1s, "font-size", "32px");
		
		var h2s = $$f("h2");
		JStep.Test.assertStyle(h2s, "font-family", fonts);
		JStep.Test.assertStyle(h2s, "font-size", "24px");
		
		var linkImages = $$f("a img");
		JStep.Test.assert(linkImages.length >= 3, "page should have three images in bottom-right that link to validators");
		JStep.Test.assertAttribute($$f("a"), "href", [
			"https://webster.cs.washington.edu/validate-html.php",
			"https://webster.cs.washington.edu/validate-css.php",
			"https://webster.cs.washington.edu/jslint/?referer"], true);
		
		JStep.Test.showResults();
	};
	
	document.observe("dom:loaded", function() {
		// only continue if the "grading" query param is set to a truthy value
		if (typeof($_REQUEST) === "undefined" || !$_REQUEST["__grading"]) {
			return;
		}
		
		document.body.oldBackgroundColor = document.body.getStyle("backgroundColor");

		var fieldset = $(document.createElement("fieldset"));
		fieldset.id = "__gradingarea";
		fieldset.style.position = "fixed";
		fieldset.style.right = "0px";
		fieldset.style.top = "0px";
		fieldset.style.backgroundColor = "white";
		fieldset.style.borderRadius = "8px";
		fieldset.style.fontFamily = "sans-serif";
		fieldset.style.fontSize = "11pt";
		fieldset.style.fontWeight = "11pt";
		fieldset.style.zIndex = 999999;
		
		var legend = $(document.createElement("legend"));
		legend.innerHTML = "TA Grading";
		legend.style.backgroundColor = "white";
		legend.style.border = "5px solid black";
		legend.style.padding = "3px 6px";
		legend.style.borderRadius = "8px";
		legend.style.fontFamily = "sans-serif";
		legend.style.fontSize = "11pt";
		legend.style.fontWeight = "11pt";
		fieldset.appendChild(legend);
		
		// delay, error, start year
		var cbox = function(text, description) {
			var textNoSpaces = text.replace(/[ \t]+/, "");
			var checkBox = $(document.createElement("input"));
			checkBox.type = "checkbox";
			checkBox.name = textNoSpaces.toLowerCase();
			checkBox.id = "__grading_" + textNoSpaces;
			if (typeof(checkBox.remember) === "function") {
				checkBox.remember();
			}
			
			var label = $(document.createElement("label"));
			label.appendChild(checkBox);
			label.appendChild(document.createTextNode(" " + text));

			var div = $(document.createElement("div"));
			div.title = description;
			div.appendChild(label);
			fieldset.appendChild(div);
		};
		cbox("Delay 3 sec", "Makes babynames.php delay by 3 sec before returning its results.");
		cbox("Delay 0 sec", "Makes babynames.php delay by 0 sec before returning its results.");
		cbox("Error", "Makes babynames.php always throw an HTTP 400 error for any request.");
		cbox("Start Year", "Makes babynames.php use randomly chosen starting years other than 1900.");
		cbox("Randomize", "Shuffles up the names in babynames.php's data set rather than returning them all in ABC order.  Useful to test to make sure students aren't relying on ABC order in their code.");
		
		// buttons for people's names to try as test cases
		var buttons = function(text, gender, data, celebs, meaning) {
			var isBlank = text == "(choose a name)";
			var butt = $(document.createElement("button"));
			butt.value = isBlank ? null : text;
			butt.gender = gender;
			butt.data = data;
			butt.innerHTML = text + ", " + gender;
			butt.style.minWidth = "10em";
			butt.title = "A shortcut for choosing '" + text + "' from the names list.";
			butt.observe("click", tryToSelectName);
			butt.style.fontFamily = "sans-serif";
			butt.style.fontSize = "11pt";
			butt.style.fontWeight = "normal";
			
			var butt2 = $(document.createElement("button"));
			butt2.innerHTML = '<img src="https://www.cs.washington.edu/education/courses/cse190m/12sp/homework/5/check.gif" alt="icon" /> graph';
			butt2.butt = butt;
			butt2.name = text;
			butt2.gender = gender;
			butt2.data = data;
			butt2.observe("click", checkGraph);
			butt2.style.fontFamily = "sans-serif";
			butt2.style.fontSize = "11pt";
			butt2.style.fontWeight = "normal";
			
			var butt3 = $(document.createElement("button"));
			butt3.innerHTML = '<img src="https://www.cs.washington.edu/education/courses/cse190m/12sp/homework/5/check.gif" alt="icon" /> celebs';
			butt3.butt = butt;
			butt3.name = text;
			butt3.gender = gender;
			butt3.celebs = celebs;
			butt3.observe("click", checkCelebs);
			butt3.style.fontFamily = "sans-serif";
			butt3.style.fontSize = "11pt";
			butt3.style.fontWeight = "normal";
			
			var butt4 = $(document.createElement("button"));
			butt4.innerHTML = '<img src="https://www.cs.washington.edu/education/courses/cse190m/12sp/homework/5/check.gif" alt="icon" /> meaning';
			butt4.butt = butt;
			butt4.name = text;
			butt4.meaning = meaning;
			butt4.observe("click", checkMeaning);
			butt4.style.fontFamily = "sans-serif";
			butt4.style.fontSize = "11pt";
			butt4.style.fontWeight = "normal";
			
			var div = $(document.createElement("div"));
			div.appendChild(butt);
			if (!isBlank) {
				div.appendChild(butt4);
				div.appendChild(butt2);
				div.appendChild(butt3);
			}
			fieldset.appendChild(div);
		};
		
		buttons("Aaliyah", "f", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 211, 56],
			["Aaliyah Madyun (1 films)",
			"Aaliyah Mahoney (1 films)",
			"Aaliyah Miller (1 films)"],
			"Origin/Meaning: The name AALIYAH means ... Arabic Feminine form of AALI");
		buttons("Aaliyah", "m", null, null,
			"Origin/Meaning: The name AALIYAH means ... Arabic Feminine form of AALI");
		buttons("Alice", "f", [14, 10, 15, 20, 32, 57, 119, 201, 328, 346, 422, 172],
			["Alice Joyce (196 films)",
			"Alice Tissot (134 films)",
			"Alice Treff (101 films)",
			"Alice Lake (85 films)",
			"Alice Brady (80 films)",
			"Alice Davenport (75 films)",
			"Alice Howell (65 films)",
			"Alice Sapritch (57 films)",
			"Alice Krige (55 films)",
			"Alice Day (51 films)"],
			"Origin/Meaning: The name ALICE means ... English, French Short form of the Old French Adelais, itself a short form of Adalheidis (see ADELAIDE).");
		buttons("Don", "m", [219, 191, 148, 68, 62, 107, 115, 203, 319, 554, 828, 0],
			["Don Brodie (214 films)",
			"Don Beddoe (187 films)",
			"Don Messick (165 films)",
			"Don 'Red' Barry (146 films)",
			"Don Fernando (133 films)",
			"Don Haggerty (111 films)",
			"Don Muraco (95 films)",
			"Don S. Davis (88 films)",
			"Don Barclay (86 films)",
			"Don Ameche (84 films)"],
			"Origin/Meaning: The name DON means ... English Short form of DONALD");
		buttons("Edward", "f", [0, 0, 909, 679, 0, 0, 0, 0, 0, 0, 0, 0], 
			["Edward Tierney (1 films)"],
			"Origin/Meaning: The name EDWARD means ... English, Polish Means \"rich guard\", derived from the Old English elements ead \"rich, blessed\" and weard \"guard\".");
		buttons("Edward", "m", [9, 9, 8, 10, 16, 22, 26, 31, 52, 68, 108, 136],
			["Edward Peil Sr. (336 films)",
			"Edward Earle (329 films)",
			"Edward Hearn (325 films)",
			"Edward Keane (291 films)",
			"Edward Gargan (290 films)",
			"Edward Dillon (287 films)",
			"Edward LeSaint (281 films)",
			"Edward Brady (265 films)",
			"Edward Asner (188 films)",
			"Edward Everett Horton (146 films)"],
			"Origin/Meaning: The name EDWARD means ... English, Polish Means \"rich guard\", derived from the Old English elements ead \"rich, blessed\" and weard \"guard\".");
		buttons("Ethel", "f", [8, 13, 30, 65, 106, 176, 359, 692, 0, 0, 0, 0],
			["Ethel Clayton (161 films)",
			"Ethel Wales (127 films)",
			"Ethel Griffies (91 films)",
			"Ethel Grandin (70 films)",
			"Ethel Grey Terry (50 films)",
			"Ethel Merman (45 films)",
			"Ethel Reschke (41 films)",
			"Ethel Barrymore (41 films)",
			"Ethel Shannon (33 films)",
			"Ethel Marie Burton (33 films)"],
			"Origin/Meaning: The name ETHEL means ... English Old short form of beginning with the Old English element el meaning \"noble\".");
		buttons("Lisa", "f", [0, 0, 0, 0, 733, 220, 6, 2, 16, 64, 295, 720], 
			["Lisa Comshaw (134 films)",
			"Lisa Ortiz (73 films)",
			"Lisa Kreuzer (68 films)",
			"Lisa Gastoni (55 films)",
			"Lisa De Leeuw (54 films)",
			"Lisa Golm (48 films)",
			"Lisa Helwig (45 films)",
			"Lisa Eilbacher (38 films)",
			"Lisa Hartman (37 films)",
			"Lisa Boyle (37 films)"],
			"Origin/Meaning: The name LISA means ... English, German, Swedish Short form of ELIZABETH or ELISABETH.");
		buttons("Morgan", "m", [410, 392, 478, 579, 507, 636, 499, 446, 291, 278, 332, 518],
			["Morgan Wallace (119 films)",
			"Morgan Freeman (99 films)",
			"Morgan Farley (56 films)",
			"Morgan Woodward (42 films)",
			"Morgan Jones (36 films)",
			"Morgan Conway (33 films)",
			"Morgan Upton (31 films)",
			"Morgan Paull (23 films)",
			"Morgan Brown (19 films)",
			"Morgan Jones (18 films)"],
			"Origin/Meaning: The name MORGAN means ... Welsh, English From the Old Welsh masculine name Morcant, which was possibly derived from Welsh mor \"sea\" and cant \"circle\".");
		buttons("Morgan", "f", [0, 0, 0, 0, 0, 0, 0, 0, 244, 58, 25, 63],
			["Morgan Fairchild (75 films)",
			"Morgan Brittany (39 films)",
			"Morgan Lofting (17 films)",
			"Morgan Brayton (14 films)",
			"Morgan Nagler (9 films)",
			"Morgan Fairlane (9 films)",
			"Morgan Hallet (6 films)",
			"Morgan Fox (6 films)",
			"Morgan Reese Fairhead (3 films)",
			"Morgan Vukovic (3 films)"],
			"Origin/Meaning: The name MORGAN means ... Welsh, English From the Old Welsh masculine name Morcant, which was possibly derived from Welsh mor \"sea\" and cant \"circle\".");
		buttons("Mogran", "m", null, null, 
			"Origin/Meaning: The name MOGRAN means ... Top scientists are still trying to figure out what the heck this name means. For now, it is a mystery!");
		buttons("Stephanie", "f", [741, 423, 371, 682, 320, 122, 91, 17, 13, 7, 40, 126],
			["Stephanie Beacham (54 films)",
			"Stephanie McMahon (51 films)",
			"Stephanie Morgenstern (48 films)",
			"Stephanie Zimbalist (40 films)",
			"Stephanie Longfellow (39 films)",
			"Stephanie Swift (38 films)",
			"Stephanie Rage (33 films)",
			"Stephanie Faracy (28 films)",
			"Stephanie Cole (25 films)",
			"Stephanie Beaton (25 films)"],
			"Origin/Meaning: The name STEPHANIE means ... English, German Feminine form of STEPHEN");
		buttons("Taylor", "f", [0, 0, 0, 0, 0, 0, 0, 0, 712, 46, 10, 36],
			["Taylor St. Clair (62 films)",
			"Taylor Wayne (29 films)",
			"Taylor Hayes (22 films)",
			"Taylor Gilbert (15 films)",
			"Taylor Moore (12 films)",
			"Taylor Fry (12 films)",
			"Taylor Dayne (12 films)",
			"Taylor Simpson (11 films)",
			"Taylor Anne Reid (9 films)",
			"Taylor Stanley (9 films)"],
			"Origin/Meaning: The name TAYLOR means ... English Derived from Middle English taillour meaning \"cutter of cloth\".");
		buttons("Taylor", "m", [304, 471, 608, 702, 716, 748, 793, 762, 311, 64, 136, 328],
			["Taylor Holmes (78 films)",
			"Taylor Negron (57 films)",
			"Taylor Mead (36 films)",
			"Taylor Lacher (29 films)",
			"Taylor Nichols (23 films)",
			"Taylor Hanson (15 films)",
			"Taylor Graves (9 films)",
			"Taylor Emerson (7 films)",
			"Taylor Hawkins (6 films)",
			"Taylor Abrahamse (6 films)"],
			"Origin/Meaning: The name TAYLOR means ... English Derived from Middle English taillour meaning \"cutter of cloth\".");
		buttons("Zelda", "f", [503, 431, 472, 450, 621, 888, 909, 0, 0, 0, 0, 0],
			["Zelda Keiser (48 films)",
			"Zelda Rubinstein (33 films)",
			"Zelda Sears (7 films)",
			"Zelda Harris (6 films)",
			"Zelda Tinska (6 films)",
			"Zelda Cleaver (3 films)",
			"Zelda Williams (3 films)",
			"Zelda Crosby (2 films)",
			"Zelda Webber (2 films)",
			"Zelda Q. Lin (1 films)"],
			"Origin/Meaning: The name ZELDA means ... Yiddish, English Either means \"luck\" in Yiddish or else is a short form of GRISELDA.");
		buttons("(choose a name)", "m", null, null);
		
		var appearanceDiv = $(document.createElement("div"));
		var appearanceButton = $(document.createElement("button"));
		appearanceButton.innerHTML = '<img src="https://www.cs.washington.edu/education/courses/cse190m/12sp/homework/5/check.gif" alt="icon" /> Appearance';
		appearanceButton.observe("click", checkFonts);
		appearanceButton.style.fontFamily = "sans-serif";
		appearanceButton.style.fontSize = "11pt";
		appearanceButton.style.fontWeight = "normal";
		appearanceDiv.appendChild(appearanceButton);
		fieldset.appendChild(appearanceDiv);
		
		document.body.appendChild(fieldset);
	});
})();
