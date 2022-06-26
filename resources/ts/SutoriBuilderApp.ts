declare var App: SutoriBuilderApp


class SutoriBuilderApp {
	private _loadedDocument?: SutoriDocument;
	private _culture: SutoriCulture = SutoriCulture.None;
	private _thumbs: Map<string, HTMLImageElement>;
	private _splitting: boolean = false;
	private _currentFile?: string = '';

	
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
			app.AttachEvent('li[action="save"]', 'click', app.Save);
			app.AttachEvent('li[action="save-as"]', 'click', app.SaveAsFile);
			app.AttachEvent('li[action="properties"]', 'click', app.Dialogs.SutoriDocumentPropertiesDialog);
			app.AttachEvent('li[action="exit"]', 'click', app.Exit);
			app.AttachEvent('li[action="help-website"]', 'click', app.GotoHelpWebsite);
			
			document.addEventListener('keydown', app.HandleKeyDown);
			document.addEventListener('keyup', app.HandleKeyUp);

			document.addEventListener('mousemove', app.SplitterMove);
			//app.AttachEvent('.mid-pane .splitter', 'mousemove', app.SplitterMove);
			app.AttachEvent('.mid-pane .splitter', 'mousedown', app.SplitterDown);
			app.AttachEvent('.mid-pane', 'mouseup', app.SplitterUp);
			

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
	private async HandleChangeLang(e: MouseEvent) {
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
			moment.GetImages(App._culture).forEach(async image => {
				App.Moments.AddImage(momentElement, image, '');
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
			await self._OpenFileData(file.fullPath ,contents);
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
				await self._OpenFileData(file, data);
			}

		}

		
	}


	/**
	 * @param data 
	 */
	private async _OpenFileData(filename: string, data: any) {
		const self = App;

		// clean up the ui first.
		await self.Reset();
		self._currentFile = filename;
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
			const rowElement = momentElement.closest('.moment-row');
		});

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
			moment.GetImages(App._culture).forEach(async image => {
				await App.Moments.AddImage(momentElement, image, '');
			});
		}

		// add the resources.
		doc.Resources.forEach((resource: SutoriResource) => {
			if (resource instanceof SutoriResourceImage) {
				const resourceElement = self.Sidebar.AddImageResource(resource.Name, resource.ID, false);
			}
		});
	}


	/**
	 * Save the current file.
	 */
	public async Save() {
		const self = App;

		if (self.WebMode || SutoriTools.IsEmptyString(self._currentFile)) {
			return await self.SaveAsFile();
		}

		// create the xml template.
		const xml = self.Document.SerializeToXml();
		let saved = false;

		// @ts-ignore
		await Neutralino.filesystem.writeFile(self._currentFile, xml);
		await App.SetCurrentFile(self._currentFile);
		console.log("Saved!");
		alert('Saved!');
	}


	/**
	 * Save a file.
	 */
	public async SaveAsFile() {
		const self = App;

		console.log('save-as clicked');

		// create the xml template.
		const xml = self.Document.SerializeToXml();
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
				title: 'Save Document',
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
	 * Reset the state of the app without prompt.
	 */
	public async Reset() {
		const self = this;
		self._loadedDocument = new SutoriDocument;
		self._currentFile = '';
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


	SplitterDown(e: MouseEvent) {
		App._splitting = true;
	}


	SplitterUp(e: MouseEvent) {
		App._splitting = false;
	}


	/**
	 * Handle the mouse moving over the splitter.
	 * @param e 
	 */
	SplitterMove(e: MouseEvent) {
		if (App._splitting) {
			let newX = e.clientX;
			if (newX < 200) newX = 200;
			if (newX > 500) newX = 500;
			document.getElementById('sidebar').style.width = newX+'px';
		}
	}


	/**
	 * Allow user to switch between primary window panes.
	 * @param tabHeader 
	 * @param paneSelector 
	 */
	SwitchPane(tabIndex: number) {
		const main_pane = document.querySelector('.main-pane');
		const currentHeader = main_pane.querySelector('.tabs-pane a.active');
		const nextHeader = main_pane.querySelectorAll('.tab-header')[tabIndex];

		currentHeader.classList.remove('active');
		nextHeader.classList.add('active');

		const selectedPane = main_pane.querySelector('.main-pane-child.active');
		const nextPane = main_pane.querySelectorAll('.main-pane-child')[tabIndex];

		selectedPane.classList.remove('active');
		nextPane.classList.add('active');
	}
};