/**
 * The base class for all moment elements.
 */
class SutoriActor {
    constructor() {
        this.Attributes = new Object;
        this.ContentCulture = SutoriCulture.None;
        this.Elements = new Array();
        this.ID = null;
        this.Name = 'Untitled';
    }
    static Parse(actor_e) {
        const result = new SutoriActor();
        if (actor_e.hasAttribute('id')) {
            result.ID = actor_e.attributes['id'].textContent;
        }
        if (actor_e.hasAttribute('name')) {
            result.Name = actor_e.attributes['name'].textContent;
        }
        if (actor_e.hasAttribute('lang')) {
            const lang = actor_e.attributes['lang'].textContent;
            result.ContentCulture = SutoriTools.ParseCulture(lang);
        }
        const exclude = ['id', 'name', 'lang'];
        for (let i = 0; i < actor_e.attributes.length; i++) {
            const attr = actor_e.attributes[i];
            if (typeof exclude !== 'undefined' && exclude.indexOf(attr.name) > -1)
                continue;
            result.Attributes[attr.name] = attr.value;
        }
        actor_e.querySelectorAll(':scope > *').forEach(async (element_e) => {
            switch (element_e.tagName) {
                case 'text':
                    result.Elements.push(SutoriElementText.Parse(element_e));
                    break;
                case 'image':
                    result.Elements.push(SutoriElementImage.Parse(element_e));
                    break;
                case 'audio':
                    result.Elements.push(SutoriElementAudio.Parse(element_e));
                    break;
                case 'video':
                    result.Elements.push(SutoriElementVideo.Parse(element_e));
                    break;
            }
        });
        return result;
    }
}
/**
 * Describes information passed to client code when a challenge event occurs.
 */
class SutoriChallengeEvent {
    constructor(owner, moment) {
        this.Owner = owner;
        this.Moment = moment;
        this.ElementCount = moment.Elements.length;
    }
}
/**
 * Describes a document of multimedia moments.
 */
