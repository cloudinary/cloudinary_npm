
interface Common {

}

interface V1 extends Common{
    // TODO: are these part of the official API?
    api:any
    uploader:any

    v2:V2
}

interface V2 extends Common {
    // TODO: are these part of the official API?
    api:any
    uploader:any
    search()
}


declare const cloudinary:V1;

export = cloudinary;