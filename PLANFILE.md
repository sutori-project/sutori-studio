## Done:

- Change load characteristic of moments to be an attribute not an element [can_be_ignored]
- Add dialog for editing option properties. [done]
- Make language switch option locale too. [done]
- Add dialog for editing image properties. [done]
- App Icon & Logo. [done]
- Add triggers list to moment properties dialog. [done]
- Add setters list to moment properties dialog. [done]
- Allow the loading and saving of files with media and options. [done]
- Added ability to load relative images, and also embed them. [done]
- Show thumbnail for loaded images. [done]
- Modify project to include sutori-js via NPM instead. [done]

## Still To Do:

- Add ability to show assigned colours for actors.
- Add a custom properties table for actors, moments, media & options.
- Auto-update id's when changing the id of an actor (and prompt before doing it).
- Settings system and screen.
- Splash Screen.
- Ability to publish game.
- Comment code more.

## Bugs

- The sidebar file icon is really bad.
- There is currently no code to alert the user when they are about to create a duplicate resource id.
- When a resource id changes, or resource is removed, the app does not yet update moments and their elements appropriately.
- Resource name gets replaced when you load a file when it shouldn't.
- Embed image does not yet work correctly, it tends to clip the image.
- Fix about command on web mode (currently doesn't work due to not having neutralino).

## Stretch goals.

- Other forms of media like audio/video.