class SutoriDocument {
    constructor() {
        this.Resources = new Array();
        this.Actors = new Array();
        this.Moments = new Array();
        this.Includes = new Array();
        this.CustomUriLoader = null;
    }
    /**
     * Load a SutoriDocument from an XML file.
     * @param uri The uri location of the XML file to load.
     * @returns The loaded document.
     */
    static async LoadXml(uri) {
        // create a new document.
        const result = new SutoriDocument();
        // load the document here.
        await result.AddDataFromXmlUri(uri);
        // return the loaded document.
        return result;
    }
    /**
     * Append moments from an XML file.
     * @param uri The uri location of the XML file to load.
     */
    async AddDataFromXmlUri(uri) {
        if (this.CustomUriLoader != null) {
            const custom_raw_xml = await this.CustomUriLoader(uri);
            console.log("loading moments from " + uri);
            await this.AddDataFromXml(custom_raw_xml);
        }
        else {
            const response = await fetch(uri);
            const raw_xml = await response.text();
            console.log("loading moments from " + uri);
            await this.AddDataFromXml(raw_xml);
        }
    }
    /**
     * Append moments from a raw XML string.
     * @param raw_xml The raw XML string to parse.
     */
    async AddDataFromXml(raw_xml) {
        const xml_parser = new DOMParser();
        const xml = xml_parser.parseFromString(raw_xml, "text/xml");
        const self = this;
        const includeElements = xml.querySelectorAll('include');
        for (let i = 0; i < includeElements.length; i++) {
            const includeElement = includeElements[i];
            const include = SutoriInclude.Parse(includeElement);
            self.Includes.push(include);
            if (include.After === false) {
                await this.AddDataFromXmlUri(include.Path);
            }
        }
        xml.querySelectorAll('resources > *').forEach((resource_e) => {
            if (resource_e.tagName == 'image') {
                self.Resources.push(SutoriResourceImage.Parse(resource_e));
            }
        });
        xml.querySelectorAll('actors actor').forEach((actor_e) => {
            self.Actors.push(SutoriActor.Parse(actor_e));
        });
        xml.querySelectorAll('moments moment').forEach((moment_e) => {
            const moment = new SutoriMoment();
            if (moment_e.hasAttribute('id')) {
                moment.ID = moment_e.attributes['id'].textContent;
            }
            if (moment_e.hasAttribute('goto')) {
                moment.Goto = moment_e.attributes['goto'].textContent;
            }
            if (moment_e.hasAttribute('actor')) {
                moment.Actor = moment_e.attributes['actor'].textContent;
            }
            if (moment_e.hasAttribute('clear')) {
                moment.Clear = SutoriTools.ParseBool(moment_e.attributes['clear'].textContent);
            }
            self.AddMomentAttributes(moment, moment_e, ['id', 'goto', 'actor', 'clear']);
            moment_e.querySelectorAll(':scope > *').forEach(async (element_e) => {
                switch (element_e.tagName) {
                    case 'text':
                        moment.Elements.push(SutoriElementText.Parse(element_e));
                        break;
                    case 'option':
                        moment.Elements.push(SutoriElementOption.Parse(element_e));
                        break;
                    case 'image':
                        moment.Elements.push(SutoriElementImage.Parse(element_e));
                        break;
                    case 'audio':
                        moment.Elements.push(SutoriElementAudio.Parse(element_e));
                        break;
                    case 'video':
                        moment.Elements.push(SutoriElementVideo.Parse(element_e));
                        break;
                    case 'load':
                        moment.Elements.push(SutoriElementLoad.Parse(element_e));
                        break;
                    case 'set':
                        moment.Elements.push(SutoriElementSet.Parse(element_e));
                        break;
                    case 'trigger':
                        moment.Elements.push(SutoriElementTrigger.Parse(element_e));
                        break;
                }
            });
            self.Moments.push(moment);
        });
        for (let i = 0; i < self.Includes.length; i++) {
            const include = self.Includes[i];
            if (include.After === true) {
                await this.AddDataFromXmlUri(include.Path);
            }
        }
    }
    /**
     * Called by AddMomentsFromXml to add extra attributes when reading moments.
     * @param moment The target moment to manipulate.
     * @param element The source element.
     * @param exclude An array of keys to exclude.
     */
    AddMomentAttributes(moment, element, exclude) {
        const self = this;
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            if (typeof exclude !== 'undefined' && exclude.indexOf(attr.name) > -1)
                continue;
            moment.Attributes[attr.name] = attr.value;
        }
    }
    /**
     * Get a resource by it's id.
     * @param id
     * @returns Either the found resource or undefined.
     */
    GetResourceByID(id) {
        return this.Resources.find(res => res.ID == id);
    }
}
/**
 * The base class for all moment elements.
 */
class SutoriElement {
    /**
     * Parse extra attributes when parsing an element.
     * @param element The source element.
     * @param exclude An array of keys to exclude.
     */
    ParseExtraAttributes(element, exclude) {
        const self = this;
        self.Attributes = new Object;
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            if (typeof exclude !== 'undefined' && exclude.indexOf(attr.name) > -1)
                continue;
            self.Attributes[attr.name] = attr.value;
        }
    }
}
/**
 * A prompt engine for VNS.
 */
