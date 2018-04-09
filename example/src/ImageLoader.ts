export default class ImageLoader {
  public static loadImages(images:Array<string>):Promise<any> {
    return Promise.all(
      images.map(fileName => ImageLoader.loadImage(fileName)),
    );
  }

  private static loadImage(fileName: string):Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image;
      img.onload = () => resolve(img);
      img.src = `../static/${fileName}`;
    });
  }
}
