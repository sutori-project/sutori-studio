declare var App: SutoriBuilderApp


class SutoriBuilderApp {
	private _loadedDocument?: SutoriDocument;
	private _culture: SutoriCulture = SutoriCulture.None;
	private _thumbs: Map<string, HTMLImageElement>;
	
	
	public readonly WebMode: boolean;
	public readonly MainElement: HTMLElement;
	public readonly Moments: MomentFlow;
	public readonly Sidebar: SidebarFlow;
	public readonly Dialogs: DialogFlow;
	public CurrentDirectory: string;
	public CurrentFilename: string;
	public CurrentName: string;
	public get SelectedCulture() : SutoriCulture { return this._culture; }


	get Document() : SutoriDocument { return this._loadedDocument; }


	constructor(webMode: boolean) {
		if (typeof globalThis.App !== 'undefined')
			throw new Error("Tried to create more than one instance of SutoriApp");

		this.WebMode = webMode;
		this.MainElement = document.querySelector('.app');
		this.Moments = new MomentFlow;
		this.Sidebar = new SidebarFlow;
		this.Dialogs = new DialogFlow;
		this.CurrentDirectory = '';
		this.CurrentFilename = '';
		this.CurrentName = '';
		this._loadedDocument = new SutoriDocument;
		this._thumbs = new Map<string, HTMLImageElement>();
		this.Sidebar.Reset();
		this.Moments.Reset();
	}


	/**
	 * Initialize the builder app.
	 */
	static init(webMode: boolean = false) {
		if (typeof globalThis.App == 'undefined') {
			// create the singleton.
			const app = globalThis.App = new SutoriBuilderApp(webMode);
			
			// attach ui events.
			const menu = app.MainElement.querySelector('.main-menu');
			
			app.AttachEvent('li[action="new"]', 'click', app.NewFile);
			app.AttachEvent('li[action="open"]', 'click', app.OpenFile);
			app.AttachEvent('li[action="save-as"]', 'click', app.SaveAsFile);
			app.AttachEvent('li[action="exit"]', 'click', app.Exit);
			app.AttachEvent('li[action="help-website"]', 'click', app.GotoHelpWebsite);
			
			document.addEventListener('keydown', app.HandleKeyDown);
			document.addEventListener('keyup', app.HandleKeyUp);

			const body = document.body as HTMLBodyElement;
			body.addEventListener('contextmenu', app.HandleContextMenu);

			document.querySelectorAll('li[action="change-lang"]').forEach(li => {
				li.addEventListener('click', app.HandleChangeLang);
			});

			// disable edge context menu shenanigans.
			window.onmouseup = event => event.preventDefault();

			console.log('loaded SutoriApp');
		}
	}


	/**
	 * Helper function for attaching events to ui elements.
	 * @param selector The css selector for the ui element.
	 * @param callback The callback function.event listener.
	 */
	private AttachEvent(selector: string, event: string, callback: EventListener) {
		document.querySelector(selector).addEventListener(event, callback);
	}


	/**
	 * Catch when a language change menuitem is clicked.
	 * @param e 
	 */
	private HandleChangeLang(e: MouseEvent) {
		const li = e.target as HTMLElement;
		const lang = li.dataset['lang'] as SutoriCulture;
		App._culture = SutoriCulture[lang];

		// remove focus from the menu item (with slight delay so user can see it happened).
		setTimeout(() => {
			li.blur();
		}, 300);

		// remove active from previous li.
		li.parentElement.querySelector('li[checked="true"]').setAttribute('checked', null);
		li.setAttribute('checked', 'true');
		//console.log("Changed lang to", lang);

		// update the moment texts to display correct text for lang.
		for (var i=0; i<App.Document.Moments.length; i++) {
			const moment = App.Document.Moments[i];
			const rowElement = App.Moments.MainElement.querySelector('.moment-flow .moment-row:nth-of-type('+(i+1)+')');
			const momentElement = rowElement.querySelector('.moment') as HTMLElement;
			const editor = rowElement.querySelector('.moment-body') as HTMLElement;
			editor.innerText = moment.GetText(App._culture);

			// switch the options.
			const optionsContainer = rowElement.querySelector('.moment-options');
			optionsContainer.innerHTML = '';
			moment.GetOptions(App._culture).forEach(option => {
				App.Moments.AddOption(momentElement, option.Text);
			});

			// switch the media.
			const mediaContainer = rowElement.querySelector('.moment-media');
			mediaContainer.innerHTML = '';
			moment.GetImages(App._culture).forEach(image => {
				App.Moments.AddImage(momentElement, '');
			});
		}
	}


