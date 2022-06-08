class DialogFlow {
    constructor() {
        this.OkCallback = null;
    }
    ShowOptionPropertiesDialog(buttonElement) {
        var _a, _b;
        const optionElement = buttonElement.closest('.moment-option');
        const momentElement = optionElement.closest('.moment-row');
        const moment_index = ExtraTools.GetElementIndex(momentElement);
        const moment = App.Document.Moments[moment_index];
        const option_index = ExtraTools.GetElementIndex(optionElement);
        const options = moment.GetOptions(App.SelectedCulture);
        const option = options[option_index];
        let solver_html = '';
        Object.keys(SutoriSolver).forEach(solver => {
            solver_html += `<option value="${SutoriSolver[solver]}" ${option.Solver == solver ? 'selected' : ''}>${solver}</option>`;
        });
        const pageHtml = `<div>
									<div>
										<label for="tb-target" class="form">Target ID</label>
										<input id="tb-target" type="text" class="form" value="${(_a = option.Target) !== null && _a !== void 0 ? _a : ''}" />  
									</div>
									<div>
										<label for="sb-solver" class="form">Solver</label>
										<select id="sb-solver" class="form">
											${solver_html}
										</select>
									</div>
									<div>
										<label for="tb-callback" class="form">Solver Callback</label>
										<input id="tb-callback" type="text" class="form" value="${(_b = option.SolverCallback) !== null && _b !== void 0 ? _b : ''}" />  
									</div>
									<div style="text-align:right; margin-top:15px;">
										<a class="form secondary" onclick="App.Dialogs.Close();" style="color:#fff;">Cancel</a>
										<a class="form" onclick="App.Dialogs.Ok();" style="color:#fff;">OK</a>
									</div>
								</div>`;
        this.OkCallback = function () {
            const dest = document.getElementById('dialog-wrapper');
            const dialog = dest.querySelector('dialog');
            option.Target = dialog.querySelector('#tb-target').value;
            const solverText = dialog.querySelector('#sb-solver').value;
            option.Solver = ExtraTools.GetSolverByValue(solverText);
            option.SolverCallback = dialog.querySelector('#tb-callback').value;
            // cast back to null if empty strings are passed.
            if (option.Target === '')
                option.Target = null;
            if (option.SolverCallback === '')
                option.SolverCallback = null;
            this.Close();
        };
        this.ShowDialog('Option Properties', pageHtml);
    }
    ShowImagePropertiesDialog(buttonElement) {
        var _a, _b;
        const imageElement = buttonElement.closest('.moment-image');
        const momentElement = imageElement.closest('.moment-row');
        const moment_index = ExtraTools.GetElementIndex(momentElement);
        const moment = App.Document.Moments[moment_index];
        const image_index = ExtraTools.GetElementIndex(imageElement);
        const images = moment.GetImages(App.SelectedCulture);
        const image = images[image_index];
        let actor_html = '';
        let found_selected = false;
        App.Document.Actors.forEach((actor) => {
            const disabled = ExtraTools.IsEmptyString(actor.ID) ? ' disabled' : '';
            const selected = (found_selected === false) &&
                (ExtraTools.IsEmptyString(image.Actor) === false) &&
                (actor.ID === image.Actor)
                ? ' selected' : '';
            actor_html += `<option value="${actor.ID}"${disabled + selected}>${actor.Name}</option>`;
        });
        const pageHtml = `<div>
									<div>
										<label for="tb-rid" class="form">Resource ID</label>
										<input id="tb-rid" type="text" class="form" value="${(_a = image.ResourceID) !== null && _a !== void 0 ? _a : ''}" />  
									</div>
									<div>
										<label for="tb-for" class="form">For (eg: background, avatar etc...)</label>
										<input id="tb-for" type="text" class="form" value="${(_b = image.For) !== null && _b !== void 0 ? _b : ''}" />  
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
										<a class="form secondary" onclick="App.Dialogs.Close();" style="color:#fff;">Cancel</a>
										<a class="form" onclick="App.Dialogs.Ok();" style="color:#fff;">OK</a>
									</div>
								</div>`;
        this.OkCallback = function () {
            const dest = document.getElementById('dialog-wrapper');
            const dialog = dest.querySelector('dialog');
            image.ResourceID = dialog.querySelector('#tb-rid').value;
            image.For = dialog.querySelector('#tb-for').value;
            image.Actor = dialog.querySelector('#sb-actor').value;
            // cast back to null if empty strings are passed.
            if (image.ResourceID === '')
                image.ResourceID = null;
            if (image.For === '')
                image.For = null;
            if (image.Actor === '')
                image.Actor = null;
            this.Close();
        };
        this.ShowDialog('Image Properties', pageHtml);
    }
    ShowIncludeDialog(includeElement) {
        const index = ExtraTools.GetElementIndex(includeElement);
        const include = App.Document.Includes[index];
        const pageHtml = `<div>
									<div>
										<label for="tb-path" class="form">Include Path</label>
										<input id="tb-path" type="text" class="form" value="${include.Path}" />  
									</div>
									<div>
										<label class="form">Options</label>
									</div>
									<div>
										<input type="checkbox" class="form" id="cb-after" ${include.After === true ? 'checked' : ''}>
										<label class="form" for="cb-after" title="Load this include after the document has loaded.">Load After</label>
									</div>
									<div style="text-align:right; margin-top:15px;">
										<a class="form secondary" onclick="App.Dialogs.Close();" style="color:#fff;">Cancel</a>
										<a class="form" onclick="App.Dialogs.Ok();" style="color:#fff;">OK</a>
									</div>
								</div>`;
        this.OkCallback = function () {
            const dest = document.getElementById('dialog-wrapper');
            const dialog = dest.querySelector('dialog');
            include.Path = dialog.querySelector('#tb-path').value;
            include.After = dialog.querySelector('#cb-after').checked === true;
            includeElement.querySelector('.group-name').textContent = include.Path;
            this.Close();
        };
        this.ShowDialog('Include Properties', pageHtml);
    }
    ShowActorDialog(actorElement) {
        var _a;
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
										<input id="tb-id" type="text" class="form" value="${(_a = actor.ID) !== null && _a !== void 0 ? _a : ''}" />  
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
										<a class="form secondary" onclick="App.Dialogs.Close();" style="color:#fff;">Cancel</a>
										<a class="form" onclick="App.Dialogs.Ok();" style="color:#fff;">OK</a>
									</div>
								</div>`;
        this.OkCallback = function () {
            const dest = document.getElementById('dialog-wrapper');
            const dialog = dest.querySelector('dialog');
            actor.Name = dialog.querySelector('#tb-name').value;
            actor.ID = dialog.querySelector('#tb-id').value;
            const chosen_color = dialog.querySelector('#tb-color').value;
            if (ExtraTools.IsEmptyString(chosen_color)) {
                if (color_was_set)
                    delete actor.Attributes['color'];
            }
            else {
                actor.Attributes['color'] = chosen_color;
            }
            if (chosen_color == '' && color_was_set)
                if (actor.ID == "")
                    actor.ID = null;
            actorElement.querySelector('.group-name').textContent = actor.Name;
            actorElement.querySelector('.group-id').textContent = '#' + actor.ID;
            this.Close();
        };
        this.ShowDialog('Actor Properties', pageHtml);
    }
    ShowImageResourceDialog(imageElement) {
        var _a;
        const index = ExtraTools.GetElementIndex(imageElement);
        const resource = App.Document.Resources[index];
        const pageHtml = `<div>
									<div>
										<label for="tb-id" class="form">Resource ID</label>
										<input id="tb-id" type="text" class="form" value="${resource.ID}" />  
									</div>
									<div>
										<label for="tb-src" class="form">File Path/URL</label>
										<input id="tb-src" type="text" class="form" value="${(_a = resource.Src) !== null && _a !== void 0 ? _a : ''}" />  
									</div>
									<div style="text-align:right; margin-top:15px;">
										<a class="form secondary" onclick="App.Dialogs.Close();" style="color:#fff;">Cancel</a>
										<a class="form" onclick="App.Dialogs.Ok();" style="color:#fff;">OK</a>
									</div>
								</div>`;
        this.OkCallback = function () {
            const dest = document.getElementById('dialog-wrapper');
            const dialog = dest.querySelector('dialog');
            resource.ID = dialog.querySelector('#tb-id').value;
            resource.Src = dialog.querySelector('#tb-src').value;
            imageElement.querySelector('.group-id').textContent = '#' + resource.ID;
            this.Close();
        };
        this.ShowDialog('Image Resource Properties', pageHtml);
    }
    ShowMomentDialog(buttonElement) {
        var _a, _b;
        const momentRowElement = buttonElement.closest(".moment-row");
        const index = ExtraTools.GetElementIndex(momentRowElement);
        const moment = App.Document.Moments[index];
        let actor_html = '', triggers = '', setters = '';
        let found_selected = false;
        App.Document.Actors.forEach((actor) => {
            const disabled = ExtraTools.IsEmptyString(actor.ID) ? ' disabled' : '';
            const selected = (found_selected === false) &&
                (ExtraTools.IsEmptyString(moment.Actor) === false) &&
                (actor.ID === moment.Actor)
                ? ' selected' : '';
            actor_html += `<option value="${actor.ID}"${disabled + selected}>${actor.Name}</option>`;
        });
        const pageHtml = `<div>

									<div class="-row -has-gap">

										<div class="column">
											<div class="row has-gap">
												<div class="column">
													<label for="tb-id" class="form">ID</label>
													<input id="tb-id" type="text" class="form" value="${(_a = moment.ID) !== null && _a !== void 0 ? _a : ''}" title="the id of this moment." />
												</div>
												<div class="column">
													<label for="tb-goto" class="form">Goto ID</label>
													<input id="tb-goto" type="text" class="form" value="${(_b = moment.Goto) !== null && _b !== void 0 ? _b : ''}" title="the id of the moment to goto after this one." />
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
										<a class="form secondary" onclick="App.Dialogs.Close();" style="color:#fff;">Cancel</a>
										<a class="form" onclick="App.Dialogs.Ok();" style="color:#fff;">OK</a>
									</div>
								</div>`;
        this.OkCallback = function () {
            const dest = document.getElementById('dialog-wrapper');
            const dialog = dest.querySelector('dialog');
            moment.ID = dialog.querySelector('#tb-id').value;
            moment.Goto = dialog.querySelector('#tb-goto').value;
            moment.Clear = dialog.querySelector('#cb-clear').checked === true;
            moment.Actor = dialog.querySelector('#sb-actor').value;
            momentRowElement.querySelector('.moment-id').textContent = '#' + moment.ID;
            // cast back to null if empty strings are passed.
            if (moment.Actor === '')
                moment.Actor = null;
            if (ExtraTools.IsEmptyString(moment.Actor)) {
                momentRowElement.querySelector('.moment-avatar').classList.add('hidden');
            }
            else {
                momentRowElement.querySelector('.moment-avatar').classList.remove('hidden');
            }
            this.Close();
        };
        this.ShowDialog('Moment Properties', pageHtml);
    }
    ShowDialog(header, html, draggable = false) {
        const dest = document.getElementById('dialog-wrapper');
        dest.innerHTML = `<dialog>
			<div class="header"><span>${header}</span><a class="close-but" onclick="App.Dialogs.Close();"><svg width="12" height="12"><use xlink:href="#close"/></svg></a></div>
			<div class="body">
				${html}
			</div>
		</dialog>`;
        const dialog = dest.querySelector('dialog');
        if (draggable === true)
            ExtraTools.MakeDraggable(dialog);
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
        const dialog = dest.querySelector('dialog');
        dialog.setAttribute('open', null);
        this.OkCallback = null;
    }
}
class ExtraTools {
    static RandomID() {
        return (Math.random() + 1).toString(36).substring(6);
    }
    static GetElementIndex(node) {
        //console.log("Trying to get index of", node);
        return Array.prototype.indexOf.call(node.parentNode.childNodes, node);
    }
    static IsEmptyString(text) {
        if (typeof text === 'undefined' || text === null || text == '')
            return true;
        if (text.length == 0 || text.trim().length == 0)
            return true;
        return false;
    }
    static StringifyXml(xmlDoc) {
        const xsltDoc = new DOMParser().parseFromString([
            // describes how we want to modify the XML - indent everything
            '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
            '  <xsl:strip-space elements="*"/>',
            '  <xsl:template match="para[content-style][not(text())]">',
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
    static MakeDraggable(element) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (element.querySelector(".header")) {
            // if present, the header is where you move the DIV from:
            const header = element.querySelector(".header");
            header.onmousedown = dragMouseDown;
        }
        else {
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
    static GetSolverByValue(value) {
        const values = Object.values(SutoriSolver);
        const index = values.indexOf(value);
        const keys = Object.keys(SutoriSolver);
        return keys[index];
    }
}
class MomentFlow {
    constructor() {
        this.MainElement = document.getElementById('moments');
    }
    /**
     *
     * @param text The text to place on the moment.
     * @param createDocElement Set false if loading from a file.
     * @return The html element that was created (has class 'moment-row')
     */
    AddRow(text, id, actor_id, createDocElement = true) {
        const random_id = ExtraTools.IsEmptyString(id) ? ExtraTools.RandomID() : id;
        if (createDocElement) {
            const moment = new SutoriMoment;
            moment.ID = random_id;
            moment.AddText(App.SelectedCulture, text);
            moment.Actor = actor_id;
            App.Document.Moments.push(moment);
        }
        const actor_hidden = ExtraTools.IsEmptyString(actor_id) ? ' hidden' : '';
        const xml = `<div class="moment-row">
			<div class="moment">
				<div class="moment-header">
					<a class="moment-avatar${actor_hidden}">
						<svg width="16" height="16"><use xlink:href="#avatar"/></svg>
					</a>
					<small class="moment-id">#${random_id}</small>
					<div class="moment-buttons">
						<a class="moment-button" onclick="App.Dialogs.ShowMomentDialog(this);" title="Moment Properties">
							<svg width="16" height="16"><use xlink:href="#cog"/></svg>
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
			</div>
			<div class="moment-options"></div>
			<div class="moment-media"></div>
		</div>`;
        // option-template: <div class="moment-option" contenteditable="true">Option 1</div>
        // media-template: <div class="moment-image" tabindex="0"><svg width="16" height="16"><use xlink:href="#image"/></svg></div>
        this.MainElement.innerHTML += xml;
        // scroll to bottom.
        const editorPane = document.querySelector('.editor-pane');
        if (editorPane.scrollHeight > editorPane.clientHeight && editorPane.scrollTop < editorPane.scrollHeight) {
            const target = editorPane.scrollHeight - editorPane.clientHeight;
            const timer = setInterval(function () {
                if (editorPane.scrollTop >= target)
                    clearInterval(timer);
                editorPane.scrollTop += 10;
            }, 20);
        }
        return this.MainElement.querySelector('.moment-row:last-of-type');
    }
    AddOption(momentElement, text) {
        const optionsElement = momentElement.parentElement.querySelector('.moment-options');
        optionsElement.innerHTML +=
            `<div class="moment-option">` +
                `<div contenteditable="true" onblur="App.Moments.HandleOptionTextBlur(this)">${text}</div>` +
                `<div class="buttons">` +
                `<a onclick="App.Dialogs.ShowOptionPropertiesDialog(this);" title="Option Properties">` +
                `<svg width="12" height="12"><use xlink:href="#cog"/></svg>` +
                `</a>` +
                `<a onclick="App.Moments.HandleRemoveOption(this);" title="Remove This Option">` +
                `<svg width="12" height="12"><use xlink:href="#close"/></svg>` +
                `</a>` +
                `</div>` +
                `</div>`;
    }
    AddImage(momentElement, src) {
        const mediaElement = momentElement.parentElement.querySelector('.moment-media');
        mediaElement.innerHTML +=
            `<div class="moment-image" tabindex="0">` +
                `<div class="buttons">` +
                `<a onclick="App.Dialogs.ShowImagePropertiesDialog(this);" title="Image Properties"><svg width="12" height="12"><use xlink:href="#cog"/></svg></a>` +
                `<a onclick="App.Moments.HandleRemoveImage(this);" title="Remove This Image"><svg width="12" height="12"><use xlink:href="#close"/></svg></a>` +
                `</div>` +
                `<svg width="24" height="24"><use xlink:href="#image"/></svg>` +
                `</div>`;
    }
    /**
     * @param buttonElement The clicked button.
     */
    HandleRemoveRow(buttonElement) {
        const momentHeadButtons = buttonElement.parentElement;
        const momentHeadElement = momentHeadButtons.parentElement;
        const momentElement = momentHeadElement.parentElement;
        const rowElement = momentElement.parentElement;
        const index = ExtraTools.GetElementIndex(rowElement);
        if (index > -1)
            App.Document.Moments.splice(index, 1);
        rowElement.remove();
    }
    /**
     * @param buttonElement The clicked button.
     * @param createDocElement Set false if loading from a file.
     */
    HandleAddImage(buttonElement, createDocElement = true) {
        const buttonsElement = buttonElement.parentElement;
        const headerElement = buttonsElement.parentElement;
        const momentElement = headerElement.parentElement;
        const rowElement = momentElement.parentElement;
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
    HandleRemoveImage(buttonElement) {
        const mediaElement = buttonElement.closest('.moment-image');
        const mediaIndex = ExtraTools.GetElementIndex(mediaElement);
        const rowElement = mediaElement.closest('.moment-row');
        const rowIndex = ExtraTools.GetElementIndex(rowElement);
        /* remove from the doc */
        const moment = App.Document.Moments[rowIndex];
        const images = moment.GetImages(App.SelectedCulture);
        const image = images[mediaIndex];
        console.log("image", image);
        const index = moment.Elements.indexOf(image);
        if (index > -1)
            moment.Elements.splice(index, 1);
        /* remove from the doc */
        mediaElement.remove();
    }
    /**
     * @param buttonElement The clicked button.
     * @param createDocElement Set false if loading from a file.
     */
    HandleAddOption(buttonElement, createDocElement = true) {
        const buttonsElement = buttonElement.parentElement;
        const headerElement = buttonsElement.parentElement;
        const momentElement = headerElement.parentElement;
        const rowElement = momentElement.parentElement;
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
    HandleRemoveOption(buttonElement) {
        const optionElement = buttonElement.closest('.moment-option');
        const optionIndex = ExtraTools.GetElementIndex(optionElement);
        const rowElement = optionElement.closest('.moment-row');
        const rowIndex = ExtraTools.GetElementIndex(rowElement);
        /* remove from the doc */
        const moment = App.Document.Moments[rowIndex];
        const options = moment.GetOptions(App.SelectedCulture);
        const option = options[optionIndex];
        const index = moment.Elements.indexOf(option);
        if (index > -1)
            moment.Elements.splice(index, 1);
        /* remove from the doc */
        if (optionIndex > -1)
            moment.Elements.splice(optionIndex, 1);
        optionElement.remove();
    }
    /**
     *
     * @param editorElement
     */
    HandleMomentTextBlur(editorElement) {
        const momentElement = editorElement.parentElement;
        const rowElement = momentElement.parentElement;
        const index = ExtraTools.GetElementIndex(rowElement);
        const culture = App.SelectedCulture;
        const moment = App.Document.Moments[index];
        // -- remove any older elements for the chosen culture.
        const existing = moment.GetTexts(culture);
        for (var i = 0; i < existing.length; i++) {
            const index = moment.Elements.indexOf(existing[i]);
            if (index > -1)
                moment.Elements.splice(index, 1);
        }
        // -- remove any older elements for the chosen culture.
        moment.AddText(culture, editorElement.innerText);
    }
    /**
     *
     * @param editorElement
     */
    HandleOptionTextBlur(editorElement) {
        const optionElement = editorElement.parentElement;
        const optionIndex = ExtraTools.GetElementIndex(optionElement);
        const rowElement = optionElement.closest('.moment-row');
        const rowIndex = ExtraTools.GetElementIndex(rowElement);
        const culture = App.SelectedCulture;
        const moment = App.Document.Moments[rowIndex];
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
class SidebarFlow {
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
    AddInclude(name = "Untitled.xml", createDocElement = true) {
        //const xml_old = `<li tabindex="0" class="group has-icon" style="--bg: #FFF"><svg class="icon" width="16" height="16"><use xlink:href="#file"/></svg><span class="group-name" contenteditable="false">${name}</span></li>`;
        const xml = `<li tabindex="0" class="group has-icon" style="--bg: #FF6263">` +
            `<svg class="icon" width="16" height="16"><use xlink:href="#file"/></svg>` +
            `<span class="group-name" onclick="App.Sidebar.HandleGroupNameClick(event);" contenteditable="false">${name}</span><small>&nbsp;</small>` +
            `<a class="button" onclick="App.Dialogs.ShowIncludeDialog(this.parentElement)"><svg width="12" height="12"><use xlink:href="#cog"/></svg></a>` +
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
    AddActor(name = "Untitled", id, color, createDocElement = true) {
        const random_id = ExtraTools.IsEmptyString(id) ? ExtraTools.RandomID() : id;
        const color_h = ExtraTools.IsEmptyString(color) ? '' : `data-color="${color}"`;
        //const xml_old = `<li tabindex="0" class="group has-icon" style="--bg: #FFF"><svg class="icon" width="16" height="16"><use xlink:href="#avatar"/></svg><span class="group-name" contenteditable="false">${name}</span></li>`;
        const xml = `<li tabindex="0" class="group has-icon" style="--bg: #FF6263">` +
            `<svg class="icon" width="16" height="16" ${color_h}><use xlink:href="#avatar"/></svg>` +
            `<span class="group-name" onclick="App.Sidebar.HandleGroupNameClick(event);" contenteditable="false">${name}</span><small class="group-id">#${random_id}</small>` +
            `<a class="button" onclick="App.Dialogs.ShowActorDialog(this.parentElement)">` +
            `<svg width="12" height="12"><use xlink:href="#cog"/></svg></a>` +
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
    AddImageResource(name = "Untitled", id, createDocElement = true) {
        const random_id = ExtraTools.IsEmptyString(id) ? ExtraTools.RandomID() : id;
        const xml = `<li tabindex="0" class="group has-icon" style="--bg: #FF6263">` +
            `<svg class="icon" width="16" height="16"><use xlink:href="#file"/></svg>` +
            `<span class="group-name" onclick="App.Sidebar.HandleGroupNameClick(event);" contenteditable="false">${name}</span><small class="group-id">#${random_id}</small>` +
            `<a class="button" onclick="App.Dialogs.ShowImageResourceDialog(this.parentElement);"><svg width="12" height="12"><use xlink:href="#cog"/></svg></a>` +
            `</li>`;
        ;
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
            const t = e.target.parentElement;
            console.log(t);
            //t.dispatchEvent(new KeyboardEvent('keydown', {'key': 'F2'}));
            //document.dispatchEvent(new KeyboardEvent('keydown', {'key':'F2'} ));
            const event = new KeyboardEvent('keyup', { 'key': 'F2' });
            Object.defineProperty(event, 'target', { writable: false, value: t });
            document.dispatchEvent(event);
        }
    }
    /**
     * Reset this flow to default state.
     */
    Reset() {
        this.MainElement.querySelectorAll('.group').forEach(row => {
            row.remove();
        });
    }
}
class SutoriBuilderApp {
    constructor(webMode) {
        this._culture = SutoriCulture.None;
        if (typeof globalThis.App !== 'undefined')
            throw new Error("Tried to create more than one instance of SutoriApp");
        this.WebMode = webMode;
        this.MainElement = document.querySelector('.app');
        this.Moments = new MomentFlow;
        this.Sidebar = new SidebarFlow;
        this.Dialogs = new DialogFlow;
        this.Reset();
    }
    get SelectedCulture() { return this._culture; }
    get Document() { return this._loadedDocument; }
    /**
     * Initialize the builder app.
     */
    static init(webMode = false) {
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
    AttachEvent(selector, event, callback) {
        document.querySelector(selector).addEventListener(event, callback);
    }
    /**
     * Catch when a language change menuitem is clicked.
     * @param e
     */
    HandleChangeLang(e) {
        const li = e.target;
        const lang = li.dataset['lang'];
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
        for (var i = 0; i < App.Document.Moments.length; i++) {
            const moment = App.Document.Moments[i];
            const rowElement = App.Moments.MainElement.querySelector('.moment-flow .moment-row:nth-of-type(' + (i + 1) + ')');
            const momentElement = rowElement.querySelector('.moment');
            const editor = rowElement.querySelector('.moment-body');
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
    HandleKeyDown(e) {
        switch (e.key) {
            case 'Enter':
                const target = e.target;
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
    async HandleKeyUp(e) {
        const self = App;
        switch (e.key) {
            /* f2 to rename things */
            case 'F2':
                const f2target = e.target;
                if (f2target.classList.contains('group')) {
                    // F2 for editing group names.
                    const editor = f2target.querySelector('span[contenteditable]');
                    editor.setAttribute("contenteditable", 'true');
                    editor.focus();
                    editor.onblur = function () {
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
                const delTarget = e.target;
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
                if (e.altKey)
                    document.querySelector('.tl-item-file').focus();
                break;
            case 'l':
                if (e.altKey)
                    document.querySelector('.tl-item-lang').focus();
                break;
            case 'h':
                if (e.altKey)
                    document.querySelector('.tl-item-help').focus();
                break;
            /* main menu traversal */
            case 'ArrowUp':
                const upEle = e.target;
                if (upEle.classList.contains('tl-child')) {
                    const upEleNext = upEle.previousElementSibling;
                    if (upEleNext == null)
                        return;
                    if (typeof upEleNext !== 'undefined' && upEle.classList.contains('tl-child'))
                        upEleNext.focus();
                }
                break;
            case 'ArrowDown':
                const downEle = e.target;
                if (downEle.classList.contains('tl-item'))
                    downEle.querySelector('li:first-of-type').focus();
                if (downEle.classList.contains('tl-child')) {
                    const downEleNext = downEle.nextElementSibling;
                    if (downEleNext == null)
                        return;
                    if (typeof downEleNext !== 'undefined' && downEleNext.classList.contains('tl-child'))
                        downEleNext.focus();
                }
                break;
            case 'Enter':
                const enterEle = e.target;
                if (enterEle.classList.contains('tl-child'))
                    enterEle.click();
                break;
            default:
                //console.log(e);
                break;
        }
    }
    /**
     * Call this to initiate creating a new document.
     */
    async NewFile() {
        const message = 'Are you sure you wish to do this?';
        console.log('new clicked', App.WebMode);
        if (App.WebMode == true) {
            if (confirm(message) == true)
                App.Reset();
        }
        else {
            // @ts-ignore
            let button = await Neutralino.os.showMessageBox('New Document', message, 'OK_CANCEL', 'QUESTION');
            if (button == 'OK')
                App.Reset();
        }
    }
    /**
     * Open a file for editing.
     */
    async OpenFile() {
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
            [fileHandle] = await window.showOpenFilePicker();
            // @ts-ignore
            const file = await fileHandle.getFile();
            const contents = await file.text();
            await self._OpenFileData(contents);
        }
        else {
            // @ts-ignore
            let entries = await Neutralino.os.showOpenDialog('Open Sutori Document', {
                filters: [
                    { name: 'Sutori XML Document', extensions: ['xml'] },
                    { name: 'All files', extensions: ['*'] }
                ]
            });
            if (entries.length > 0) {
                const file = entries[0];
                // @ts-ignore
                const data = await Neutralino.filesystem.readFile(file);
                await self._OpenFileData(data);
            }
        }
    }
    async _OpenFileData(data) {
        const self = App;
        // clean up the ui first.
        self.Reset();
        const doc = self._loadedDocument = new SutoriDocument();
        doc.CustomUriLoader = async function (uri) {
            // we don't want to load dependencies, so just return nothing.
            return '';
        };
        await doc.AddDataFromXml(data);
        // add the includes.
        doc.Includes.forEach((include) => {
            const includeElement = self.Sidebar.AddInclude(include.Path, false);
        });
        // add the actors.
        doc.Actors.forEach((actor) => {
            let color = '';
            if (typeof actor.Attributes['color'] !== "undefined") {
                color = actor.Attributes['color'];
            }
            const actorElement = self.Sidebar.AddActor(actor.Name, actor.ID, color, false);
        });
        // add the moments.
        doc.Moments.forEach((moment) => {
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
                App.Moments.AddImage(momentElement, '');
            });
        });
        // add the resources.
        doc.Resources.forEach((resource) => {
            if (resource instanceof SutoriResourceImage) {
                const resourceElement = self.Sidebar.AddImageResource(resource.Name, resource.ID, false);
            }
        });
    }
    /**
     * Save a file.
     */
    async SaveAsFile() {
        const self = App;
        console.log('save-as clicked');
        // create the xml template.
        const doc = document.implementation.createDocument(null, 'document');
        // serialize the content into the doc.
        self.SerializeDoc(doc);
        // serialize the doc into pure xml.
        const xml = ExtraTools.StringifyXml(doc);
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
            const fileHandle = await window.showSaveFilePicker(options);
            // Create a FileSystemWritableFileStream to write to.
            // @ts-ignore
            const writable = await fileHandle.createWritable();
            // Write the contents of the file to the stream.
            await writable.write(xml);
            // Close the file and write the contents to disk.
            await writable.close();
        }
        else {
            // @ts-ignore
            let file = await Neutralino.os.showSaveDialog('Save Sutori Document', {
                title: 'new_document.xml',
                filters: [
                    { name: 'Sutori XML Document', extensions: ['xml'] },
                    { name: 'All files', extensions: ['*'] }
                ]
            });
            if (file.length > 0) {
                // save it to the filesystem.
                // @ts-ignore
                await Neutralino.filesystem.writeFile(file, xml);
            }
        }
        console.log("Saved!");
        alert('Saved!');
    }
    /**
     * Serialize the loaded document into an XmlDocument.
     * @param doc The destination document.
     */
    SerializeDoc(doc) {
        const self = this;
        const src = self._loadedDocument;
        const root = doc.childNodes[0];
        // serialize includes.
        for (var i = 0; i < src.Includes.length; i++) {
            const includeElement = root.appendChild(doc.createElement('include'));
            includeElement.textContent = src.Includes[i].Path;
            if (src.Includes[i].After) {
                includeElement.setAttribute('after', 'true');
            }
        }
        // serialize the actors.
        const actors = root.appendChild(doc.createElement('actors'));
        for (var i = 0; i < src.Actors.length; i++) {
            const actor = src.Actors[i];
            const actorElement = actors.appendChild(doc.createElement('actor'));
            if (!ExtraTools.IsEmptyString(actor.ID))
                actorElement.setAttribute('id', actor.ID);
            actorElement.setAttribute('name', actor.Name);
            // apply the attributes.
            for (const [key, value] of Object.entries(actor.Attributes)) {
                actorElement.setAttribute(key, value);
            }
        }
        // serialize moments.
        const moments = root.appendChild(doc.createElement('moments'));
        for (var i = 0; i < src.Moments.length; i++) {
            const moment = src.Moments[i];
            const momentElement = moments.appendChild(doc.createElement('moment'));
            // moment attributes.
            if (moment.Clear === true)
                momentElement.setAttribute('clear', 'true');
            if (!ExtraTools.IsEmptyString(moment.ID))
                momentElement.setAttribute('id', moment.ID);
            if (!ExtraTools.IsEmptyString(moment.Actor))
                momentElement.setAttribute('actor', moment.Actor);
            if (!ExtraTools.IsEmptyString(moment.Goto))
                momentElement.setAttribute('goto', moment.Goto);
            // apply the attributes.
            for (const [key, value] of Object.entries(moment.Attributes)) {
                momentElement.setAttribute(key, value);
            }
            // serialize the elements.
            for (var j = 0; j < moment.Elements.length; j++) {
                const element = moment.Elements[j];
                if (element instanceof SutoriElementText) {
                    const text = element;
                    const te = momentElement.appendChild(doc.createElement('text'));
                    te.textContent = text.Text;
                    if (text.ContentCulture !== SutoriCulture.None)
                        te.setAttribute('lang', text.ContentCulture);
                }
                else if (element instanceof SutoriElementOption) {
                    const option = element;
                    const oe = momentElement.appendChild(doc.createElement('option'));
                    oe.textContent = option.Text;
                    if (option.ContentCulture !== SutoriCulture.None)
                        oe.setAttribute('lang', option.ContentCulture);
                    if (option.Solver !== SutoriSolver.None)
                        oe.setAttribute('solver', option.Solver);
                    if (!ExtraTools.IsEmptyString(option.Target))
                        oe.setAttribute('target', option.Target);
                    if (!ExtraTools.IsEmptyString(option.SolverCallback))
                        oe.setAttribute('solver', option.SolverCallback);
                }
                else if (element instanceof SutoriElementImage) {
                    const image = element;
                    const ie = momentElement.appendChild(doc.createElement('image'));
                    if (image.ContentCulture !== SutoriCulture.None)
                        ie.setAttribute('lang', image.ContentCulture);
                    if (!ExtraTools.IsEmptyString(image.ResourceID))
                        ie.setAttribute('resource', image.ResourceID);
                    if (!ExtraTools.IsEmptyString(image.Actor))
                        ie.setAttribute('actor', image.Actor);
                    if (!ExtraTools.IsEmptyString(image.For))
                        ie.setAttribute('for', image.For);
                }
            }
        }
    }
    /**
     * Reset the state of the app without prompt.
     */
    Reset() {
        const self = this;
        self._loadedDocument = new SutoriDocument;
        self.Sidebar.Reset();
        self.Moments.Reset();
    }
    /**
     * Send the user to the help website.
     */
    GotoHelpWebsite() {
        // @ts-ignore
        Neutralino.os.open('https://kodaloid.com');
    }
    /**
     * Exit the app.
     */
    Exit() {
        // @ts-ignore
        Neutralino.app.exit();
    }
}
;
//# sourceMappingURL=sutori-studio.js.map