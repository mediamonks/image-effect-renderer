export default class ImageLoader {
  static loadImages(images) {
    return Promise.all(
      images.map(fileName => ImageLoader.loadImage(fileName)),
    );
  }

  static loadImage(fileName) {
    return new Promise((resolve) => {
      const img = new Image;
      img.onload = () => resolve(img);
      img.src = `./static/${fileName}`;
    });
  }
}
