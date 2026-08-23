const Jimp = require("jimp");

Jimp.read("public/logo.jpg").then(image => {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        var red   = this.bitmap.data[idx + 0];
        var green = this.bitmap.data[idx + 1];
        var blue  = this.bitmap.data[idx + 2];
        
        if (red > 230 && green > 230 && blue > 230) {
            this.bitmap.data[idx + 3] = 0;
        }
    });
    image.write("public/logo.png");
    console.log("Converted logo.png");
}).catch(err => {
    console.error(err);
});
