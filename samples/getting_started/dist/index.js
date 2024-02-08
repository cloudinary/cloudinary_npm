"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
// Update to your credentials
cloudinary_1.v2.config({
    cloud_name: 'djt05azw9',
    api_key: '498954731971784',
    api_secret: 'lBuhJudP5cjHI5KK5JC-PHkYWEc'
});
//Upload an image with auto tag
// register to auto tagging https://cloudinary.com/documentation/google_auto_tagging_addon
// cloudinary.uploader.upload(
//     "https://res.cloudinary.com/demo/image/upload/v1707306308/cld-docs-hp/walking_woman",
//     { public_id: "walking_woman", categorization: "google_tagging" })
//     .then((result)=>{
//         console.log(result.info.categorization.google_tagging)}).catch((error)=> {console.log(error)});
//
// //Upload an image for you underlay
// cloudinary.uploader.upload(
//     "https://res.cloudinary.com/demo/image/upload/v17073124415555/cld-docs-hp/street.jpg",
//     { public_id: "street" })
//     .then((result)=>{
//         console.log(result)}).catch((error)=> {console.log(error)});
//Transformation image
const url = cloudinary_1.v2.url("walking_woman", {
    transformation: [
        { effect: "background_removal" },
        { gravity: "auto", crop: "auto", width: 450 },
        { underlay: "street" },
        { format: "auto", quality: "auto" },
        { if: "!Overcoat!_in_tags" },
        {
            overlay: { font_family: "Arial", font_size: 25, letter_spacing: 14, font_weight: "bold", text: "NEW COLLECTION" },
            color: "white"
        },
        { if: "end" },
    ]
});
console.log("this is the transformed url", url);