class SutoriEngine {
    constructor(document) {
        this.Document = document;
    }
    /**
     * Goto a specific moment found in the Document by id.
     * @param momentID The id of the moment to move the cursor to.
     */
    async GotoMomentID(momentID) {
        const moment = this.Document.Moments.find(t => t.ID == momentID);
        if (moment == null)
            throw new Error("Could not find moment with id #{momentID}.");
        this.GotoMoment(moment);
    }
    /**
     * Goto a specific moment found in the Document by instance.
     * @param moment The instance of the moment to move the cursor to.
     */
    async GotoMoment(moment) {
        const self = this;
        if (moment == null)
            moment = this.Document.Moments[0];
        if (moment == null)
            throw new Error("Document does not have any beads!");
        this.Cursor = moment;
        // execute any load elements set to encounter.
        const loaderElements = moment.GetLoaderElements();
        if (loaderElements && loaderElements.length > 0) {
            for (let i = 0; i < loaderElements.length; i++) {
                await self.Document.AddDataFromXmlUri(loaderElements[i].Path);
                loaderElements[i].Loaded = true;
            }
        }
        this.HandleChallenge(new SutoriChallengeEvent(this, moment));
    }
    /**
     * Goto the first moment in the document.
     */
    Play() {
        this.GotoMoment(null);
    }
    /**
     * Go to the next logical moment. The next sequential moment is selected,
     * unless the current moment has a goto option, which will be used instead
     * if found.
     * @returns boolean True if successful.
     */
    GotoNextMoment() {
        if (this.Cursor == null)
            return; // no cursor present.
        const index = this.Document.Moments.indexOf(this.Cursor);
        if (index == -1)
            return false; // cursor doesn't belong to document.
        // if the moment has a goto, use that instead.
        if (this.Cursor.Goto != '') {
            this.GotoMomentID(this.Cursor.Goto);
            return false;
        }
        if (index == this.Document.Moments.length - 1)
            return false; // end of sequence.
        this.GotoMoment(this.Document.Moments[index + 1]);
        return true;
    }
}
/**
 * Describes a load moment element that loads further moments.
 */
class SutoriInclude {
    constructor() {
        this.Path = "";
    }
    static Parse(element) {
        const result = new SutoriInclude();
        result.Path = element.textContent;
        result.After = element.hasAttribute('after') && element.attributes["after"] === true;
        return result;
    }
}
/**
 * Describes a moment in time.
 */
class SutoriMoment {
    constructor() {
        this.Attributes = new Object;
        this.Elements = new Array();
        this.Goto = '';
        this.ID = '';
        this.Clear = true;
    }
    /**
     * Add a text element to this moment.
     * @param culture The culture of the element.
     * @param text The associated text.
     * @returns The added element.
     */
    AddText(culture, text) {
        const element = new SutoriElementText();
        element.ContentCulture = culture;
        element.Text = text;
        this.Elements.push(element);
        return element;
    }
    /**
     * Add an image element to this moment.
     * @param culture The culture of the element.
     * @param resource The associated resource id.
     * @returns The added element.
     */
    AddImage(culture, resource) {
        const element = new SutoriElementImage();
        element.ContentCulture = culture;
        element.ResourceID = resource;
        this.Elements.push(element);
        return element;
    }
    /**
     * Add an audio element to this moment.
     * @param culture The culture of the element.
     * @param src The associated file src.
     * @returns The added element.
     */
    AddAudio(culture, src) {
        const element = new SutoriElementAudio();
        element.ContentCulture = culture;
        element.Src = src;
        this.Elements.push(element);
        return element;
    }
    /**
     * Add a video element to this moment.
     * @param culture The culture of the element.
     * @param src The associated file src.
     * @returns The added element.
     */
    AddVideo(culture, src) {
        const element = new SutoriElementVideo();
        element.ContentCulture = culture;
        element.Src = src;
        this.Elements.push(element);
        return element;
    }
    /**
     * Add an option element to this moment.
     * @param culture The culture of the element.
     * @param text The associated text.
     * @param text The id of the moment to target when this option is selected.
     * @returns The added element.
     */
    AddOption(culture, text, target) {
        const element = new SutoriElementOption();
        element.ContentCulture = culture;
        element.Text = text;
        element.Target = target;
        this.Elements.push(element);
        return element;
    }
    /**
     * Find all loader elements.
     * @param mode The mode.
     */
    GetLoaderElements() {
        const elements = this.Elements.filter(e => e instanceof SutoriElementLoad);
        return elements;
    }
    /**
     * Get an array of elements of type.
     * @param culture The SutoriCulture, default is: SutoriCulture.None
     * @param type The type of element to return, for example SutoriElementText
     * @returns An array of the type requested.
     */
    GetElements(culture, type) {
        const self = this;
        const elements = typeof culture == 'undefined'
            ? self.Elements.filter(e => e instanceof type)
            : self.Elements.filter(e => e instanceof type && (e.ContentCulture == culture || e.ContentCulture == SutoriCulture.All));
        return elements;
    }
    /**
     * Get an array of text elements.
     * @param culture The SutoriCulture, default is: SutoriCulture.None
     * @returns An array of text elements.
     */
    GetTexts(culture) {
        return this.GetElements(culture, SutoriElementText);
    }
    /**
     * Get the concatenated text.
     * @param culture The SutoriCulture, default is: SutoriCulture.None
     * @returns
     */
    GetText(culture) {
        const texts = this.GetTexts(culture);
        let text = '';
        for (var j = 0; j < texts.length; j++) {
            text += texts[j].Text;
        }
        return text;
    }
    /**
     * Get an array of option elements.
     * @param culture The SutoriCulture, default is: SutoriCulture.None
     * @returns An array of option elements.
     */
    GetOptions(culture) {
        return this.GetElements(culture, SutoriElementOption);
    }
    /**
     * Get an array of image elements.
     * @param culture The SutoriCulture, default is: SutoriCulture.None
     * @returns An array of image elements.
     */
    GetImages(culture) {
        return this.GetElements(culture, SutoriElementImage);
    }
    /**
     * Get an array of audio elements.
     * @param culture The SutoriCulture, default is: SutoriCulture.None
     * @returns An array of audio elements.
     */
    GetAudio(culture) {
        return this.GetElements(culture, SutoriElementAudio);
    }
    /**
     * Get an array of video elements.
     * @param culture The SutoriCulture, default is: SutoriCulture.None
     * @returns An array of video elements.
     */
    GetVideos(culture) {
        return this.GetElements(culture, SutoriElementVideo);
    }
    /**
    * Try to get an associated actor for this element.
    * @param document The owner document.
    */
    FindAssociatedActor(document) {
        // return null if no actor attribute is set.
        if (this.Actor == null)
            return null;
        // find the actor.
        return document.Actors.find(t => t.ID == this.Actor);
    }
}
/**
 * The base class for all moment elements.
 */
