declare var App: SutoriBuilderApp


class SutoriBuilderApp {
	private _loadedDocument?: SutoriDocument;
	private _culture: SutoriCulture = SutoriCulture.None;
	
	
	public readonly MainElement: HTMLElement;
	public readonly Moments: MomentFlow;
	public readonly Sidebar: SidebarFlow;
	public readonly Dialogs: DialogFlow;
	public get SelectedCulture() : SutoriCulture { return this._culture; }


	get Document() : SutoriDocument { return this._loadedDocument; }


	constructor() {
		if (typeof globalThis.App !== 'undefined')
			throw new Error("Tried to create more than one instance of SutoriApp");

		this.MainElement = document.querySelector('.app');
		this.Moments = new MomentFlow;
		this.Sidebar = new SidebarFlow;
		this.Dialogs = new DialogFlow;
		this.Reset();
	}


	/**
	 * Initialize the builder app.
	 */
	static init() {
		if (typeof globalThis.App == 'undefined') {
			// create the singleton.
			const app = globalThis.App = new SutoriBuilderApp();
			
			// attach ui events.
			const menu = app.MainElement.querySelector('.main-menu');
			
			app.AttachEvent('li[action="new"]', 'click', app.NewFile);
			app.AttachEvent('li[action="open"]', 'click', app.OpenFile);
			app.AttachEvent('li[action="save-as"]', 'click', app.SaveAsFile);
			app.AttachEvent('li[action="exit"]', 'click', app.Exit);
			app.AttachEvent('li[action="help-website"]', 'click', app.GotoHelpWebsite);
			
			document.addEventListener('keydown', app.HandleKeyDown);
			document.addEventListener('keyup', app.HandleKeyUp);

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
				App.Moments.AddImage(momentElement, image.Src);
			});
		}
	}


	/**
	 * Catch events related to the keydown event.
	 */
	private HandleKeyDown(e: KeyboardEvent) {
		switch (e.key) {
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
					// @ts-ignore
					let button = await Neutralino.os.showMessageBox('Confirm',
											"Are you sure you wish to delete this?",
											'OK_CANCEL', 'QUESTION');
					
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
				console.log(e);
				break;
		}
	}


	/**
	 * Call this to initiate creating a new document.
	 */
	public async NewFile() {
		// @ts-ignore
		let button = await Neutralino.os.showMessageBox('New Document',
								 "Are you sure you wish to do this?",
								 'OK_CANCEL', 'QUESTION');

		if (button == 'OK') {
			App.Reset();
		}
	}


	/**
	 * Open a file for editing.
	 */
	public async OpenFile() {
		const self = App;

		console.log('open clicked');
		// @ts-ignore
		let entries = await Neutralino.os.showOpenDialog('Open Sutori Document', {
			filters: [
			  {name: 'Sutori XML Document', extensions: ['xml']},
			  {name: 'All files', extensions: ['*']}
			]
		});

		if (entries.length > 0) {
			const file = entries[0];
			const dir = file.substring(0, file.lastIndexOf('/')+1);

			// clean up the ui first.
			self.Reset();

			// @ts-ignore
			const data = await Neutralino.filesystem.readFile(file);
			const doc = self._loadedDocument = new SutoriDocument();
			doc.CustomUriLoader = async function(uri: String) {
				// we dont want to load dependencies, so just return nothing.
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
				const actorElement = self.Sidebar.AddActor(actor.Name, color, false);
			});

			// add the moments.
			doc.Moments.forEach((moment: SutoriMoment) => {
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
				moment.GetImages(App._culture).forEach(image => {
					App.Moments.AddImage(momentElement, image.Src);
				});
				
			});
			
			return;

			console.log("Loaded!", self._loadedDocument);
		}
	}


	/**
	 * Save a file.
	 */
	public async SaveAsFile() {
		const self = App;

		console.log('save-as clicked');
		// @ts-ignore
		let file = await Neutralino.os.showSaveDialog('Save Sutori Document', {
			title: 'new_document.xml',
			filters: [
			  {name: 'Sutori XML Document', extensions: ['xml']},
			  {name: 'All files', extensions: ['*']}
			]
		});

		if (file.length > 0) {
			// create the xml template.
			const doc = document.implementation.createDocument(null, 'document');

			// serialize the content into the doc.
			self.SerializeDoc(doc);

			// serialize the doc into pure xml.
			const xml = ExtraTools.StringifyXml(doc);

			// save it to the filesystem.
			// @ts-ignore
			await Neutralino.filesystem.writeFile(file, xml);
			console.log("Saved!", file);
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
					ie.textContent = image.Src;
					if (image.ContentCulture !== SutoriCulture.None) ie.setAttribute('lang', image.ContentCulture);
					if (!ExtraTools.IsEmptyString(image.Actor)) ie.setAttribute('actor', image.Actor);
					if (!ExtraTools.IsEmptyString(image.For)) ie.setAttribute('for', image.For);
					if (image.Preload === true) ie.setAttribute('preload', 'true');
				}
			}
		}

	}


	/**
	 * Reset the state of the app without prompt.
	 */
	public Reset() {
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
};