# Tiptap

The repo contains a template to build Tiptap as a vue component that can be used with `script` (as UMD). 

## Usage

- `npm install`
- Customize editor options and extensions in `src/`
- Run `npm run build`
- Copy file in `dist/index.js` and use.
- Enjoy

## Image upload

The image upload feature uploads images to Cloudinary. You can customise this behaviour by updating `extensions/upload.js`. If you'd rather use Cloudinary, do not forget to set `unsignedUploadPreset` or better still, do signed upload.