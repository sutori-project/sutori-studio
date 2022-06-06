class ExtraTools {

	static RandomID() {
		return (Math.random() + 1).toString(36).substring(6);
	}
	

	static GetElementIndex(node: HTMLElement) : number {
		//console.log("Trying to get index of", node);
		return Array.prototype.indexOf.call(node.parentNode.childNodes, node);
	}


	static IsEmptyString(text?: string) {
		if (typeof text === 'undefined' || text === null || text == '') return true;
		if (text.length == 0 || text.trim().length == 0) return true;
		return false;
	}


	static StringifyXml(xmlDoc: XMLDocument) {
		const xsltDoc = new DOMParser().parseFromString([
		  // describes how we want to modify the XML - indent everything
		  '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
		  '  <xsl:strip-space elements="*"/>',
		  '  <xsl:template match="para[content-style][not(text())]">', // change to just text() to strip space in text nodes
		  '    <xsl:value-of select="normalize-space(.)"/>',
		  '  </xsl:template>',
		  '  <xsl:template match="node()|@*">',
		  '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
		  '  </xsl:template>',
		  '  <xsl:output indent="yes"/>',
		  '</xsl:stylesheet>',
		].join('\n'), 'application/xml');
		const xsltProcessor = new XSLTProcessor();    
		xsltProcessor.importStylesheet(xsltDoc);
		const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
		//const pi = resultDoc.createProcessingInstruction('xml', 'version="1.0" encoding="UTF-8"');
		//resultDoc.insertBefore(pi, resultDoc.childNodes[0]);
		return '<?xml version="1.0" encoding="UTF-8"?>\n' +
				 new XMLSerializer().serializeToString(resultDoc);
	}


	static MakeDraggable(element: HTMLElement) {
		var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		if (element.querySelector(".header")) {
			// if present, the header is where you move the DIV from:
			const header = element.querySelector(".header") as HTMLElement;
			header.onmousedown = dragMouseDown;
		} else {
			// otherwise, move the DIV from anywhere inside the DIV:
			element.onmousedown = dragMouseDown;
		}
	 
		function dragMouseDown(e) {
			e = e || window.event;
			e.preventDefault();
			// get the mouse cursor position at startup:
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragElement;
			// call a function whenever the cursor moves:
			document.onmousemove = elementDrag;
		}
	 
		function elementDrag(e) {
			e = e || window.event;
			e.preventDefault();
			// calculate the new cursor position:
			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;
			// set the element's new position:
			element.style.top = (element.offsetTop - pos2) + "px";
			element.style.left = (element.offsetLeft - pos1) + "px";
		}
	 
		function closeDragElement() {
			// stop moving when mouse button is released:
			document.onmouseup = null;
			document.onmousemove = null;
		}
	}


	static GetSolverByValue(value: string) :SutoriSolver {
		const values = Object.values(SutoriSolver);
		const index = values.indexOf(value as any);
		const keys = Object.keys(SutoriSolver);
		return keys[index] as SutoriSolver;
	}
}