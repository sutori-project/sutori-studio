class MomentFlow {
	public readonly MainElement: HTMLElement;


	constructor() {
		this.MainElement = document.getElementById('moments');
	}


	/**
	 * 
	 * @param text The text to place on the moment.
	 * @param createDocElement Set false if loading from a file.
	 * @return The html element that was created (has class 'moment-row')
	 */
	public AddRow(text: string, id?: string, actor_id?: string, createDocElement: boolean = true) : HTMLElement {
		const random_id = ExtraTools.IsEmptyString(id) ? ExtraTools.RandomID() : id;
		if (createDocElement) {
			const moment = new SutoriMoment;
			moment.ID = random_id;
			moment.Actor = actor_id;

			const textEle = new SutoriElementText();
			textEle.ContentCulture = App.SelectedCulture;
			textEle.Text = text;
			moment.AddElement(textEle);

			App.Document.Moments.push(moment);
		}
		const actor_hidden = ExtraTools.IsEmptyString(actor_id) ? ' hidden' : '';
		const actor = ExtraTools.IsEmptyString(actor_id) ? null : App.Document.Actors.find(t => t.ID == actor_id);
		const actor_col = actor == null ? 'inherit' : actor.Attributes['color'];
		const xml = `<div class="moment-row">
			<div class="moment">
				<div class="moment-header">
					<a class="moment-avatar${actor_hidden}" style="background-color: ${actor_col}">
						<svg width="16" height="16"><use xlink:href="#avatar"/></svg>
					</a>
					<small class="moment-id">#${random_id}</small>
					<div class="moment-buttons">
						<a class="moment-button" onclick="App.Dialogs.ShowMomentDialog(this);" title="Moment Properties">
							<svg width="16" height="16"><use xlink:href="#cog"/></svg>
						</a>
						<a class="moment-button" onclick="App.Moments.MoveRow(this, -1);" title="Move Up">
							<svg width="16" height="16"><use xlink:href="#arrow-up"/></svg>
						</a>
						<a class="moment-button" onclick="App.Moments.MoveRow(this, 1);" title="Move Down">
							<svg width="16" height="16"><use xlink:href="#arrow-down"/></svg>
						</a>
						<a class="moment-button" onclick="App.Moments.HandleAddImage(this);" title="Add Image">
							<svg width="16" height="16"><use xlink:href="#image"/></svg>
						</a>
						<a class="moment-button" onclick="App.Moments.HandleAddOption(this);" title="Add Option">
							<svg width="16" height="16"><use xlink:href="#option"/></svg>
						</a>
						<a class="moment-button" onclick="App.Moments.HandleRemoveRow(this);" title="Delete Moment">
							<svg width="16" height="16"><use xlink:href="#close"/></svg>
						</a>
					</div>
				</div>
				<div class="moment-body" contenteditable="true" onblur="App.Moments.HandleMomentTextBlur(this)">${text}</div>
				<div class="moment-footer"><div class="moment-buttons"></div></div>
				<div class="moment-options"></div>
			</div>
			
			<div class="moment-media"></div>
		</div>`;

		// option-template: <div class="moment-option" contenteditable="true">Option 1</div>
		// media-template: <div class="moment-image" tabindex="0"><svg width="16" height="16"><use xlink:href="#image"/></svg></div>

		this.MainElement.innerHTML += xml;

		// scroll to bottom.
		const editorPane = document.querySelector('.editor-pane');
		if (editorPane.scrollHeight > editorPane.clientHeight && editorPane.scrollTop < editorPane.scrollHeight) {
			const target = editorPane.scrollHeight - editorPane.clientHeight;
			const timer = setInterval(function() {
				if (editorPane.scrollTop >= target) clearInterval(timer);
				editorPane.scrollTop += 10;
			}, 20);
		}

		return this.MainElement.querySelector('.moment-row:last-of-type');
	}


	/**
	 * 
	 * @param button 
	 * @param offset 
	 * @returns 
	 */
	public MoveRow(button: HTMLElement, offset: number) {
		var self = this;
		var rowElement = button.closest('.moment-row');
		var rowIndex = Array.prototype.indexOf.call(self.MainElement.childNodes, rowElement);

		var arr = App.Document.Moments;
		var element = arr[rowIndex];
		var nextIndex = rowIndex + offset;
		var maxIndex = arr.length - 1;

		// don't move if we are at the beginning or end.
		if (nextIndex < 0 || nextIndex > maxIndex) return;

		// move the moment.
		arr.splice(rowIndex, 1);
		arr.splice(rowIndex + offset, 0, element);

		// move the element.
		if (offset == -1) rowElement.parentNode.insertBefore(rowElement, rowElement.previousSibling);
		if (offset == 1) rowElement.parentNode.insertBefore(rowElement.nextSibling, rowElement);
	}


	public AddOption(momentElement: HTMLElement, text: string) {
		const optionsElement = momentElement.parentElement.querySelector('.moment-options');
		optionsElement.innerHTML += 
			`<div class="moment-option">` +
				`<div contenteditable="true" onblur="App.Moments.HandleOptionTextBlur(this)">${text}</div>` +
				`<div class="buttons">` +
					`<a onclick="App.Dialogs.ShowOptionPropertiesDialog(this);" title="Option Properties">`+
						`<svg width="12" height="12"><use xlink:href="#cog"/></svg>`+
					`</a>` +
					`<a onclick="App.Moments.HandleRemoveOption(this);" title="Remove This Option">` +
						`<svg width="12" height="12"><use xlink:href="#close"/></svg>` +
					`</a>` +
				`</div>` +
			`</div>`;
	}


	public async AddImage(momentElement: HTMLElement, image?: SutoriElementImage, src?: string) {
		const mediaElement = momentElement.parentElement.querySelector('.moment-media');
		if (typeof src == 'undefined') src = '';
		mediaElement.innerHTML +=
			`<div class="moment-image" tabindex="0">` +
				`<div class="buttons">` +
					`<a onclick="App.Dialogs.ShowImagePropertiesDialog(this);" title="Image Properties"><svg width="12" height="12"><use xlink:href="#cog"/></svg></a>` +
					`<a onclick="App.Moments.HandleRemoveImage(this);" title="Remove This Image"><svg width="12" height="12"><use xlink:href="#close"/></svg></a>` +
				`</div>` +
				`<img src="${src}" />` +
				`<svg width="24" height="24"><use xlink:href="#image"/></svg>` +
			`</div>`;

		const imageElement = mediaElement.querySelector('.moment-image:last-of-type');

		if (image !== null) {
			// -- update the thumbnail --
			if (!ExtraTools.IsEmptyString(image.ResourceID)) {
				const resource = App.Document.GetResourceByID(image.ResourceID) as SutoriResourceImage;
				if (resource instanceof SutoriResourceImage) {
					src = await App.GetThumbnailDataUri(resource.ID, resource.Src);
				}
			}
			imageElement.querySelector('img').src = src;
			// -- update the thumbnail --
		}
	}


	/**
	 * @param buttonElement The clicked button.
	 */
	public HandleRemoveRow(buttonElement: HTMLElement) {
		const momentHeadButtons = buttonElement.parentElement;
		const momentHeadElement = momentHeadButtons.parentElement;
		const momentElement = momentHeadElement.parentElement;
		const rowElement = momentElement.parentElement;
		const index = ExtraTools.GetElementIndex(rowElement);
		if (index > -1) App.Document.Moments.splice(index, 1);
		rowElement.remove();
	}


	/**
	 * @param buttonElement The clicked button.
	 * @param createDocElement Set false if loading from a file.
	 */
	HandleAddImage(buttonElement: HTMLElement, createDocElement: boolean = true) {
		const buttonsElement = buttonElement.parentElement as HTMLElement;
		const headerElement = buttonsElement.parentElement as HTMLElement;
		const momentElement = headerElement.parentElement as HTMLElement;
		const rowElement = momentElement.parentElement as HTMLElement;
		//const mediaElement = rowElement.querySelector('.moment-media');

		if (createDocElement) {
			const moment_index = ExtraTools.GetElementIndex(rowElement);
			const moment = App.Document.Moments[moment_index];
			const image = new SutoriElementImage;
			image.ResourceID = '';
			image.ContentCulture = App.SelectedCulture;
			moment.Elements.push(image);
		}

		this.AddImage(momentElement);
	}


	/**
	 * @param buttonElement The clicked button.
	 */
	HandleRemoveImage(buttonElement: HTMLElement) {
		const mediaElement = buttonElement.closest('.moment-image') as HTMLElement;
		const mediaIndex = ExtraTools.GetElementIndex(mediaElement);
		const rowElement = mediaElement.closest('.moment-row') as HTMLElement;
		const rowIndex = ExtraTools.GetElementIndex(rowElement);
		/* remove from the doc */
		const moment = App.Document.Moments[rowIndex];
		const images = moment.GetImages(App.SelectedCulture);
		const image = images[mediaIndex];
		console.log("image", image);
		const index = moment.Elements.indexOf(image);
		if (index > -1) moment.Elements.splice(index, 1);
		/* remove from the doc */
		mediaElement.remove();
	}


	/**
	 * @param buttonElement The clicked button.
	 * @param createDocElement Set false if loading from a file.
	 */
	HandleAddOption(buttonElement: HTMLElement, createDocElement: boolean = true) {
		const buttonsElement = buttonElement.parentElement as HTMLElement;
		const headerElement = buttonsElement.parentElement as HTMLElement;
		const momentElement = headerElement.parentElement as HTMLElement;
		const rowElement = momentElement.parentElement as HTMLElement;

		if (createDocElement) {
			const moment_index = ExtraTools.GetElementIndex(rowElement);
			const moment = App.Document.Moments[moment_index];
			const option = new SutoriElementOption;
			option.ContentCulture = App.SelectedCulture;
			option.Text = 'Untitled';
			moment.Elements.push(option);
		}

		this.AddOption(momentElement, 'Untitled');
	}


	/**
	 * @param buttonElement The clicked button.
	 */
	 HandleRemoveOption(buttonElement: HTMLElement) {
		const optionElement = buttonElement.closest('.moment-option') as HTMLElement;
		const optionIndex = ExtraTools.GetElementIndex(optionElement);
		const rowElement = optionElement.closest('.moment-row') as HTMLElement;
		const rowIndex = ExtraTools.GetElementIndex(rowElement);

		/* remove from the doc */
		const moment = App.Document.Moments[rowIndex];
		const options = moment.GetOptions(App.SelectedCulture);
		const option = options[optionIndex];
		const index = moment.Elements.indexOf(option);
		if (index > -1) moment.Elements.splice(index, 1);
		/* remove from the doc */

		if (optionIndex > -1) moment.Elements.splice(optionIndex, 1);
		optionElement.remove();
	}


	/**
	 * 
	 * @param editorElement 
	 */
	HandleMomentTextBlur(editorElement: HTMLElement) {
		const momentElement = editorElement.parentElement;
		const rowElement = momentElement.parentElement;
		const index = ExtraTools.GetElementIndex(rowElement);
		const culture = App.SelectedCulture;
		const moment = App.Document.Moments[index] as SutoriMoment;

		// -- remove any older elements for the chosen culture.
		const existing = moment.GetTexts(culture);
		for (var i=0; i<existing.length; i++) {
			const index = moment.Elements.indexOf(existing[i]);
			if (index > -1) moment.Elements.splice(index, 1);
		}
		// -- remove any older elements for the chosen culture.

		const textEle = new SutoriElementText();
		textEle.ContentCulture = culture;
		textEle.Text = editorElement.innerText;
		moment.AddElement(textEle);
	}


	/**
	 * 
	 * @param editorElement 
	 */
	HandleOptionTextBlur(editorElement: HTMLElement) {
		const optionElement = editorElement.parentElement;
		const optionIndex = ExtraTools.GetElementIndex(optionElement);
		const rowElement = optionElement.closest('.moment-row') as HTMLElement;
		const rowIndex = ExtraTools.GetElementIndex(rowElement);
		const culture = App.SelectedCulture;
		const moment = App.Document.Moments[rowIndex] as SutoriMoment;
		const options = moment.GetOptions(culture);
		const option = options[optionIndex];
		option.Text = editorElement.innerText;
	}


	/**
	 * 
	 */
	Reset() {
		this.MainElement.querySelectorAll('.moment-row').forEach(row => {
			row.remove();
		});
	}
}