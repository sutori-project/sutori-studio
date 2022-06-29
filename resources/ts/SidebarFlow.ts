class SidebarFlow {
	public readonly MainElement: HTMLElement;


	/**
	 * Creates a new sidebar flow.
	 */
	constructor() {
		this.MainElement = document.getElementById('sidebar');
	}


	/**
	 * Add and return a created include element.
	 * @param name The name of the file to include.
	 * @param createDocElement Set true if you wish a new SutoriInclude to be created in the document.
	 * @returns The created html element.
	 */
	public AddInclude(name: string = "Untitled.xml", createDocElement: boolean = true) : HTMLElement {
		//const xml_old = `<li tabindex="0" class="group has-icon" style="--bg: #FFF"><svg class="icon" width="16" height="16"><use xlink:href="#file"/></svg><span class="group-name" contenteditable="false">${name}</span></li>`;
		const xml = `<li tabindex="0" class="group has-icon" style="--bg: #FF6263">` +
						  `<svg class="icon" width="16" height="16"><use xlink:href="#file"/></svg>` +
						  `<span class="group-name" onclick="App.Sidebar.HandleGroupNameClick(event);" contenteditable="false">${name}</span><small>&nbsp;</small>` + 
						  `<a class="button" onclick="App.Dialogs.ShowIncludeDialog(this.parentElement)"><svg width="12" height="12"><use xlink:href="#cog"/></svg></a>` +
						  `<a class="button" onclick="App.Sidebar.RemoveItem(this.parentElement)"><svg width="12" height="12"><use xlink:href="#close"/></svg></a>` +
						`</li>`;
		const parent = this.MainElement.querySelector('.groups.files');
		parent.innerHTML += xml;

		// add the include to the document.
		if (createDocElement) {
			const include = new SutoriInclude();
			include.Path = name;
			App.Document.Includes.push(include);
		}

		return parent.querySelector('li:last-of-type');
	}


	/**
	 * Add and return a created actor element.
	 * @param name The name of the actor.
	 * @param createDocElement Set true if you wish a new SutoriActor to be created in the document.
	 * @returns The created html element.
	 */
	public AddActor(name: string = "Untitled", id?: string, color?: string, createDocElement: boolean = true) : HTMLElement {
		const random_id = ExtraTools.IsEmptyString(id) ? ExtraTools.RandomID() : id;
		const color_h = ExtraTools.IsEmptyString(color) ? '#FF6263' : color;
		//const xml_old = `<li tabindex="0" class="group has-icon" style="--bg: #FFF"><svg class="icon" width="16" height="16"><use xlink:href="#avatar"/></svg><span class="group-name" contenteditable="false">${name}</span></li>`;
		const xml = `<li tabindex="0" class="group has-icon" style="--bg: ${color_h}">` +
							`<svg class="icon" width="16" height="16"><use xlink:href="#avatar"/></svg>` +
							`<span class="group-name" onclick="App.Sidebar.HandleGroupNameClick(event);" contenteditable="false">${name}</span><small class="group-id">#${random_id}</small>` +
							`<a class="button" onclick="App.Dialogs.ShowActorDialog(this.parentElement)"><svg width="12" height="12"><use xlink:href="#cog"/></svg></a>` +
							`<a class="button" onclick="App.Sidebar.RemoveItem(this.parentElement)"><svg width="12" height="12"><use xlink:href="#close"/></svg></a>` +
						`</li>`;
		const parent = this.MainElement.querySelector('.groups.actors');
		parent.innerHTML += xml;

		// add the actor to the document.
		if (createDocElement) {
			const actor = new SutoriActor();
			actor.Name = name;
			actor.ID = random_id;
			App.Document.Actors.push(actor);
		}

		return parent.querySelector('li:last-of-type');
	}


	/**
	 * Add and return a created image resource element.
	 * @param name The name of the resource.
	 * @param id The id for the resource.
	 * @param createDocElement Set true if you wish a new SutoriActor to be created in the document.
	 */
	public AddImageResource(name: string = "Untitled", id?: string, createDocElement: boolean  = true) : HTMLElement {
		const random_id = ExtraTools.IsEmptyString(id) ? ExtraTools.RandomID() : id;
		const xml = `<li tabindex="0" class="group has-icon" style="--bg: #FF6263">` +
						  `<svg class="icon" width="16" height="16"><use xlink:href="#file"/></svg>` +
						  `<span class="group-name" onclick="App.Sidebar.HandleGroupNameClick(event);" contenteditable="false">${name}</span><small class="group-id">#${random_id}</small>` + 
						  `<a class="button" onclick="App.Dialogs.ShowImageResourceDialog(this.parentElement);"><svg width="12" height="12"><use xlink:href="#cog"/></svg></a>` +
						  `<a class="button" onclick="App.Sidebar.RemoveItem(this.parentElement)"><svg width="12" height="12"><use xlink:href="#close"/></svg></a>` +
						`</li>`;;
		const parent = this.MainElement.querySelector('.groups.resources');
		parent.innerHTML += xml;

		// add the actor to the document.
		if (createDocElement) {
			const resource = new SutoriResourceImage();
			resource.Name = name;
			resource.ID = random_id;
			App.Document.Resources.push(resource);
		}

		return parent.querySelector('li:last-of-type');
	}


	HandleGroupNameClick(e) {
		e = e || window.event;
		if (e.detail === 2) {
			// if double clicked, trigger rename feature.
			const t = (e.target as HTMLElement).parentElement as HTMLElement;
			console.log(t);
			//t.dispatchEvent(new KeyboardEvent('keydown', {'key': 'F2'}));
			//document.dispatchEvent(new KeyboardEvent('keydown', {'key':'F2'} ));
			const event = new KeyboardEvent( 'keyup' , {	'key':'F2' });
			Object.defineProperty(event, 'target', {writable: false, value: t});
			document.dispatchEvent(event);
		}
	}


	public async RemoveItem(row) {
		const group = row.parentElement.dataset['group'];
		const index = ExtraTools.GetElementIndex(row);
		const message = "Are you sure you wish to delete this?";
		let button = '';
					
		if (App.WebMode == true) {
			button = confirm(message) ? 'OK' : 'CANCEL';
		}
		else {
			// @ts-ignore
			button = await Neutralino.os.showMessageBox('Confirm', message, 'OK_CANCEL', 'QUESTION');
		}
		
		if (button == 'OK') {
			if (index > -1) {
				switch (group) {
					case 'includes':
						App.Document.Includes.splice(index, 1);
						break;
					case 'actors':
						App.Document.Actors.splice(index, 1);
						break;
					case 'resources':
						App.Document.Resources.splice(index, 1);
						break;
				}			
				console.log("Deleted ", group, index);
				row.remove();
			}
		}
	}



	/**
	 * Reset this flow to default state.
	 */
	public Reset() {
		this.MainElement.querySelectorAll('.group').forEach(row => {
			row.remove();
		});
	}
}