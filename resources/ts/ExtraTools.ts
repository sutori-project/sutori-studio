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
			console.log(e);
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


	static async GenerateThumbnail( uri: any, maxWidth: number = 128) {
		let blob: Blob = null;

		if (ExtraTools.IsEmptyString(uri) || uri.includes('://') || uri.includes('data:image')) {
			const w_response = await fetch(uri);
			blob = await w_response.blob();
		}
		else {
			// assume absolute url if : is included.
			const filename = uri.includes(':') ? uri : App.CurrentDirectory + uri;
			// @ts-ignore
			const file = await Neutralino.filesystem.readBinaryFile(filename);
			blob = new Blob([new Uint8Array(file, 0, file.length)]);
		}

		// load the orig image.
		const orig_src = await ExtraTools.LoadImageDataUriFromBlob(blob);
		const orig_img = await ExtraTools.LoadImage(orig_src);
		//orig_img.setAttribute('width', maxWidth.toString());
		//orig_img.setAttribute('height', maxHeight.toString());

		// generate the thumbnail using canvas.
		const thumb_canvas = document.createElement('canvas');
		const ctx = thumb_canvas.getContext('2d');
		const scale = maxWidth / orig_img.width;
		const maxHeight = orig_img.height * scale;
		
		thumb_canvas.width =maxWidth;
		thumb_canvas.height = maxHeight;
		ctx.drawImage(orig_img, 0, 0, maxWidth, maxHeight);

		const thumb = document.createElement('img');
		thumb.src = thumb_canvas.toDataURL();

		return thumb;
	}


	static async LoadImage(src: string) : Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = src;
		 })  
	}


	static async LoadImageDataUriFromBlob(blob: Blob) : Promise<string> {
		return await new Promise((resolve, reject) => {
			const fr = new FileReader();
			fr.onloadend = function() {
				resolve(fr.result as string);
			};
			fr.readAsDataURL(blob);
		});
	}


	static GetSolverByValue(value: string) :SutoriSolver {
		const values = Object.values(SutoriSolver);
		const index = values.indexOf(value as any);
		const keys = Object.keys(SutoriSolver);
		return keys[index] as SutoriSolver;
	}
}