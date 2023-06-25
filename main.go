package main

import (
	"context"
	"log"

	"github.com/chromedp/chromedp"
)

func main() {
	podcastUrl := "https://www.youtube.com/watch?v=uJQmCFTYCh8&ab_channel=All-InPodcast"

	// var res []byte
	ctx, cancel := chromedp.NewContext(context.Background(), chromedp.WithBrowserOption())
	defer cancel()
	log.Println("here")
	err := chromedp.Run(ctx,
		chromedp.Navigate("https://youtubetranscript.com/"),
		chromedp.WaitReady("body"),
		// chromedp.Click(`a[data-nav-role="signin"]`, chromedp.ByQuery),
		// chromedp.Sleep(time.Second*2),
		chromedp.SetValue(`video_url`, podcastUrl, chromedp.ByID),
		chromedp.Click(`button[class="btn btn-block btn-lg btn-primary"]`, chromedp.ByID),
		// chromedp.Sleep(time.Second*1),
		// chromedp.CaptureScreenshot(&res),
	)
	log.Println("here5")
	if err != nil {
		log.Fatal(err)
	}
	// os.WriteFile("loggedin.png", res, 0644)
}
