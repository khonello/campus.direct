import ImageKit from 'imagekit-javascript';

const imagekit = new ImageKit({
    urlEndpoint: process.env.EXPO_PUBLIC_IMAGEKIT_URL || "",
    publicKey: process.env.EXPO_PUBLIC_IMAGEKIT_KEY || ""
})

export const getImagekitUrlFromPath = (imagePath, transformationArr) => {

    // from ImageKit hosting
    const ikOptions = {
        path: imagePath,
        transformation: transformationArr,
    };
    const imageURL = imagekit.url(ikOptions);
    return (
        decodeURIComponent(imageURL)
    )
}

export const getImagekitUrlFromSrc = (imageSrc, transformationArr) => {

    // from external hosting
    const ikOptions = {
        src: imageSrc,
        transformation: transformationArr,
    };
    const imageURL = imagekit.url(ikOptions);
    return (
        decodeURIComponent(imageURL)
    )
}