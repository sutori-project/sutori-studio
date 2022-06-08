/**
 * The base class for all moment elements.
 */
declare class SutoriActor {
    Attributes: object;
    ContentCulture: SutoriCulture;
    Elements: Array<SutoriElement>;
    ID: string;
    Name: string;
    constructor();
    static Parse(actor_e: HTMLElement): SutoriActor;
}
/**
 * Describes information passed to client code when a challenge event occurs.
 */
declare class SutoriChallengeEvent {
    readonly Owner: SutoriEngine;
    readonly Moment: SutoriMoment;
    readonly ElementCount: Number;
    constructor(owner: SutoriEngine, moment: SutoriMoment);
}
/**
 * Describes a document of multimedia moments.
 */
declare class SutoriDocument {
    /**
     * An array of actors.
     */
    readonly Resources: Array<SutoriResource>;
    /**
     * An array of actors.
     */
    readonly Actors: Array<SutoriActor>;
    /**
     * An array of moments.
     */
    readonly Moments: Array<SutoriMoment>;
    /**
     * An array of include elements scoped to the entire document.
     */
    readonly Includes: Array<SutoriInclude>;
    /**
     * Define a custom loader for URIs. Takes a uri and returns the loaded xml string.
     */
    CustomUriLoader?: CallableFunction;
    constructor();
    /**
     * Load a SutoriDocument from an XML file.
     * @param uri The uri location of the XML file to load.
     * @returns The loaded document.
     */
    static LoadXml(uri: string): Promise<SutoriDocument>;
    /**
     * Append moments from an XML file.
     * @param uri The uri location of the XML file to load.
     */
    AddDataFromXmlUri(uri: string): Promise<void>;
    /**
     * Append moments from a raw XML string.
     * @param raw_xml The raw XML string to parse.
     */
    AddDataFromXml(raw_xml: string): Promise<void>;
    /**
     * Called by AddMomentsFromXml to add extra attributes when reading moments.
     * @param moment The target moment to manipulate.
     * @param element The source element.
     * @param exclude An array of keys to exclude.
     */
    private AddMomentAttributes;
    /**
     * Get a resource by it's id.
     * @param id
     * @returns Either the found resource or undefined.
     */
    GetResourceByID(id: string): SutoriResource;
}
/**
 * The base class for all moment elements.
 */
declare abstract class SutoriElement {
    Attributes: Object;
    ContentCulture: SutoriCulture;
    /**
     * Parse extra attributes when parsing an element.
     * @param element The source element.
     * @param exclude An array of keys to exclude.
     */
    protected ParseExtraAttributes(element: HTMLElement, exclude?: Array<string>): void;
}
/**
 * A prompt engine for VNS.
 */
declare class SutoriEngine {
    private Cursor;
    private Document;
    HandleChallenge: CallableFunction;
    constructor(document: SutoriDocument);
    /**
     * Goto a specific moment found in the Document by id.
     * @param momentID The id of the moment to move the cursor to.
     */
    GotoMomentID(momentID: string): Promise<void>;
    /**
     * Goto a specific moment found in the Document by instance.
     * @param moment The instance of the moment to move the cursor to.
     */
    private GotoMoment;
    /**
     * Goto the first moment in the document.
     */
    Play(): void;
    /**
     * Go to the next logical moment. The next sequential moment is selected,
     * unless the current moment has a goto option, which will be used instead
     * if found.
     * @returns boolean True if successful.
     */
    GotoNextMoment(): boolean;
}
/**
 * Describes a load moment element that loads further moments.
 */
declare class SutoriInclude {
    /**
     * The uri of the xml file to load.
     */
    Path: string;
    /**
     * Weather to load the include after the document has loaded first.
     */
    After: boolean;
    constructor();
    static Parse(element: HTMLElement): SutoriInclude;
}
/**
 * Describes a moment in time.
 */