	/**
	 * Catch events related to the keydown event.
	 */
	private HandleKeyDown(e: KeyboardEvent) {
		switch (e.key) {
			case 'F5':
				console.log('reload prevented');
				e.preventDefault();
				return false;
			case 'r':
				if (e.ctrlKey) {
					console.log('reload prevented');
					e.preventDefault();
					return false;
				}
			case 'Enter':
				const target = e.target as HTMLElement;
				if (target.classList.contains('group-name')) {
					// Enter ends renaming group names.
					target.blur();
					e.preventDefault(); // stop bubbling.
				}
				break;
		}
	}


	/**
	 * Catch events related to the keyup event.
	 */
	private async HandleKeyUp(e: KeyboardEvent) {
		const self = App;
		switch (e.key) {
			/* f2 to rename things */
			case 'F2':
				const f2target = e.target as HTMLElement;
				if (f2target.classList.contains('group')) {
					// F2 for editing group names.
					const editor = f2target.querySelector('span[contenteditable]') as HTMLElement;
					editor.setAttribute("contenteditable", 'true');
					editor.focus();
					editor.onblur = function() {
						const group = f2target.parentElement.dataset['group'];
						const index = ExtraTools.GetElementIndex(f2target);
						console.log("Ended editing for this:", group, index);
						switch (group) {
							case 'includes':
								self.Document.Includes[index].Path = editor.textContent;
								break;
							case 'actors':
								self.Document.Actors[index].Name = editor.textContent;
								break;
						}						
						editor.setAttribute("contenteditable", 'false');
					};
				}
				break;
			
			/* certain things can be deleted when they have focus */
			case 'Delete':
				const delTarget = e.target as HTMLElement;
				if (delTarget.classList.contains('group')) {
					let button = '';
					const message = "Are you sure you wish to delete this?";
					
					if (App.WebMode == true) {
						button = confirm(message) ? 'OK' : 'CANCEL';
					}
					else {
						// @ts-ignore
						button = await Neutralino.os.showMessageBox('Confirm', message, 'OK_CANCEL', 'QUESTION');
					}
					
					// Delete for editing group names.
					if (button == 'OK') {
						const group = delTarget.parentElement.dataset['group'];
						const index = ExtraTools.GetElementIndex(delTarget);
						if (index > -1) {
							switch (group) {
								case 'includes':
									self.Document.Includes.splice(index, 1);
									break;
								case 'actors':
									self.Document.Actors.splice(index, 1);
									break;
							}			
							console.log("Deleted ", group, index);
							delTarget.remove();
						}
					}

					//if (confirm("Are you sure you wish to delete this?")) {
					//	delTarget.remove();
					//}
				}
				break;

			/* main menu keyboard shortcuts */
			case 'f':
				if (e.altKey) (document.querySelector('.tl-item-file') as HTMLElement).focus();
				break;
			case 'l':
				if (e.altKey) (document.querySelector('.tl-item-lang') as HTMLElement).focus();
				break;
			case 'h':
				if (e.altKey) (document.querySelector('.tl-item-help') as HTMLElement).focus();
				break;

			/* main menu traversal */
			case 'ArrowUp':
				const upEle = e.target as HTMLElement;
				if (upEle.classList.contains('tl-child')) {
					const upEleNext = upEle.previousElementSibling as HTMLElement;
					if (upEleNext == null) return;
					if (typeof upEleNext !== 'undefined' && upEle.classList.contains('tl-child')) upEleNext.focus();
				}
				break;
			case 'ArrowDown':
				const downEle = e.target as HTMLElement;
				if (downEle.classList.contains('tl-item')) (downEle.querySelector('li:first-of-type') as HTMLElement).focus();
				if (downEle.classList.contains('tl-child')) {
					const downEleNext = downEle.nextElementSibling as HTMLElement;
					if (downEleNext == null) return;
					if (typeof downEleNext !== 'undefined' && downEleNext.classList.contains('tl-child')) downEleNext.focus();
				}
				break;
			case 'Enter':
				const enterEle = e.target as HTMLElement;
				if (enterEle.classList.contains('tl-child')) enterEle.click();
				break;
			
			default:
				//console.log(e);
				break;
		}
	}


