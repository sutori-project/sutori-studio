class DialogFlow {
	OkCallback?: CallableFunction;


	constructor() {
		this.OkCallback = null;
	}


	ShowOptionPropertiesDialog(buttonElement?: HTMLElement) {
		const optionElement = buttonElement.closest('.moment-option') as HTMLElement;
		const momentElement = optionElement.closest('.moment-row') as HTMLElement;
		const moment_index = ExtraTools.GetElementIndex(momentElement);
		const moment = App.Document.Moments[moment_index];
		const option_index = ExtraTools.GetElementIndex(optionElement);
		const options = moment.GetOptions(App.SelectedCulture);
		const option = options[option_index];
		let solver_html = '';

		Object.keys(SutoriSolver).forEach(solver => {
			solver_html += `<option value="${SutoriSolver[solver]}" ${option.Solver==solver?'selected':''}>${solver}</option>`;
		});

		const pageHtml = `<div>
									<div>
										<label for="tb-target" class="form">Target ID</label>
										<input id="tb-target" type="text" class="form" value="${option.Target??''}" />  
									</div>
									<div>
										<label for="sb-solver" class="form">Solver</label>
										<select id="sb-solver" class="form">
											${solver_html}
										</select>
									</div>
									<div>
										<label for="tb-callback" class="form">Solver Callback</label>
										<input id="tb-callback" type="text" class="form" value="${option.SolverCallback??''}" />  
									</div>
									<div style="text-align:right; margin-top:15px;">
										<a class="form" onclick="App.Dialogs.Ok();" style="color:#fff;">OK</a>
										<a class="form secondary" onclick="App.Dialogs.Close();" style="color:#fff;">Cancel</a>
									</div>
								</div>`;

		this.OkCallback = function() {
			const dest = document.getElementById('dialog-wrapper');
			const dialog = dest.querySelector('dialog') as HTMLElement;
			option.Target = (dialog.querySelector('#tb-target') as HTMLInputElement).value;
			const solverText = (dialog.querySelector('#sb-solver') as HTMLInputElement).value;
			option.Solver = ExtraTools.GetSolverByValue(solverText);
			option.SolverCallback = (dialog.querySelector('#tb-callback') as HTMLInputElement).value;
			// cast back to null if empty strings are passed.
			if (option.Target === '') option.Target = null;
			if (option.SolverCallback === '') option.SolverCallback = null;
			this.Close();
		};

		this.ShowDialog('Option Properties', 'option-dialog', pageHtml);
	}


	ShowImagePropertiesDialog(buttonElement?: HTMLElement) {
		const imageElement = buttonElement.closest('.moment-image') as HTMLElement;
		const momentElement = imageElement.closest('.moment-row') as HTMLElement;
		const moment_index = ExtraTools.GetElementIndex(momentElement);
		const moment = App.Document.Moments[moment_index];
		const image_index = ExtraTools.GetElementIndex(imageElement);
		const images = moment.GetImages(App.SelectedCulture);
		const image = images[image_index];

		let actor_html = '', resource_html = '';
		let found_selected = false;

		App.Document.Resources.forEach((res: SutoriResource) => {
			const disabled = ExtraTools.IsEmptyString(res.ID) ? ' disabled' : '';
			const selected = (ExtraTools.IsEmptyString(image.Actor) === false) && 
								  (res.ID === image.ResourceID)
								  ? ' selected' : '';
			resource_html += `<option value="${res.ID}"${disabled+selected}>${res.Name}</option>`;
		});

		App.Document.Actors.forEach((actor: SutoriActor) => {
			const disabled = ExtraTools.IsEmptyString(actor.ID) ? ' disabled' : '';
			const selected = (found_selected === false) && 
								  (ExtraTools.IsEmptyString(image.Actor) === false) && 
								  (actor.ID === image.Actor)
								  ? ' selected' : '';
			actor_html += `<option value="${actor.ID}"${disabled+selected}>${actor.Name}</option>`;
		});

		const pageHtml = `<div>
									<div>
										<label for="tb-rid" class="form">Resource ID</label>
										<select id="sb-rid" class="form">
											<option value="">-- Inherit --</option>
											${resource_html}
										</select>
									</div>
									<div>
										<label for="tb-for" class="form">For (eg: background, avatar etc...)</label>
										<input id="tb-for" type="text" class="form" value="${image.For??''}" />  
									</div>
									<div>
										<label for="sb-actor" class="form">Actor</label>
										<select id="sb-actor" class="form">
											<option value="">-- Inherit --</option>
											${actor_html}
										</select>
									</div>
									<div>
										<label class="form">Options</label>
									</div>
									<div style="text-align:right; margin-top:15px;">
										<a class="form" onclick="App.Dialogs.Ok();" style="color:#fff;">OK</a>
										<a class="form secondary" onclick="App.Dialogs.Close();" style="color:#fff;">Cancel</a>
									</div>
								</div>`;

		this.OkCallback = function() {
			const dest = document.getElementById('dialog-wrapper');
			const dialog = dest.querySelector('dialog') as HTMLElement;
			image.ResourceID = (dialog.querySelector('#tb-rid') as HTMLInputElement).value;
			image.For = (dialog.querySelector('#tb-for') as HTMLInputElement).value;
			image.Actor = (dialog.querySelector('#sb-actor') as HTMLSelectElement).value;
			// cast back to null if empty strings are passed.
			if (image.ResourceID === '') image.ResourceID = null;
			if (image.For === '') image.For = null;
			if (image.Actor === '') image.Actor = null;			
			this.Close();
		};

		this.ShowDialog('Image Properties', 'image-properties-dialog', pageHtml);
	}


	ShowIncludeDialog(includeElement?: HTMLElement) {
		const index = ExtraTools.GetElementIndex(includeElement);
		const include = App.Document.Includes[index];
		const pageHtml = `<div>
									<div>
										<label for="tb-path" class="form">Include Path</label>
										<div class="input-with-button">
											<input id="tb-path" type="text" class="form" value="${include.Path}" />  
											<a id="button-browse" class="form secondary" onclick="App.Dialogs.FileXmlBrowse('#tb-path');">...</a>
										</div>
									</div>
									<div>
										<label class="form">Options</label>
									</div>
									<div>
										<input type="checkbox" class="form" id="cb-after" ${include.After === true ? 'checked' : ''}>
										<label class="form" for="cb-after" title="Load this include after the document has loaded.">Load After</label>
									</div>
									<div style="text-align:right; margin-top:15px;">
										<a class="form" onclick="App.Dialogs.Ok();" style="color:#fff;">OK</a>
										<a class="form secondary" onclick="App.Dialogs.Close();" style="color:#fff;">Cancel</a>
									</div>
								</div>`;

		this.OkCallback = function() {
			const dest = document.getElementById('dialog-wrapper');
			const dialog = dest.querySelector('dialog') as HTMLElement;
			include.Path = (dialog.querySelector('#tb-path') as HTMLInputElement).value;
			include.After = (dialog.querySelector('#cb-after') as HTMLInputElement).checked === true;
			includeElement.querySelector('.group-name').textContent = include.Path;
			this.Close();
		};

		this.ShowDialog('Include Properties', 'include-dialog', pageHtml);
	}


	ShowActorDialog(actorElement?: HTMLElement) {
		const index = ExtraTools.GetElementIndex(actorElement);
		const actor = App.Document.Actors[index];
		let color = ''; //const def_color = '#FF6263';
		var color_was_set = false;
		if (typeof actor.Attributes["color"] !== "undefined") {
			color = actor.Attributes['color'];
			color_was_set = !ExtraTools.IsEmptyString(color);
		}

		const pageHtml = `<div>
									<div>
										<label for="tb-name" class="form">Actor Name</label>
										<input id="tb-name" type="text" class="form" value="${actor.Name}" />  
									</div>
									<div>
										<label for="tb-id" class="form">ID</label>
										<input id="tb-id" type="text" class="form" value="${actor.ID ?? ''}" />  
									</div>
									<div>
										<label for="tb-color" class="form">Color</label>
										<div class="row has-gap">
											<div class="column" style="flex: 0 1; justify-content: center;	padding-bottom: 5px;">
												<span>#000000</span>
											</div>
											<div class="column">
												<input id="tb-color" type="color" class="form" value="${color}" onchange="this.setAttribute('value', this.value);this.parentElement.parentElement.querySelector('span').textContent=this.value;" />  
											</div>
										</div>
									</div>
									<div style="text-align:right; margin-top:15px;">
										<a class="form" onclick="App.Dialogs.Ok();" style="color:#fff;">OK</a>
										<a class="form secondary" onclick="App.Dialogs.Close();" style="color:#fff;">Cancel</a>
									</div>
								</div>`;

		this.OkCallback = function() {
			const dest = document.getElementById('dialog-wrapper');
			const dialog = dest.querySelector('dialog') as HTMLElement;
			actor.Name = (dialog.querySelector('#tb-name') as HTMLInputElement).value;
			actor.ID = (dialog.querySelector('#tb-id') as HTMLInputElement).value;

			const chosen_color = (dialog.querySelector('#tb-color') as HTMLInputElement).value;
			if (ExtraTools.IsEmptyString(chosen_color)) {
				if (color_was_set) delete actor.Attributes['color'];
			}
			else {
				actor.Attributes['color'] = chosen_color;
			}

			if (chosen_color == '' && color_was_set) 

			if (actor.ID == "") actor.ID = null;
			actorElement.querySelector('.group-name').textContent = actor.Name;
			actorElement.querySelector('.group-id').textContent = '#' + actor.ID;
			this.Close();
		};

		this.ShowDialog('Actor Properties', 'actor-dialog', pageHtml);
	}


	ShowImageResourceDialog(imageElement?: HTMLElement) {
		const index = ExtraTools.GetElementIndex(imageElement);
		const resource = App.Document.Resources[index] as SutoriResourceImage;
		const pageHtml = `<div>
									<div class="row has-gap">
										<div class="column">
											<figure>
												<img id="img-preview" src="${resource.Src??''}" />
											</figure>
										</div>
										<div class="column">

											<div>
												<label for="tb-id" class="form">Resource ID</label>
												<input id="tb-id" type="text" class="form" value="${resource.ID}" />  
											</div>
											<div>
												<label for="tb-name" class="form">Resource Name</label>
												<input id="tb-name" type="text" class="form" value="${resource.Name}" />  
											</div>
											<div>
												<label for="tb-src" class="form">File Path/URL</label>
												<div class="input-with-button">
													<input id="tb-src" type="text" class="form" value="${resource.Src??''}" />  
													<a id="button-browse" class="form secondary" onclick="App.Dialogs.ImageBrowse('#tb-src', '#tb-name', '#img-preview');">...</a>
												</div>
											</div>
											<div>
												<input type="checkbox" class="form" id="cb-preload" ${resource.Preload === true ? 'checked' : ''}>
												<label class="form" for="cb-preload" title="Load the image data before it is shown.">Pre-Load Image</label>
											</div>

										</div>
									</div>
										
									<div style="text-align:right; margin-top:15px;">
										<a class="form" onclick="App.Dialogs.Ok();" style="color:#fff;">OK</a>
										<a class="form secondary" onclick="App.Dialogs.Close();" style="color:#fff;">Cancel</a>
									</div>
								</div>`;

		this.OkCallback = function() {
			const dest = document.getElementById('dialog-wrapper');
			const dialog = dest.querySelector('dialog') as HTMLElement;
			resource.ID = (dialog.querySelector('#tb-id') as HTMLInputElement).value;
			resource.Src = (dialog.querySelector('#tb-src') as HTMLInputElement).value;
			resource.Name = (dialog.querySelector('#tb-name') as HTMLInputElement).value;
			resource.Preload = (dialog.querySelector('#cb-preload') as HTMLInputElement).checked;
			imageElement.querySelector('.group-id').textContent = '#' + resource.ID;
			imageElement.querySelector('.group-name').textContent = resource.Name;
			this.Close();
		};

		this.ShowDialog('Image Resource Properties', 'resource-dialog', pageHtml);
	}


	ShowMomentDialog(buttonElement?: HTMLElement) {
		const momentRowElement = buttonElement.closest(".moment-row") as HTMLElement;
		const index = ExtraTools.GetElementIndex(momentRowElement);
		const moment = App.Document.Moments[index];
		let actor_html = '', triggers = '', setters = '';
		let found_selected = false;

		App.Document.Actors.forEach((actor: SutoriActor) => {
			const disabled = ExtraTools.IsEmptyString(actor.ID) ? ' disabled' : '';
			const selected = (found_selected === false) && 
								  (ExtraTools.IsEmptyString(moment.Actor) === false) && 
								  (actor.ID === moment.Actor)
								  ? ' selected' : '';
			actor_html += `<option value="${actor.ID}"${disabled+selected}>${actor.Name}</option>`;
		});

		const pageHtml = `<div>

									<div class="-row -has-gap">

										<div class="column">
											<div class="row has-gap">
												<div class="column">
													<label for="tb-id" class="form">ID</label>
													<input id="tb-id" type="text" class="form" value="${moment.ID ?? ''}" title="the id of this moment." />
												</div>
												<div class="column">
													<label for="tb-goto" class="form">Goto ID</label>
													<input id="tb-goto" type="text" class="form" value="${moment.Goto ?? ''}" title="the id of the moment to goto after this one." />
												</div>
											</div>
											<div>
												<label for="sb-actor" class="form">Actor</label>
												<select id="sb-actor" class="form">
													<option value="">-- None --</option>
													${actor_html}
												</select>
											</div>
											<div>
												<label for="tb-triggers" class="form">Triggers</label>
												<textarea disabled id="tb-triggers" type="text" class="form" rows="2" title="One per line.">${triggers}</textarea>
											</div>
											<div>
												<label for="tb-setters" class="form">Setters</label>
												<textarea disabled id="tb-setters" type="text" class="form" rows="2" title="One per line (eg: my_var=1).">${setters}</textarea>
											</div>											
											<div>
												<label class="form">Options</label>
											</div>
											<div>
												<input type="checkbox" class="form" id="cb-clear" ${moment.Clear === true ? 'checked' : ''}>
												<label class="form" for="cb-clear" title="Clear the screen before this moment is shown.">Clear Screen</label>
											</div>
										</div> <!-- .column -->

										<div class="column">
											
										</div> <!-- .column -->

									</div> <!-- .row -->

									
									<div style="text-align:right; margin-top:15px;">
										<a class="form" onclick="App.Dialogs.Ok();" style="color:#fff;">OK</a>
										<a class="form secondary" onclick="App.Dialogs.Close();" style="color:#fff;">Cancel</a>
									</div>
								</div>`;
		
		this.OkCallback = function() {
			const dest = document.getElementById('dialog-wrapper');
			const dialog = dest.querySelector('dialog') as HTMLElement;
			moment.ID = (dialog.querySelector('#tb-id') as HTMLInputElement).value;
			moment.Goto = (dialog.querySelector('#tb-goto') as HTMLInputElement).value;
			moment.Clear = (dialog.querySelector('#cb-clear') as HTMLInputElement).checked === true;
			moment.Actor = (dialog.querySelector('#sb-actor') as HTMLSelectElement).value;
			momentRowElement.querySelector('.moment-id').textContent = '#' + moment.ID;

			// cast back to null if empty strings are passed.
			if (moment.Actor === '') moment.Actor = null;

			if (ExtraTools.IsEmptyString(moment.Actor)) {
				momentRowElement.querySelector('.moment-avatar').classList.add('hidden');
			}
			else {
				momentRowElement.querySelector('.moment-avatar').classList.remove('hidden');
			}

			this.Close();
		};

		this.ShowDialog('Moment Properties', 'moment-dialog', pageHtml);
	}


	/**
	 * Call this to show a in-app dialog.
	 * @param header The header text.
	 * @param dialog_class The class added to the dialog element that appears.
	 * @param html The html that appears on the dialog.
	 * @param draggable Weather or not to make the dialog draggable.
	 */
	ShowDialog(header: string, dialog_class: string, html: string, draggable: boolean = true) {
		const dest = document.getElementById('dialog-wrapper');
		if (draggable) dest.classList.add('draggable');
		else dest.classList.remove('draggable');
		dest.innerHTML = `<div><dialog class="${dialog_class}">
			<div class="header"><span>${header}</span><a class="close-but" onclick="App.Dialogs.Close();"><svg width="12" height="12"><use xlink:href="#close"/></svg></a></div>
			<div class="body">
				${html}
			</div>
		</dialog></div>`;
		const dialog = dest.querySelector('dialog') as HTMLElement;
		if (draggable === true) ExtraTools.MakeDraggable(dialog);
		dest.classList.add('open');
		dialog.setAttribute('open', 'true');
	}


	/**
	 * Call this to indicate the dialog is in ok state.
	 */
	Ok() {
		if (this.OkCallback) {
			this.OkCallback();
		}
	}


	/**
	 * Close any currently open dialog.
	 */
	Close() {
		const dest = document.getElementById('dialog-wrapper');
		dest.classList.remove('open');
		const dialog = dest.querySelector('dialog') as HTMLElement;
		dialog.setAttribute('open',null);
		this.OkCallback = null;
	}


	/**
	 * Show a browse dialog to pick a file.
	 * @param srcTargetSelector The selector for the input that will receive the chosen filename.
	 */
	async FileXmlBrowse(srcTargetSelector) {
		const srcTarget = document.querySelector(srcTargetSelector);

		if (App.WebMode) {
			// @ts-ignore
			if (typeof window.showOpenFilePicker === 'undefined') {
				alert('Error, your browser does not support the filesystem api.');
				return;
			}
			let fileHandle = '';
			const opts = {
				types: [
				  {
					 description: 'Images',
					 accept: { 'text/xml': ['.xml'] }
				  },
				],
				excludeAcceptAllOption: true,
				multiple: false
			 };
			// @ts-ignore
			[fileHandle] = await window.showOpenFilePicker(opts) as FileSystemFileHandle;
			// @ts-ignore
			const file = await fileHandle.getFile();
			srcTarget.value = file.name;
		}
		else {

			// @ts-ignore
			let entries = await Neutralino.os.showOpenDialog('Select File', {
				filters: [
					{name: 'Xml File(s)', extensions: ['xml']},
					{name: 'All files', extensions: ['*']}
				]
			});
			if (entries.length > 0) {
				srcTarget.value = entries[0].split('\\').pop().split('/').pop();
			}
		}
	}


	/**
	 * Show a browse dialog to pick an image file.
	 * @param srcTargetSelector The selector for the input that will receive the chosen filename.
	 * @param nameTargetSelector The selector for the input that will receive the name of thw chosen file.
	 * @param previewTargetSelector The selector for the image to display a preview.
	 */
	async ImageBrowse(srcTargetSelector, nameTargetSelector, previewTargetSelector) {
		const srcTarget = document.querySelector(srcTargetSelector);
		const nameTarget = document.querySelector(nameTargetSelector);
		const previewTarget = document.querySelector(previewTargetSelector);

		if (App.WebMode) {
			// @ts-ignore
			if (typeof window.showOpenFilePicker === 'undefined') {
				alert('Error, your browser does not support the filesystem api.');
				return;
			}
			let fileHandle = '';
			const opts = {
				types: [
				  {
					 description: 'Images',
					 accept: { 'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.webp'] }
				  },
				],
				excludeAcceptAllOption: true,
				multiple: false
			 };
			// @ts-ignore
			[fileHandle] = await window.showOpenFilePicker(opts) as FileSystemFileHandle;
			// @ts-ignore
			const file = await fileHandle.getFile();
			const fr = new FileReader();
			fr.readAsDataURL(file);
			fr.onloadend = function() {
				srcTarget.value = fr.result;
				nameTarget.value = file.name;
				previewTarget.src = srcTarget.value;
			};
		}
		else {

			// @ts-ignore
			let entries = await Neutralino.os.showOpenDialog('Load Image', {
				filters: [
					{name: 'Image File(s)', extensions: ['jpg', 'jpeg', 'png', 'webp']},
					{name: 'All files', extensions: ['*']}
				]
			});
			if (entries.length > 0) {
				console.log(entries);
				// @ts-ignore
				const file = await Neutralino.filesystem.readBinaryFile(entries[0]);
				const blob = new Blob([new Uint8Array(file, 0, file.length)]);

				const fr = new FileReader();
				fr.readAsDataURL(blob);
				fr.onloadend = function() {
					srcTarget.value = fr.result;
					nameTarget.value = entries[0].split('\\').pop().split('/').pop();
					previewTarget.src = srcTarget.value;
				};
				//srcTarget.value = entries[0];
				//previewTarget.src = entries[0];
			}

		}
	}
}