class SutoriResource {
    /**
     * Parse extra attributes when parsing an element.
     * @param element The source element.
     * @param exclude An array of keys to exclude.
     */
    ParseExtraAttributes(element, exclude) {
        const self = this;
        self.Attributes = new Object;
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            if (typeof exclude !== 'undefined' && exclude.indexOf(attr.name) > -1)
                continue;
            self.Attributes[attr.name] = attr.value;
        }
    }
}
/**
 * Various helper tools.
 */
class SutoriTools {
    /**
     * Return true of the passed text is either true or 1.
     * @param text
     * @returns
     */
    static ParseBool(text) {
        if (!text)
            return false;
        const str = String(text).toLowerCase();
        if (str == "true")
            return true;
        return (str === "1");
    }
    /**
     * Convert the text value of a culture into the enum key equivalent. For
     * example 'en-GB' becomes VnCulture.enGB
     * @param cultureName
     */
    static ParseCulture(cultureName) {
        var _a;
        const stringKey = (_a = Object.entries(SutoriCulture)
            .find(([key, val]) => val === cultureName)) === null || _a === void 0 ? void 0 : _a[0];
        return SutoriCulture[stringKey];
    }
    /**
     * Convert the text value of a solver into the enum key equivalent. For
     * example 'option_index' becomes VnSolver.OptionIndex
     * @param solverName
     */
    static ParseSolver(solverName) {
        var _a;
        const stringKey = (_a = Object.entries(SutoriSolver)
            .find(([key, val]) => val === solverName)) === null || _a === void 0 ? void 0 : _a[0];
        return SutoriSolver[stringKey];
    }
}
/**
 * Describes an audio moment element.
 */