	private HandleContextMenu(e: MouseEvent) {
		const target = e.target as HTMLElement;
		const tagname = target.tagName.toLowerCase();
		const inputType = target instanceof HTMLInputElement ? (target as HTMLInputElement).type : '';

		// allow certain elements to have the context menu
		if (target.hasAttribute('contenteditable') || (tagname == 'input' && inputType == 'text')
			|| tagname == 'textarea') {
			return true;
		}

		//console.log("Context event fired by", target);
		//console.log("Context event fired by tagname", target.tagName);
		e.preventDefault();
		return false;
	}


	/**
	 * Call this to initiate creating a new document.
	 */
	public async NewFile() {
		const message = 'Are you sure you wish to do this?';
		console.log('new clicked', App.WebMode);

		if (App.WebMode == true) {
			if (confirm(message) == true) {
				await App.Reset();
				await App.SetCurrentFile("");
			}
		}
		else {
			// @ts-ignore
			let button = await Neutralino.os.showMessageBox('New Document',
							 message, 'OK_CANCEL', 'QUESTION');
			if (button == 'OK') {
				await App.Reset();
				await App.SetCurrentFile("");
			}
		}
	}


	/**
	 * Open a file for editing.
	 */
	public async OpenFile() {
		const self = App;

		console.log('open clicked');

		if (self.WebMode) {
			// @ts-ignore
			if (typeof window.showOpenFilePicker === 'undefined') {
				alert('Error, your browser does not support the filesystem api.');
				return;
			}
			let fileHandle = '';
			// @ts-ignore
			[fileHandle] = await window.showOpenFilePicker() as FileSystemFileHandle;
			// @ts-ignore
			const file = await fileHandle.getFile();
			const contents = await file.text();
			await self._OpenFileData(contents);
		}
		else {

			// @ts-ignore
			let entries = await Neutralino.os.showOpenDialog('Open Sutori Document', {
				filters: [
				{name: 'Sutori XML Document', extensions: ['xml']},
				{name: 'All files', extensions: ['*']}
				]
			});
			if (entries.length > 0) {
				const file = entries[0];
				await App.SetCurrentFile(file);
				// @ts-ignore
				const data = await Neutralino.filesystem.readFile(file);
				await self._OpenFileData(data);
			}

		}

		
	}


	/**
	 * @param data 
	 */
	private async _OpenFileData(data: any) {
		const self = App;

		// clean up the ui first.
		await self.Reset();
		const doc = self._loadedDocument = new SutoriDocument();
		doc.CustomUriLoader = async function(uri: String) {
			// we don't want to load dependencies, so just return nothing.
			return '';
		};
		await doc.AddDataFromXml(data);

		// add the includes.
		doc.Includes.forEach((include: SutoriInclude) => {
			const includeElement = self.Sidebar.AddInclude(include.Path, false);
		});

		// add the actors.
		doc.Actors.forEach((actor: SutoriActor) => {
			let color = '';
			if (typeof actor.Attributes['color'] !== "undefined") {
				color = actor.Attributes['color'];
			}
			const actorElement = self.Sidebar.AddActor(actor.Name, actor.ID, color, false);
		});

		// add the moments.
		doc.Moments.forEach(async(moment: SutoriMoment) => {
			const text = moment.GetText(self._culture);
			const momentElement = self.Moments.AddRow(text, moment.ID, moment.Actor, false);

			// switch the options.
			const optionsContainer = momentElement.querySelector('.moment-options');
			optionsContainer.innerHTML = '';
			moment.GetOptions(App._culture).forEach(option => {
				App.Moments.AddOption(momentElement, option.Text);
			});

			// switch the media.
			const mediaContainer = momentElement.querySelector('.moment-media');
			mediaContainer.innerHTML = '';
			moment.GetImages(App._culture).forEach(async image => {

				/* -- find or gen thumb -- */
				let src = '';
				if (!ExtraTools.IsEmptyString(image.ResourceID)) {
					const resource = doc.GetResourceByID(image.ResourceID) as SutoriResourceImage;
					if (resource instanceof SutoriResourceImage) {
						src = await App.GetThumbnailDataUri(resource.ID, resource.Src);
					}
				}
				/* -- find or gen thumb -- */

				App.Moments.AddImage(momentElement, src);
			});
		});

		// add the resources.
		doc.Resources.forEach((resource: SutoriResource) => {
			if (resource instanceof SutoriResourceImage) {
				const resourceElement = self.Sidebar.AddImageResource(resource.Name, resource.ID, false);
			}
		});
	}


