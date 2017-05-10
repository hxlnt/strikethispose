# `Strike(this.Pose)`
`Strike(this.Pose)` is a web app that uses a webcam and [Microsoft Cognitive Services APIs](https://www.microsoft.com/cognitive-services) to test your ability to match a series of facial expressions. Test it at [https://strikethispose.azurewebsites.net](https://strikethispose.azurewebsites.net). (Note: getUserMedia API is not compatible with Safari on OS X and iOS.)

![Demo](https://pbs.twimg.com/media/C_V9vxjUwAAepD_.jpg)

## How it works
This web application uses the `getUserMedia` API in the browser to capture a live video feed from a webcam. When the user clicks the "Snap photo" button, a still image from the video is written to a `<canvas>`. The image is then sent as a data URL to two Cognitive Services APIs: The [Face API](https://www.microsoft.com/cognitive-services/en-us/face-api) and the [Emotion API](https://www.microsoft.com/cognitive-services/en-us/emotion-api). The existing photo being matched against is sent to these APIs as well. Finally, selected results are compared and a score is calculated by way of a Very Complicated Algorithm*. There are a few other technologies working behind the scenes, including websockets and [Node.js](http://nodejs.org).

*Javascript

## D.I.Y.: Deploy It Yourself!
You can clone this repo to your local machine and run it locally. Or, you can fork it and have it autodeploy to an [Azure Web App](https://azure.microsoft.com/en-us/services/app-service/web/). 

### Run locally

 1. Clone this repo to your local machine (`git clone https://github.com/hxlnt/strikethispose`).
 2. Replace `process.env.facekey` and `process.env.emokey` with your own (free) [Cognitive Services API keys](https://www.microsoft.com/cognitive-services). You can put these keys in a separate env file or right in `app.js`.
 3. `cd` into the repo and run `npm install` then `node app.js`. This will start a server at [http://localhost:3002](http://localhost:3002).

### OR: Deploy to Azure

 1. Fork this repo.
 2. Connect your fork to an Azure Web App. See [this page](https://docs.microsoft.com/en-us/azure/app-service-web/app-service-continuous-deployment) for step-by-step instructions.
 3. Add your own (free) [Cognitive Services API keys](https://www.microsoft.com/cognitive-services) under your Web App's Application Settings. Be sure to call the keys `facekey` and `emokey`, respectively. In the same Application Settings menu, switch websockets on. 

### Customize

Once you have the app running, open up `js/script.js` and replace the images in `imgarray` with your own photos! That way, you can challenge your friends to make facial expressions that mimic you. Or pop stars. Or actors. Or whoever. Do note that if you want to use local paths here instead of remote links, you'll need to replace both instances of `url` in `app.js` with `path`.

## // TODO

This app was built as a quick up-and-running prototype, and the code has some less-than-best practices :). Here are a few outstanding issues. Feel free to submit an issue/PR related to these or other issues if you're so inclined.

 - Improve error handling
 - Improve browser resize behavior
 - Improve mobile phone experience
 - Improve code readability (*e.g.,* mix of similar JQuery/not-Jquery methods is fine but hurts readability)
 - Replace hacky things like overwriting contents of `<div>`s with Good Javascript

## More demos, please!

I've got [another repository](https://github.com/hxlnt/aifunclub) that demonstrates a very useful feature of the Face API: making DEAL WITH IT memes.

![Deal with it](https://github.com/hxlnt/aifunclub/blob/master/dealwithitbot.gif)

Here are Microsoft's [official SDKs and samples for Cognitive Services](https://www.microsoft.com/cognitive-services/en-us/SDK-Sample).

gl,hf! xoxox rae
