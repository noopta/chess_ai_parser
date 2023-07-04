package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/chromedp/chromedp"
	openai "github.com/sashabaranov/go-openai"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

type ChessMatchHtml struct {
	HtmlContent string
}

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
	client := openai.NewClient("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")
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

func getChessGames(username string) {

	url := "https://www.chess.com/member/noopdogg07"
	var urlList []string

	ctx, cancel := chromedp.NewContext(context.Background())
	defer cancel()

	fmt.Println("about to call timeout 2")
	// Create a timeout to limit the waiting time
	ctx, cancel = context.WithTimeout(ctx, 100*time.Second)
	defer cancel()

	fmt.Println("done timeout 2")
	err := chromedp.Run(ctx, chromedp.Navigate(url))
	if err != nil {
		log.Fatal(err)
	}

	// Wait for the page to load completely
	err = chromedp.Run(ctx, chromedp.WaitVisible(".archived-games-user-cell", chromedp.ByQueryAll))
	if err != nil {
		log.Fatal(err)
	}

	// Get the HTML content of the page
	var htmlContent string
	err = chromedp.Run(ctx, chromedp.Evaluate(`document.documentElement.outerHTML`, &htmlContent))
	if err != nil {
		log.Fatal(err)
	}

	// fmt.Println(html)
	ioutil.WriteFile("chessGameListData.txt", []byte(htmlContent), 0644)
	matchHtml := connectToMongoDb(htmlContent)
	urlList = getLinks(username, matchHtml)

	return

	var wg sync.WaitGroup

	wg.Add(len(urlList))

	for i := 0; i < len(urlList); i++ {
		go func(i int) {
			defer wg.Done()
			// pass in if it is expected that the user is white or black
			fmt.Println(urlList[i])
			parseChessMatch(urlList[i], i)
		}(i)
	}

	wg.Wait()
}

func getLinks(username string, htmlContent string) []string {
	var urlArray []string
	// Open the HTML file
	linkPrefix := "https://www.chess.com"
	linkMap := map[string]bool{}

	// file, err := os.Open("./chessGameListData.txt")
	// if err != nil {
	// 	log.Fatal(err)
	// }
	// defer file.Close()

	// Create a goquery document from the HTML file
	// doc, err := goquery.NewDocumentFromReader(file)
	doc, err := goquery.NewDocument(htmlContent)
	if err != nil {
		log.Fatal(err)
	}

	// Find all <a> tags and extract the href attribute
	doc.Find("a").Each(func(index int, element *goquery.Selection) {
		href, exists := element.Attr("href")
		if exists && strings.Contains(href, username) && strings.Contains(href, "game/live") {
			linkMap[linkPrefix+href] = true
		}
	})

	for key := range linkMap {
		urlArray = append(urlArray, key)
	}

	fmt.Println("done getting links")

	for i := 0; i < len(urlArray); i++ {
		fmt.Println(urlArray[i])
	}
	return urlArray
}