	/**
	 * Save a file.
	 */
	public async SaveAsFile() {
		const self = App;

		console.log('save-as clicked');

		// create the xml template.
		const doc = document.implementation.createDocument(null, 'document');
		// serialize the content into the doc.
		self.SerializeDoc(doc);
		// serialize the doc into pure xml.
		const xml = ExtraTools.StringifyXml(doc);
		let saved = false;

		if (self.WebMode) {

			// @ts-ignore
			if (typeof window.showSaveFilePicker === 'undefined') {
				alert('Error, your browser does not support the filesystem api.');
				return;
			}
			const options = {
				types: [
					{
						description: 'Xml Files',
						accept: { 'application/xml': ['.xml'] },
					},
				],
			};
			// @ts-ignore
			const fileHandle = await window.showSaveFilePicker(options) as FileSystemFileHandle;
			// Create a FileSystemWritableFileStream to write to.
			// @ts-ignore
  			const writable = await fileHandle.createWritable();
			// Write the contents of the file to the stream.
			await writable.write(xml);
			// Close the file and write the contents to disk.
			await writable.close();
			saved = true;

		}
		else {

			// @ts-ignore
			let file = await Neutralino.os.showSaveDialog('Save Sutori Document', {
				title: 'new_document.xml',
				defaultPath: 'untitled.xml',
				filters: [
					{name: 'Sutori XML Document', extensions: ['xml']},
					{name: 'All files', extensions: ['*']}
				]
			});
			if (file.length > 0) {
				// @ts-ignore
				await Neutralino.filesystem.writeFile(file, xml);
				await App.SetCurrentFile(file);
				saved = true;
			}

		}

		if (saved == true) {
			console.log("Saved!");
			alert('Saved!');
		}
	}


	/**
	 * Serialize the loaded document into an XmlDocument.
	 * @param doc The destination document.
	 */
	private SerializeDoc(doc: XMLDocument) {
		const self = this;
		const src = self._loadedDocument;
		const root = doc.childNodes[0];
		
		// serialize includes.
		for (var i=0; i<src.Includes.length; i++) {
			const includeElement = root.appendChild(doc.createElement('include')) as HTMLElement;
			includeElement.textContent = src.Includes[i].Path;
			if (src.Includes[i].After) {
				includeElement.setAttribute('after', 'true');
			}
		}

		// serialize the resources.
		const resources = root.appendChild(doc.createElement('resources')) as HTMLElement;
		for (var i=0; i<src.Resources.length; i++) {
			const resource = src.Resources[i];
			if (resource instanceof SutoriResourceImage) {
				const resourceElement = resources.appendChild(doc.createElement('image')) as HTMLElement;
				if (!ExtraTools.IsEmptyString(resource.ID)) resourceElement.setAttribute('id', resource.ID);
				if (!ExtraTools.IsEmptyString(resource.Name)) resourceElement.setAttribute('name', resource.Name);
				if (!ExtraTools.IsEmptyString(resource.Src)) resourceElement.setAttribute('src', resource.Src);
				if (resource.Preload === true) resourceElement.setAttribute('preload', 'true');
				// apply the attributes.
				for (const [key, value] of Object.entries(resource.Attributes)) {
					resourceElement.setAttribute(key, value);
				}
			}
		}

		// serialize the actors.
		const actors = root.appendChild(doc.createElement('actors')) as HTMLElement;
		for (var i=0; i<src.Actors.length; i++) {
			const actor = src.Actors[i];
			const actorElement = actors.appendChild(doc.createElement('actor')) as HTMLElement;
			if (!ExtraTools.IsEmptyString(actor.ID)) actorElement.setAttribute('id', actor.ID);
			actorElement.setAttribute('name', actor.Name);
			// apply the attributes.
			for (const [key, value] of Object.entries(actor.Attributes)) {
				actorElement.setAttribute(key, value);
			}
		}

		// serialize moments.
		const moments = root.appendChild(doc.createElement('moments')) as HTMLElement;
		for (var i=0; i<src.Moments.length; i++) {
			const moment = src.Moments[i];
			const momentElement = moments.appendChild(doc.createElement('moment')) as HTMLElement;

			// moment attributes.
			if (moment.Clear === true) momentElement.setAttribute('clear', 'true');
			if (!ExtraTools.IsEmptyString(moment.ID)) momentElement.setAttribute('id', moment.ID);
			if (!ExtraTools.IsEmptyString(moment.Actor)) momentElement.setAttribute('actor', moment.Actor);
			if (!ExtraTools.IsEmptyString(moment.Goto)) momentElement.setAttribute('goto', moment.Goto);
			// apply the attributes.
			for (const [key, value] of Object.entries(moment.Attributes)) {
				momentElement.setAttribute(key, value);
			}

			// serialize the elements.
			for (var j=0; j<moment.Elements.length;j++) {
				const element = moment.Elements[j];

				if (element instanceof SutoriElementText)
				{
					const text = element as SutoriElementText;
					const te = momentElement.appendChild(doc.createElement('text')) as HTMLElement;
					te.textContent = text.Text;
					if (text.ContentCulture !== SutoriCulture.None) te.setAttribute('lang', text.ContentCulture);
				}
				else if (element instanceof SutoriElementOption)
				{
					const option = element as SutoriElementOption;
					const oe = momentElement.appendChild(doc.createElement('option')) as HTMLElement;
					oe.textContent = option.Text;
					if (option.ContentCulture !== SutoriCulture.None) oe.setAttribute('lang', option.ContentCulture);
					if (option.Solver !== SutoriSolver.None) oe.setAttribute('solver', option.Solver);
					if (!ExtraTools.IsEmptyString(option.Target)) oe.setAttribute('target', option.Target);
					if (!ExtraTools.IsEmptyString(option.SolverCallback)) oe.setAttribute('solver', option.SolverCallback);
				}
				else if (element instanceof SutoriElementImage)
				{
					const image = element as SutoriElementImage;
					const ie = momentElement.appendChild(doc.createElement('image')) as HTMLElement;
					if (image.ContentCulture !== SutoriCulture.None) ie.setAttribute('lang', image.ContentCulture);
					if (!ExtraTools.IsEmptyString(image.ResourceID)) ie.setAttribute('resource', image.ResourceID);
					if (!ExtraTools.IsEmptyString(image.Actor)) ie.setAttribute('actor', image.Actor);
					if (!ExtraTools.IsEmptyString(image.For)) ie.setAttribute('for', image.For);
				}
				else if (element instanceof SutoriElementSet)
				{
					const setter = element as SutoriElementSet;
					const se = momentElement.appendChild(doc.createElement('set')) as HTMLElement;
					if (setter.ContentCulture !== SutoriCulture.None) se.setAttribute('lang', setter.ContentCulture);
					if (!ExtraTools.IsEmptyString(setter.Name)) se.setAttribute('name', setter.Name);
					se.textContent = setter.Value;
				}
				else if (element instanceof SutoriElementTrigger)
				{
					const trigger = element as SutoriElementTrigger;
					const te = momentElement.appendChild(doc.createElement('trigger')) as HTMLElement;
					if (trigger.ContentCulture !== SutoriCulture.None) te.setAttribute('lang', trigger.ContentCulture);
					if (!ExtraTools.IsEmptyString(trigger.Action)) te.setAttribute('action', trigger.Action);
					te.textContent = trigger.Body;
				}
			}
		}

	}