declare class SutoriMoment {
    /**
     * The associated actor id.
     */
    Actor?: string;
    /**
     * This moments attributes.
     */
    Attributes: Object;
    /**
     * The elements for this moment.
     */
    Elements: Array<SutoriElement>;
    /**
     * The next moment id to goto if no other navigation happens after this moment is encountered.
     */
    Goto: string;
    /**
     * The moment id.
     */
    ID: string;
    /**
     * Weather to clear the screen/terminal when this moment is encountered, set to false to layer moments.
     */
    Clear: boolean;
    constructor();
    /**
     * Add a text element to this moment.
     * @param culture The culture of the element.
     * @param text The associated text.
     * @returns The added element.
     */
    AddText(culture: SutoriCulture, text: string): SutoriElementText;
    /**
     * Add an image element to this moment.
     * @param culture The culture of the element.
     * @param resource The associated resource id.
     * @returns The added element.
     */
    AddImage(culture: SutoriCulture, resource: string): SutoriElementImage;
    /**
     * Add an audio element to this moment.
     * @param culture The culture of the element.
     * @param src The associated file src.
     * @returns The added element.
     */
    AddAudio(culture: SutoriCulture, src: string): SutoriElementAudio;
    /**
     * Add a video element to this moment.
     * @param culture The culture of the element.
     * @param src The associated file src.
     * @returns The added element.
     */
    AddVideo(culture: SutoriCulture, src: string): SutoriElementVideo;
    /**
     * Add an option element to this moment.
     * @param culture The culture of the element.
     * @param text The associated text.
     * @param text The id of the moment to target when this option is selected.
     * @returns The added element.
     */
    AddOption(culture: SutoriCulture, text: string, target: string): SutoriElementOption;
    /**
     * Find all loader elements.
     * @param mode The mode.
     */
    GetLoaderElements(): Array<SutoriElementLoad>;
    /**
     * Get an array of elements of type.
     * @param culture The SutoriCulture, default is: SutoriCulture.None
     * @param type The type of element to return, for example SutoriElementText
     * @returns An array of the type requested.
     */
    GetElements(culture?: SutoriCulture, type?: any): any[];
    /**
     * Get an array of text elements.
     * @param culture The SutoriCulture, default is: SutoriCulture.None
     * @returns An array of text elements.
     */
    GetTexts(culture?: SutoriCulture): Array<SutoriElementText>;
    /**
     * Get the concatenated text.
     * @param culture The SutoriCulture, default is: SutoriCulture.None
     * @returns
     */
    GetText(culture?: SutoriCulture): string;
    /**
     * Get an array of option elements.
     * @param culture The SutoriCulture, default is: SutoriCulture.None
     * @returns An array of option elements.
     */
    GetOptions(culture?: SutoriCulture): Array<SutoriElementOption>;
    /**
     * Get an array of image elements.
     * @param culture The SutoriCulture, default is: SutoriCulture.None
     * @returns An array of image elements.
     */
    GetImages(culture?: SutoriCulture): Array<SutoriElementImage>;
    /**
     * Get an array of audio elements.
     * @param culture The SutoriCulture, default is: SutoriCulture.None
     * @returns An array of audio elements.
     */
    GetAudio(culture?: SutoriCulture): Array<SutoriElementAudio>;
    /**
     * Get an array of video elements.
     * @param culture The SutoriCulture, default is: SutoriCulture.None
     * @returns An array of video elements.
     */
    GetVideos(culture?: SutoriCulture): Array<SutoriElementVideo>;
    /**
    * Try to get an associated actor for this element.
    * @param document The owner document.
    */
    FindAssociatedActor(document: SutoriDocument): SutoriActor;
}
/**
 * The base class for all moment elements.
 */
declare abstract class SutoriResource {
    Attributes: Object;
    /**
     * The resource id.
     */
    ID?: string;
    /**
     * The resource name.
     */
    Name?: string;
    /**
     * Parse extra attributes when parsing an element.
     * @param element The source element.
     * @param exclude An array of keys to exclude.
     */
    protected ParseExtraAttributes(element: HTMLElement, exclude?: Array<string>): void;
}
/**
 * Various helper tools.
 */
declare class SutoriTools {
    /**
     * Return true of the passed text is either true or 1.
     * @param text
     * @returns
     */
    static ParseBool(text: string): boolean;
    /**
     * Convert the text value of a culture into the enum key equivalent. For
     * example 'en-GB' becomes VnCulture.enGB
     * @param cultureName
     */
    static ParseCulture(cultureName: string): SutoriCulture;
    /**
     * Convert the text value of a solver into the enum key equivalent. For
     * example 'option_index' becomes VnSolver.OptionIndex
     * @param solverName
     */
    static ParseSolver(solverName: string): SutoriSolver;
}
/**
 * Describes an audio moment element.
 */