func parseChessMatch(url string, index int) {
	// url := "https://www.chess.com/game/live/80934761709?username=noopdogg07"
	// className := "white_node"

	// filePath := "chessMatchData" + strconv.Itoa(index) + ".txt"
	// fmt.Println(filePath)

	// var _, err = os.Stat(filePath)

	// if os.IsNotExist(err) {
	// 	var file, err = os.Create(filePath)

	// 	if err != nil {
	// 		fmt.Println(err)
	// 		return
	// 	}
	// 	defer file.Close()
	// }

	// ioutil.WriteFile(filePath, []byte("yo"), 0644)

	// return

	// return
	ctx, cancel := chromedp.NewContext(context.Background())
	defer cancel()

	fmt.Println("about to call timeout 1")
	// Create a timeout to limit the waiting time
	ctx, cancel = context.WithTimeout(ctx, 100*time.Second)
	defer cancel()
	fmt.Println("done timeout 1")
	err := chromedp.Run(ctx, chromedp.Navigate(url))
	if err != nil {
		log.Fatal(err)
	}

	// Wait for the page to load completely
	err = chromedp.Run(ctx, chromedp.WaitVisible(".move", chromedp.ByQueryAll))
	if err != nil {
		log.Fatal(err)
	}

	// Get the HTML content of the page
	var htmlContent string
	err = chromedp.Run(ctx, chromedp.Evaluate(`document.documentElement.outerHTML`, &htmlContent))
	if err != nil {
		log.Fatal(err)
	}

	// parsedHtml := reformatQuotationString(htmlContent)

	// ioutil.WriteFile(filePath, []byte(htmlContent), 0644)

	// html, err := ioutil.ReadFile(filePath)

	if err != nil {
		fmt.Println("An error occurred while reading the file")
		fmt.Println(err)
	}

	// ioutil.WriteFile("chessMatchData0.txt", []byte(htmlContent), 0644)

	parsedString := reformatQuotationString(htmlContent)

	fmt.Println("******")
	fmt.Println(parsedString)

	return
	// htmlToString := string(html)

	whiteMoves := Search(htmlContent, "white node")
	blackMoves := Search(htmlContent, "black node")

	for i := 0; i < len(whiteMoves); i++ {
		fmt.Print("move ")
		fmt.Print(i + 1)
		fmt.Println(": white " + whiteMoves[i] + " black " + blackMoves[i])
	}
}

func reformatQuotationString(text string) string {
	escapedText := strings.ReplaceAll(text, `"`, `\"`)
	escapedText = strings.ReplaceAll(escapedText, " ", "")
	return escapedText
}

func connectToMongoDb(htmlContent string) string {
	// https://cloud.mongodb.com/v2#/org/61d272d17795b52cac81de6e/projects
	// mongodb+srv://m001-student:<password>@sandbox.gjttf.mongodb.net/?retryWrites=true&w=majority

	atlasUri := "mongodb+srv://chess_parser_user:chessParser@sandbox.gjttf.mongodb.net/?retryWrites=true&w=majority"

	client, err := mongo.NewClient(options.Client().ApplyURI(atlasUri))
	if err != nil {
		log.Fatal(err)
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Fatal(err)
	}

	databases, err := client.ListDatabaseNames(ctx, bson.M{})

	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(databases)

	collection := client.Database("chess_match_database").Collection("match_collection")
	document := ChessMatchHtml{HtmlContent: htmlContent}

	result, err := collection.InsertOne(context.TODO(), document)

	if err != nil {
		fmt.Println(err)
		return ""
	}

	fmt.Printf("Inserted document with id %v\n", result.InsertedID)

	var matchHtml bson.M

	err = collection.FindOne(ctx, bson.M{}).Decode(&matchHtml)

	if err != nil {
		fmt.Println(err)
		return ""
	}

	return convertToString(matchHtml)
}

func convertToString(value map[string]interface{}) string {
	str, err := bson.Marshal(value)
	if err != nil {
		return ""
	}

	unescapedResult, err := url.PathUnescape(string(str))

	if err != nil {
		fmt.Println("Error:", err)
		return ""
	}

	return unescapedResult
}

// filter := bson.D{}
// opts := options.Find().SetProjection(bson.D{{"htmlcontent", 1}})

// cursor, err := collection.Find(context.TODO(), filter, opts)

// if err != nil {
// 	fmt.Println(err)
// 	return
// }

// var res []ChessMatchHtml

// if err = cursor.All(context.TODO(), &res); err != nil {
// 	fmt.Println(err)
// 	return
// }

// for _, res := range res {
// 	tempRes, _ := bson.MarshalExtJSON(res, false, false)
// 	fmt.Println(string(tempRes))
// }
func main() {
	getChessGames("noopdogg07")
	// chessParser()
	// os.WriteFile("loggedin.png", res, 0644)
}