class SutoriElementAudio extends SutoriElement {
    constructor() {
        super();
        this.ContentCulture = SutoriCulture.None;
    }
    static Parse(element) {
        const result = new SutoriElementAudio();
        result.Src = element.textContent;
        result.ParseExtraAttributes(element, ['actor', 'lang']);
        if (element.hasAttribute('actor')) {
            result.Actor = element.attributes['actor'].textContent;
        }
        if (element.hasAttribute('lang')) {
            const lang = element.attributes['lang'].textContent;
            result.ContentCulture = SutoriTools.ParseCulture(lang);
        }
        return result;
    }
    /**
     * Try to get an associated actor for this element.
     * @param document The owner document.
     */
    GetAssociatedActor(document) {
        // return null if no actor attribute is set.
        if (this.Actor == null)
            return null;
        // find the actor.
        return document.Actors.find(t => t.ID == this.Actor);
    }
}
/**
 * Describes an image moment element.
 */
class SutoriElementImage extends SutoriElement {
    constructor() {
        super();
        this.ContentCulture = SutoriCulture.None;
    }
    static Parse(element) {
        const result = new SutoriElementImage();
        result.ParseExtraAttributes(element, ['actor', 'resource', 'purpose', 'lang']);
        if (element.hasAttribute('actor')) {
            result.Actor = element.attributes['actor'].textContent;
        }
        if (element.hasAttribute('resource')) {
            result.ResourceID = element.attributes['resource'].textContent;
        }
        if (element.hasAttribute('for')) {
            result.For = element.attributes['for'].textContent;
        }
        if (element.hasAttribute('lang')) {
            const lang = element.attributes['lang'].textContent;
            result.ContentCulture = SutoriTools.ParseCulture(lang);
        }
        return result;
    }
    /**
     * Try to get an associated actor for this element.
     * @param document The owner document.
     */
    GetAssociatedActor(document) {
        // return null if no actor attribute is set.
        if (this.Actor == null)
            return null;
        // find the actor.
        return document.Actors.find(t => t.ID == this.Actor);
    }
}
/**
 * Describes a load moment element that loads further moments.
 */
class SutoriElementLoad extends SutoriElement {
    constructor() {
        super();
        this.ContentCulture = SutoriCulture.None;
        this.Loaded = false;
    }
    static Parse(element) {
        const result = new SutoriElementLoad();
        result.Path = element.textContent;
        result.ParseExtraAttributes(element, ['mode']);
        return result;
    }
}
/**
 * Describes an option moment element.
 */
class SutoriElementOption extends SutoriElement {
    constructor() {
        super();
        this.ContentCulture = SutoriCulture.None;
        this.Target = null;
        this.Solver = SutoriSolver.None;
        this.SolverCallback = null;
    }
    static Parse(element) {
        const result = new SutoriElementOption();
        result.Text = element.textContent;
        result.ParseExtraAttributes(element, ['lang', 'target', 'solver', 'solver_callback']);
        if (element.hasAttribute('lang')) {
            const lang = element.attributes['lang'].textContent;
            result.ContentCulture = SutoriTools.ParseCulture(lang);
        }
        if (element.hasAttribute('target')) {
            result.Target = element.attributes['target'].textContent;
        }
        if (element.hasAttribute('solver')) {
            const solver = element.attributes['solver'].textContent;
            result.Solver = SutoriTools.ParseSolver(solver);
        }
        if (element.hasAttribute('solver_callback')) {
            result.Target = element.attributes['solver_callback'].textContent;
        }
        return result;
    }
}
/**
 * Describes a load moment element that loads further moments.
 */
class SutoriElementSet extends SutoriElement {
    constructor() {
        super();
        this.ContentCulture = SutoriCulture.None;
        this.Name = null;
    }
    static Parse(element) {
        const result = new SutoriElementSet();
        result.Value = element.textContent;
        result.ParseExtraAttributes(element, ['name']);
        if (element.hasAttribute('name')) {
            result.Name = element.attributes['name'].textContent;
        }
        return result;
    }
}
/**
 * Describes a text moment element.
 */
