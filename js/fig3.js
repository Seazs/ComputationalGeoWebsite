function checkVersion() {
	if (navigator.appVersion.charAt(0)>=3) return true;
	else return false;
}

var Current = 1

if (checkVersion()) {
	standard = new MakeArray(8)

	// liste des images a afficher
	
	standard[1].src = "https://cgm.cs.mcgill.ca/~godfried/teaching/cg-projects/98/normand/fig3_1.gif"
	standard[2].src = "https://cgm.cs.mcgill.ca/~godfried/teaching/cg-projects/98/normand/fig3_2.gif"
	standard[3].src = "https://cgm.cs.mcgill.ca/~godfried/teaching/cg-projects/98/normand/fig3_3.gif"
	standard[4].src = "https://cgm.cs.mcgill.ca/~godfried/teaching/cg-projects/98/normand/fig3_4.gif"
	standard[5].src = "https://cgm.cs.mcgill.ca/~godfried/teaching/cg-projects/98/normand/fig3_5.gif"
	standard[6].src = "https://cgm.cs.mcgill.ca/~godfried/teaching/cg-projects/98/normand/fig3_6.gif"
	standard[7].src = "https://cgm.cs.mcgill.ca/~godfried/teaching/cg-projects/98/normand/fig3_7.gif"
	standard[8].src = "https://cgm.cs.mcgill.ca/~godfried/teaching/cg-projects/98/normand/fig3_8.gif"
}

function MakeArray(n) {
	this.length = n
	for (var i = 0; i<=n; i++) {
		this[i] = new Image()
	}
	return this
}

function nextIm() {
	if (checkVersion()) {
		Current++
		if (Current > standard.length ) {
			Current = 1
		}
		document.BruteForceFig.src = standard[Current].src
	}
}

function previousIm() {
	if (checkVersion()) {
		Current = Current - 1
		if (Current < 1 ) {
			Current = 1
		}		
		document.BruteForceFig.src = standard[Current].src
	}
}
