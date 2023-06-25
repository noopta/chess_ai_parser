package main

import (
	"context"
	"fmt"
	"os"
	"sync"

	openai "github.com/sashabaranov/go-openai"
)

// var topicMap map[string][]string

var counter = struct {
	sync.RWMutex
	topicMap map[string][]string
}{topicMap: make(map[string][]string)}

func analyzeText() {
	textContent, err := os.ReadFile("./transcript.txt")

	if err != nil {
		fmt.Println("An error occurred while reading the file")
		fmt.Println(err)
		return
	}

	stringConversion := string(textContent)
	currentIndex := 0
	maxChars := len(stringConversion)
	stringSections := []string{}

	for currentIndex < maxChars {
		if currentIndex+4000 <= maxChars {
			stringSections = append(stringSections, stringConversion[currentIndex:currentIndex+4000])
		} else {
			stringSections = append(stringSections, stringConversion[currentIndex:])
		}

		currentIndex += 4000
	}

	var wg sync.WaitGroup

	wg.Add(len(stringSections))

	fmt.Println("calling Chat GPT")
	fmt.Println()
	for i := 0; i < len(stringSections); i++ {
		go func(i int) {
			defer wg.Done()
			callGpt(stringSections[i])
		}(i)
	}

	wg.Wait()
}

func callGpt(currentText string) {
	// get API key from AMEX_PIN folder
	client := openai.NewClient("")
	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT3Dot5Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role: openai.ChatMessageRoleUser,
					Content: "Summarize the following text in the following way, find the central theme of the text, mention it in the beginning of your response (e.g. Economics: your explanation) be sure the explanation before your key point is a headline with 10 or less words " +
						" and list the key points as bullet points. Here is the text to analyze: \n\n" + currentText,
				},
			},
		},
	)

	if err != nil {
		fmt.Printf("ChatCompletion error: %v\n", err)
		return
	}

	// check if : exists and take text prior to it else it is misc info
	// if it is not key points

	// add key to map if not currently existing there, and  val

	fmt.Println(resp.Choices[0].Message.Content)
	fmt.Println("*******")
}

func main() {
	// podcastUrl := "https://www.youtube.com/watch?v=uJQmCFTYCh8&ab_channel=All-InPodcast"

	// var res []byte
	// ctx, cancel := chromedp.NewContext(context.Background(), chromedp.WithBrowserOption())
	// defer cancel()
	// log.Println("here")
	// err := chromedp.Run(ctx,
	// 	chromedp.Navigate("https://youtubetranscript.com/"),
	// 	chromedp.WaitReady("body"),
	// 	// chromedp.Click(`a[data-nav-role="signin"]`, chromedp.ByQuery),
	// 	// chromedp.Sleep(time.Second*2),
	// 	chromedp.SetValue(`video_url`, podcastUrl, chromedp.ByID),
	// 	chromedp.Click(`button[class="btn btn-block btn-lg btn-primary"]`, chromedp.ByID),
	// 	// chromedp.Sleep(time.Second*1),
	// 	// chromedp.CaptureScreenshot(&res),
	// )
	// log.Println("here5")
	// if err != nil {
	// 	log.Fatal(err)
	// }

	analyzeText()
	// os.WriteFile("loggedin.png", res, 0644)
}