class SutoriElementText extends SutoriElement {
    constructor() {
        super();
        this.ContentCulture = SutoriCulture.None;
    }
    static Parse(element) {
        const result = new SutoriElementText();
        result.Text = element.textContent;
        result.ParseExtraAttributes(element, ['lang']);
        if (element.hasAttribute('lang')) {
            const lang = element.attributes['lang'].textContent;
            result.ContentCulture = SutoriTools.ParseCulture(lang);
        }
        return result;
    }
}
/**
 * Describes a load moment element that loads further moments.
 */
class SutoriElementTrigger extends SutoriElement {
    constructor() {
        super();
        this.ContentCulture = SutoriCulture.None;
        this.Action = null;
    }
    static Parse(element) {
        const result = new SutoriElementTrigger();
        result.Body = element.textContent;
        result.ParseExtraAttributes(element, ['action']);
        if (element.hasAttribute('action')) {
            result.Action = element.attributes['action'].textContent;
        }
        return result;
    }
}
/**
 * Describes a video moment element.
 */
class SutoriElementVideo extends SutoriElement {
    constructor() {
        super();
        this.ContentCulture = SutoriCulture.None;
    }
    static Parse(element) {
        const result = new SutoriElementVideo();
        result.Src = element.textContent;
        result.ParseExtraAttributes(element, ['actor', 'lang']);
        if (element.hasAttribute('actor')) {
            result.Actor = element.attributes['actor'].textContent;
        }
        if (element.hasAttribute('lang')) {
            const lang = element.attributes['lang'].textContent;
            result.ContentCulture = SutoriTools.ParseCulture(lang);
        }
        return result;
    }
    /**
     * Try to get an associated actor for this element.
     * @param document The owner document.
     */
    GetAssociatedActor(document) {
        // return null if no actor attribute is set.
        if (this.Actor == null)
            return null;
        // find the actor.
        return document.Actors.find(t => t.ID == this.Actor);
    }
}
/**
 * Describes an image resource.
 */
class SutoriResourceImage extends SutoriResource {
    constructor() {
        super();
        this.ID = null;
        this.Name = 'Untitled';
        this.Attributes = new Object();
    }
    static Parse(element) {
        const result = new SutoriResourceImage();
        result.ParseExtraAttributes(element, ['id', 'name', 'src']);
        if (element.hasAttribute('id')) {
            result.ID = element.attributes['id'].textContent;
        }
        if (element.hasAttribute('name')) {
            result.Name = element.attributes['name'].textContent;
        }
        if (element.hasAttribute('resource')) {
            result.Src = element.attributes['src'].textContent;
        }
        return result;
    }
}
var SutoriCulture;
(function (SutoriCulture) {
    SutoriCulture["None"] = "none";
    SutoriCulture["All"] = "all";
    SutoriCulture["EnUS"] = "en-US";
    SutoriCulture["zhCN"] = "zh-CN";
    SutoriCulture["ruRU"] = "ru-RU";
    SutoriCulture["FrFR"] = "fr-FR";
    SutoriCulture["esES"] = "es-ES";
    SutoriCulture["EnGB"] = "en-GB";
    SutoriCulture["deDE"] = "de-DE";
    SutoriCulture["ptBR"] = "pt-BR";
    SutoriCulture["enCA"] = "en-CA";
    SutoriCulture["esMX"] = "es-MX";
    SutoriCulture["itIT"] = "it-IT";
    SutoriCulture["jaJP"] = "ja-JP"; /* Japanese (Japan) */
})(SutoriCulture || (SutoriCulture = {}));
var SutoriSolver;
(function (SutoriSolver) {
    /** use this when no solver is required */
    SutoriSolver["None"] = "none";
    /** use this when an option should be selected based on the index position of the option chosen */
    SutoriSolver["OptionIndex"] = "option_index";
    /** use this when an option should be selected based on a selected keyboard character */
    SutoriSolver["KeyCharEquality"] = "key_char_equality";
    /** use this when an option should be selected when text matches */
    SutoriSolver["TextEquality"] = "text_equality";
    /** use this if the custom callback should be used to determine when an option should be selected */
    SutoriSolver["Custom"] = "custom";
})(SutoriSolver || (SutoriSolver = {}));
//# sourceMappingURL=sutori.js.map