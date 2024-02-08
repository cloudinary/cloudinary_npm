import {v2 as cloudinary} from 'cloudinary';

// Update to your credentials
cloudinary.config({
    cloud_name: '<cloud_name>',
    api_key: '<api_key>',
    api_secret: '<api_secret>'
});

// Ensure that you're registered to auto tagging https://cloudinary.com/documentation/google_auto_tagging_addon
// Ensure that you're registered to background removal https://cloudinary.com/documentation/cloudinary_ai_background_removal_addon
//Upload an image with auto tag
cloudinary.uploader.upload(
    "https://res.cloudinary.com/demo/image/upload/v1707306308/cld-docs-hp/walking_woman",
    { public_id: "walking_woman", categorization: "google_tagging" })
    .then((result)=>{
        console.log(result.info.categorization.google_tagging)}).catch((error)=> {console.log(error)});

// log in to you cloudinary account. Navigate to the newly uploaded `walking_woman` image. Select open on the image
// and navigate to the Metadata tab. Select Auto tags, select plus on the Overcoat tag to tag your image.

//Upload an image for you underlay
cloudinary.uploader.upload(
    "https://res.cloudinary.com/demo/image/upload/v17073124415555/cld-docs-hp/street.jpg",
    { public_id: "street" })
    .then((result)=>{
        console.log(result)}).catch((error)=> {console.log(error)});


//Transformation image
const url = cloudinary.url("walking_woman", {
    transformation: [
        { effect: "background_removal" },
        { gravity: "auto", crop: "auto", width: 450 },
        { underlay: "street"},
        {if: "!Overcoat!_in_tags"},
        {
            overlay:
                { font_family: "Arial", font_size: 25,  letter_spacing: 14, font_weight:"bold", text: "NEW COLLECTION" },
            color: "white"
        },
        {if: "end"},
        { format: "auto", quality: "auto"}
    ]
});

console.log("this is the transformed url", url);
