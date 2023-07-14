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
	"golang.org/x/net/html"

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
type MoveSet struct {
	PlayerMoves []string `bson:"moveSet"`
	PlayerColor string `bson:"playerColor"`
}

var counter = struct {
	sync.RWMutex
	topicMap map[string][]string
}{topicMap: make(map[string][]string)}

var atlasUri = os.Getenv("atlas_uri")

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

	// TODO Uncomment later, first get synchronous working then async
	// var wg sync.WaitGroup

	// wg.Add(len(stringSections))

	// fmt.Println("calling Chat GPT")
	// fmt.Println()
	// for i := 0; i < len(stringSections); i++ {
	// 	go func(i int) {
	// 		defer wg.Done()
	// 		callGpt(stringSections[i])
	// 	}(i)
	// }

	// wg.Wait()
}

func callGpt(currentGame MoveSet) {
	// get API key from AMEX_PIN folder

	var currentChessMoves string

	for i := 0; i < len(currentGame.PlayerMoves); i++ {
		currentChessMoves += currentGame.PlayerMoves[i] + " "
	}

	client := openai.NewClient(os.Getenv("open_api_key"))
	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT3Dot5Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role: openai.ChatMessageRoleUser,
					Content: "I am going to give you a set of chess moves by 1 player and their piece color. I want you to analyze the set of moves and determine 3 of their core weaknesses or areas of improvement. Provide feedback referring to specific moves, and provide resources for concepts to learn to overcome these weaknesses (e.g. Youtube videos, articles online, etc.)" + currentChessMoves + "\n" + currentGame.PlayerColor,
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
	// TODO: UNCOMMENT WHEN DONE READING FROM MONGO 


	matchHtml := connectToMongoDb(htmlContent)
	urlList = getLinks(username, matchHtml)

	
	// var wg sync.WaitGroup

	// wg.Add(5)

	for i := 0; i < 5; i++ {
		parseChessMatch(urlList[i], i)
	}

	// wg.Wait()

	readChessGamesFromMongo()
}

func getLinks(username string, htmlContent string) []string {
	var urlArray []string
	// Open the HTML file
	linkPrefix := "https://www.chess.com"
	linkMap := map[string]bool{}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(htmlContent))
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

	return urlArray
}

func parseChessMatch(url string, index int) {

	// <a class="user-username-component user-username-white user-username-link user-tagline-username" data-test-element="user-tagline-username">noopdogg07</a>

	fmt.Println(atlasUri)
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

	if err != nil {
		fmt.Println("An error occurred while reading the file")
		fmt.Println(err)
	}

	client, err := mongo.NewClient(options.Client().ApplyURI(atlasUri))
	if err != nil {
		log.Fatal(err)
	}

	ctx, _ = context.WithTimeout(context.Background(), 10*time.Second)

	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Fatal(err)
	}

	documentReader, err := html.Parse(strings.NewReader(htmlContent))
	if err != nil {
		fmt.Println("Error parsing HTML:", err)
		return
	}

	aLinks := searchChessPlayerColor(documentReader)

	for i := 0; i < len(aLinks); i++ {
		fmt.Print("a tag ")
		fmt.Println(aLinks[i])
	}

	whiteMoves := Search(htmlContent, "white node")
	blackMoves := Search(htmlContent, "black node")

	collection := client.Database("chess_match_database").Collection("individual_games")

	document := MoveSet{PlayerMoves: whiteMoves, PlayerColor: "white"}

	result, err := collection.InsertOne(context.TODO(), document)
	// result, err := collection.InsertOne(context.TODO(), document)

	if err != nil {
		fmt.Println("yo")
		fmt.Println(err)
		return
	} else {
		fmt.Println(result.InsertedID)
	}

	document = MoveSet{PlayerMoves: blackMoves, PlayerColor: "black"}

	// result, err = collection.InsertOne(context.TODO(), document)

	result, err = collection.InsertOne(context.TODO(), document)

	if err != nil {
		fmt.Println("yo2")
		fmt.Println(err)
		return
	} else {
		fmt.Println(result.InsertedID)
	}
	// post games to Mongo
	// then just read from mongo and analyze
}

func searchChessPlayerColor(node *html.Node) []string {
	var links []string

	// TODO: uncomment when ready to parse a tags 
	if node.Type == html.ElementNode && node.Data == "a" {
		for _, attr := range node.Attr {
			if attr.Key == "href" {

				// if (strings.Contains(attr.Val, "user-username-link user-tagline-username")) {
					
				// }
				links = append(links, attr.Val)
			}
		}
	}

	
	// for child := node.FirstChild; child != nil; child = child.NextSibling {
	// 	links = append(links, getATags(child)...)
	// }

	return links
}

func reformatQuotationString(text string) string {
	escapedText := strings.ReplaceAll(text, `"`, `\"`)
	escapedText = strings.ReplaceAll(escapedText, " ", "")
	return escapedText
}

func connectToMongoDb(htmlContent string) string {
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

	// inserting to collection
	collection := client.Database("chess_match_database").Collection("match_collection")
	document := ChessMatchHtml{HtmlContent: htmlContent}

	result, err := collection.InsertOne(context.TODO(), document)

	if err != nil {
		fmt.Println(err)
		return ""
	}

	fmt.Printf("Inserted document with id %v\n", result.InsertedID)

	// getting all elements from the collection 
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		log.Fatal(err)
	}

	var episodes []bson.M
	if err = cursor.All(ctx, &episodes); err != nil {
		log.Fatal(err)
	}

	// Convert primitive.M to []byte
	data, err := bson.Marshal(episodes[0])
	if err != nil {
		fmt.Println("Error:", err)
		return ""
	}

	var content ChessMatchHtml

	err = bson.Unmarshal(data, &content)

	return content.HtmlContent
}

func readChessGamesFromMongo() {
	// atlasUri := "mongodb+srv://chess_parser_user:chessParser@sandbox.gjttf.mongodb.net/?retryWrites=true&w=majority"
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

	// inserting to collection
	collection := client.Database("chess_match_database").Collection("individual_games")

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		log.Fatal(err)
	}

	var chessGames []bson.M
	if err = cursor.All(ctx, &chessGames); err != nil {
		log.Fatal(err)
	}	
	
	var wg sync.WaitGroup

	wg.Add(len(chessGames))

	// fmt.Println("calling Chat GPT")
	// fmt.Println()
	// for i := 0; i < len(stringSections); i++ {
	// 	go func(i int) {
	// 		defer wg.Done()
	// 		callGpt(stringSections[i])
	// 	}(i)
	// }

	for i:= 0; i < len(chessGames); i++ {

		go func(i int) {
			defer wg.Done()
			data, err := bson.Marshal(chessGames[i])
			if err != nil {
				fmt.Println("Error:", err)
				return
			}
	
			var content MoveSet
	
			err = bson.Unmarshal(data, &content)
		
			callGpt(content)
		} (i)
	}

	wg.Wait()
}

func makeQuotationMarksValid(input string) string {
	// Define the invalid quotation marks
	invalidQuotes := []string{"“", "”", "‘", "’"}

	// Define the valid quotation marks
	validQuotes := []string{"\"", "\"", "'", "'"}

	// Replace invalid quotation marks with valid ones
	for i := 0; i < len(invalidQuotes); i++ {
		input = strings.ReplaceAll(input, invalidQuotes[i], validQuotes[i])
	}

	return input
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

func main() {
	getChessGames("noopdogg07")
	// chessParser()
	// os.WriteFile("loggedin.png", res, 0644)
}