	/**
	 * Reset the state of the app without prompt.
	 */
	public async Reset() {
		const self = this;
		self._loadedDocument = new SutoriDocument;
		self.Sidebar.Reset();
		self.Moments.Reset();
	}


	/**
	 * Send the user to the help website.
	 */
	public GotoHelpWebsite() {
		// @ts-ignore
		Neutralino.os.open('https://kodaloid.com');
	}


	/**
	 * Exit the app.
	 */
	public Exit() {
		// @ts-ignore
		Neutralino.app.exit();
	}


	/**
	 * Set the currently open file (also updates the window title).
	 * @param filename 
	 */
	async SetCurrentFile(filename: string) {
		console.log(filename);
		const self = this;
		// save it to the filesystem.
		const name = filename.split('\\').pop().split('/').pop();
		const path = filename.replace(name, '');
		self.CurrentDirectory = path;
		self.CurrentFilename = filename;
		self.CurrentName = name;
		// figure out weather we have a name to use for the title.
		const title = ExtraTools.IsEmptyString(name) ? 'Untitled' : name;
		// @ts-ignore
		await Neutralino.window.setTitle(`[${title}] - Sutori Studio`);
	}


	/**
	 * Gets a thumbnail for the provided URI. If a thumbnail was previously
	 * generated, that is returned instead. Returned string is a data uri
	 * that can be passed into an images src attribute.
	 * @param key 
	 * @param uri 
	 */
	async GetThumbnailDataUri(key: string, uri: string) : Promise<string> {
		if (!this._thumbs.has(key)) {
			this._thumbs[key] = await ExtraTools.GenerateThumbnail(uri);
		}
		const img = this._thumbs[key];
		return img.src;
	}
};