declare class SutoriElementAudio extends SutoriElement {
    /**
     * The associated actor id.
     */
    Actor?: string;
    /**
     * The audio file uri.
     */
    Src: string;
    constructor();
    static Parse(element: HTMLElement): SutoriElementAudio;
    /**
     * Try to get an associated actor for this element.
     * @param document The owner document.
     */
    GetAssociatedActor(document: SutoriDocument): SutoriActor;
}
/**
 * Describes an image moment element.
 */
declare class SutoriElementImage extends SutoriElement {
    /**
     * The associated actor id.
     */
    Actor?: string;
    /**
     * The purpose of this image. For example; avatar, background etc...
     */
    For?: string;
    /**
     * The resource id for the image data.
     */
    ResourceID?: string;
    constructor();
    static Parse(element: HTMLElement): SutoriElementImage;
    /**
     * Try to get an associated actor for this element.
     * @param document The owner document.
     */
    GetAssociatedActor(document: SutoriDocument): SutoriActor;
}
/**
 * Describes a load moment element that loads further moments.
 */
declare class SutoriElementLoad extends SutoriElement {
    /**
     * The uri of the xml file to load.
     */
    Path: string;
    /**
     * Weather or not the content has been loaded yet.
     */
    Loaded: boolean;
    constructor();
    static Parse(element: HTMLElement): SutoriElementLoad;
}
/**
 * Describes an option moment element.
 */
declare class SutoriElementOption extends SutoriElement {
    /**
     * The textual content of this option.
     */
    Text: string;
    /**
     * The moment id target destination.
     */
    Target?: string;
    /**
     * The logical method to use to determine weather this option has been chosen.
     */
    Solver: SutoriSolver;
    /**
     * If a Custom solver is chosen, specify a callback to handle the solving.
     */
    SolverCallback?: string;
    constructor();
    static Parse(element: HTMLElement): SutoriElementOption;
}
/**
 * Describes a load moment element that loads further moments.
 */
declare class SutoriElementSet extends SutoriElement {
    /**
     * The value of the property.
     */
    Value: string;
    /**
     * The property name.
     */
    Name: string;
    constructor();
    static Parse(element: HTMLElement): SutoriElementSet;
}
/**
 * Describes a text moment element.
 */
declare class SutoriElementText extends SutoriElement {
    /**
     * The textual content of this element.
     */
    Text: string;
    constructor();
    static Parse(element: HTMLElement): SutoriElementText;
}
/**
 * Describes a load moment element that loads further moments.
 */
declare class SutoriElementTrigger extends SutoriElement {
    /**
     * The body of the trigger.
     */
    Body: string;
    /**
     * Weather or not the content has been loaded yet.
     */
    Action?: string;
    constructor();
    static Parse(element: HTMLElement): SutoriElementTrigger;
}
/**
 * Describes a video moment element.
 */
declare class SutoriElementVideo extends SutoriElement {
    Actor?: string;
    Src: string;
    constructor();
    static Parse(element: HTMLElement): SutoriElementVideo;
    /**
     * Try to get an associated actor for this element.
     * @param document The owner document.
     */
    GetAssociatedActor(document: SutoriDocument): SutoriActor;
}
/**
 * Describes an image resource.
 */
declare class SutoriResourceImage extends SutoriResource {
    /**
     * The resource id for the image data.
     */
    Src?: string;
    /**
     * Weather or not to preload this image resource.
     */
    Preload: boolean;
    constructor();
    static Parse(element: HTMLElement): SutoriResourceImage;
}
declare enum SutoriCulture {
    None = "none",
    All = "all",
    EnUS = "en-US",
    zhCN = "zh-CN",
    ruRU = "ru-RU",
    FrFR = "fr-FR",
    esES = "es-ES",
    EnGB = "en-GB",
    deDE = "de-DE",
    ptBR = "pt-BR",
    enCA = "en-CA",
    esMX = "es-MX",
    itIT = "it-IT",
    jaJP = "ja-JP"
}
declare enum SutoriSolver {
    /** use this when no solver is required */
    None = "none",
    /** use this when an option should be selected based on the index position of the option chosen */
    OptionIndex = "option_index",
    /** use this when an option should be selected based on a selected keyboard character */
    KeyCharEquality = "key_char_equality",
    /** use this when an option should be selected when text matches */
    TextEquality = "text_equality",
    /** use this if the custom callback should be used to determine when an option should be selected */
    Custom = "custom"
}
