package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"strings"
	"sync"
	"time"

	"github.com/golang/gddo/httputil/header"
	"golang.org/x/time/rate"

	"github.com/PuerkitoBio/goquery"
	"github.com/chromedp/chromedp"
	openai "github.com/sashabaranov/go-openai"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

type FrontEndRequest struct {
	Username string `json:"username"`
}

type ChessMatchHtml struct {
	HtmlContent string
}

type MoveSet struct {
	WhiteMoves  []string `bson:"whiteMoves"`
	BlackMoves  []string `bson:"blackMoves"`
	PlayerColor string   `bson:"playerColor"`
	Opponent    string   `bson:"opponent"`
	MatchBlurb  string   `bson:"matchBlurb"`
	Analysis    string   `bson:"analysis"`
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

	// TODO: modify WhiteMoves
	for i := 0; i < len(currentGame.WhiteMoves); i++ {
		currentChessMoves += currentGame.WhiteMoves[i] + " "
	}

	client := openai.NewClient(os.Getenv("open_api_key"))
	_, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT3Dot5Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleUser,
					Content: "I am going to give you a set of chess moves by 1 player and their piece color. I want you to analyze the set of moves and determine 3 of their core weaknesses or areas of improvement. Provide feedback referring to specific moves and what move they should have done instead, and provide resources for concepts to learn to overcome these weaknesses (e.g. Youtube videos, articles online, etc.)" + currentChessMoves + "\n" + currentGame.PlayerColor,
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
}

func getChessGames(username string) {

	url := "https://www.chess.com/member/noopdogg07"
	var urlList []string

	ctx, cancel := chromedp.NewContext(context.Background())
	defer cancel()

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

	// TODO: UNCOMMENT WHEN DONE READING FROM MONGO
	matchHtml := connectToMongoDb(htmlContent)
	urlList = getLinks(username, matchHtml)

	cancel()

	matchList := []MoveSet{}
	// var parsingWaitGroup sync.WaitGroup
	// parsingWaitGroup.Add(5)

	// parsingLimiter := rate.NewLimiter(rate.Every(time.Second/5), 5)
	for i := 0; i < 5; i++ {
		// go func(i int) {
		// 	defer parsingWaitGroup.Done()
		// 	if err := parsingLimiter.Wait(context.Background()); err != nil {
		// 		fmt.Println("yur")
		// 		fmt.Println(err)
		// 	}
		// 	parseChessMatch(urlList[i], i, &matchList)
		// }(i)
		parseChessMatch(urlList[i], i, &matchList)
	}

	// parsingWaitGroup.Wait()

	var wg sync.WaitGroup
	limiter := rate.NewLimiter(rate.Every(time.Second/5), 5)

	wg.Add(len(matchList))

	for i := 0; i < len(matchList); i++ {
		// fmt.Println(matchList[i])
		go func(i int) {
			defer wg.Done()
			if err := limiter.Wait(context.Background()); err != nil {
				fmt.Println("returning at open api")
				fmt.Println(err)
			}
			getChessBlurb(matchList[i])
		}(i)
	}

	wg.Wait()
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

	return urlArray
}

/*Write a function to add two*/
func parseChessMatch(url string, index int, matchList *[]MoveSet) {
	// <a class="user-username-component user-username-white user-username-link user-tagline-username" data-test-element="user-tagline-username">noopdogg07</a>
	ctx, cancel := chromedp.NewContext(context.Background())
	defer cancel()

	// Create a timeout to limit the waiting time
	ctx, cancel = context.WithTimeout(ctx, 20*time.Second)
	defer cancel()

	err := chromedp.Run(ctx, chromedp.Navigate(url))

	if err != nil {
		fmt.Println("cancelling")
		log.Fatal(err)
	}
	// Wait for the page to load completely
	// err = chromedp.Run(ctx, chromedp.WaitVisible(".move", chromedp.ByQueryAll))
	err = chromedp.Run(ctx, chromedp.WaitVisible(".move", chromedp.ByQueryAll))
	if err != nil {
		fmt.Println("returning here")
		log.Fatal(err)
	}

	// Get the HTML content of the page
	var htmlContent string
	err = chromedp.Run(ctx, chromedp.Evaluate(`document.documentElement.outerHTML`, &htmlContent))
	if err != nil {
		fmt.Println("cancelling 2")
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
		fmt.Println("cancelling 3")
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		fmt.Println("cancelling 4")
		log.Fatal(err)
	}

	if err != nil {
		fmt.Println(err)
		return
	}

	var whiteMoves []string
	var blackMoves []string
	// var document MoveSet

	userColorAndOpponent := searchChessPlayerColor(htmlContent, "noopdogg07")

	// collection := client.Database("chess_match_database").Collection("individual_games")

	whiteMoves = Search(htmlContent, "white node")
	blackMoves = Search(htmlContent, "black node")

	gameData := MoveSet{WhiteMoves: whiteMoves, BlackMoves: blackMoves, PlayerColor: userColorAndOpponent[0], Opponent: userColorAndOpponent[1]}

	*matchList = append(*matchList, gameData)

	return
}

// func getChessBlurb(whiteMoves []string, blackMoves []string, playerColor string) []string {
func getChessBlurb(currentMatch MoveSet) {
	// var gptResponses []string
	var firstResponse string
	var secondResponse string
	var whiteMovesConcat string
	var blackMovesConcat string

	for i := 0; i < len(currentMatch.WhiteMoves); i++ {
		whiteMovesConcat += currentMatch.WhiteMoves[i] + " "
	}

	for i := 0; i < len(currentMatch.BlackMoves); i++ {
		blackMovesConcat += currentMatch.BlackMoves[i] + " "
	}

	client := openai.NewClient(os.Getenv("open_api_key"))
	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT3Dot5Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleUser,
					Content: "I am going to give you two sets of chess moves followed by the color of the player. I want you to write a 15-20 word enthusiastic summary on the players game and if they won or lost. Both move sets are from the same game" + whiteMovesConcat + "\n" + blackMovesConcat + "\n" + currentMatch.PlayerColor,
				},
			},
		},
	)

	if err != nil {
		fmt.Printf("ChatCompletion error: %v\n", err)
		return
	}

	firstResponse = resp.Choices[0].Message.Content

	resp, err = client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT3Dot5Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleUser,
					Content: "I am going to give you 2 sets of chess moves from the same game and the current players piece color. I want you to analyze the set of moves by the player who's piece color is specified and determine 3 of their core weaknesses or areas of improvement. Provide feedback referring to specific moves and what move they should have done instead, and provide resources for concepts to learn to overcome these weaknesses (e.g. Youtube videos, articles online, etc.)" + whiteMovesConcat + "\n" + blackMovesConcat + "\n" + currentMatch.PlayerColor,
				},
			},
		},
	)

	if err != nil {
		fmt.Println(err)
		return
	}
	// fmt.Println(resp.Choices[0].Message.Content)

	// fmt.Println("*******")

	secondResponse = resp.Choices[0].Message.Content

	// gptResponses = append(gptResponses, resp.Choices[0].Message.Content)

	// write to mongo

	mongoClient, err := mongo.NewClient(options.Client().ApplyURI(atlasUri))
	if err != nil {
		log.Fatal(err)
	}

	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)

	err = mongoClient.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer mongoClient.Disconnect(ctx)

	err = mongoClient.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Fatal(err)
	}

	if err != nil {
		fmt.Println(err)
		return
	}

	currentMatch.MatchBlurb = firstResponse
	currentMatch.Analysis = secondResponse

	collection := mongoClient.Database("chess_match_database").Collection("individual_games")
	result, err := collection.InsertOne(context.TODO(), currentMatch)
	// result, err := collection.InsertOne(context.TODO(), document)

	if err != nil {
		fmt.Println(err)
		return
	} else {
		fmt.Println(result.InsertedID)
	}
	return
}

func searchChessPlayerColor(htmlContent string, username string) []string {
	var userColorAndOpponent []string
	var userColor string

	userColor = ""
	// to be function paramater

	reader := strings.NewReader(htmlContent)
	doc, err := goquery.NewDocumentFromReader(reader)
	if err != nil {
		fmt.Println("Error parsing HTML:", err)
		return userColorAndOpponent
	}

	j := 0

	doc.Find("captured-pieces").Each(func(i int, s *goquery.Selection) {
		if aTag, err := s.Html(); err == nil {
			j += 1
			// fmt.Println(class)
			if j == 2 {
				//bottom player, aka the given username

				if strings.Contains(aTag, "captured-pieces-b") {
					// white player
					userColor = "white"
					userColorAndOpponent = append(userColorAndOpponent, userColor)

					return
				} else if strings.Contains(aTag, "captured-pieces-w") {
					// black player
					userColor = "black"
					userColorAndOpponent = append(userColorAndOpponent, userColor)
					return
				}
			}
		}

		return
	})

	doc.Find("a").Each(func(i int, s *goquery.Selection) {
		// the first username you find is the opponent username
		// class, _ := s.Attr("class")

		// fmt.Println(class)
		if aTag, err := s.Html(); err == nil {

			words := strings.Fields(aTag)

			if len(words) == 1 {
				userColorAndOpponent = append(userColorAndOpponent, words[0])
				return
			}
		}

		return
	})

	return userColorAndOpponent
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

	for i := 0; i < len(chessGames); i++ {

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
		}(i)
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

func publicHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.Header)

	if r.Header.Get("Content-Type") != "" {
		value, _ := header.ParseValueAndParams(r.Header, "Content-Type")
		if value != "application/json" {
			msg := "Content-Type header is not application/json"
			http.Error(w, msg, http.StatusUnsupportedMediaType)
			return
		}
	}

	// Use http.MaxBytesReader to enforce a maximum read of 1MB from the
	// response body. A request body larger than that will now result in
	// Decode() returning a "http: request body too large" error.
	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	// Setup the decoder and call the DisallowUnknownFields() method on it.
	// This will cause Decode() to return a "json: unknown field ..." error
	// if it encounters any extra unexpected fields in the JSON. Strictly
	// speaking, it returns an error for "keys which do not match any
	// non-ignored, exported fields in the destination".
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	var frontEndRequest FrontEndRequest

	err := dec.Decode(&frontEndRequest)

	if err != nil {
		handleDecodingError(err, w)
	}

	// Call decode again, using a pointer to an empty anonymous struct as
	// the destination. If the request body only contained a single JSON
	// object this will return an io.EOF error. So if we get anything else,
	// we know that there is additional data in the request body.
	err = dec.Decode(&struct{}{})

	if !errors.Is(err, io.EOF) {
		msg := "Request body must only contain a single JSON object"
		http.Error(w, msg, http.StatusBadRequest)
		return
	}

	fmt.Println(frontEndRequest)

	fmt.Fprintf(w, "Getting chess games")
	getChessGames("noopdogg07")
	fmt.Fprintf(w, "Done")
}

func handleDecodingError(err error, w http.ResponseWriter) {
	if err != nil {
		var syntaxError *json.SyntaxError
		var unmarshalTypeError *json.UnmarshalTypeError

		switch {
		// Catch any syntax errors in the JSON and send an error message
		// which interpolates the location of the problem to make it
		// easier for the client to fix.
		case errors.As(err, &syntaxError):
			msg := fmt.Sprintf("Request body contains badly-formed JSON (at position %d)", syntaxError.Offset)
			http.Error(w, msg, http.StatusBadRequest)

		// In some circumstances Decode() may also return an
		// io.ErrUnexpectedEOF error for syntax errors in the JSON. There
		// is an open issue regarding this at
		// https://github.com/golang/go/issues/25956.
		case errors.Is(err, io.ErrUnexpectedEOF):
			msg := fmt.Sprintf("Request body contains badly-formed JSON")
			http.Error(w, msg, http.StatusBadRequest)

		// Catch any type errors, like trying to assign a string in the
		// JSON request body to a int field in our Person struct. We can
		// interpolate the relevant field name and position into the error
		// message to make it easier for the client to fix.
		case errors.As(err, &unmarshalTypeError):
			msg := fmt.Sprintf("Request body contains an invalid value for the %q field (at position %d)", unmarshalTypeError.Field, unmarshalTypeError.Offset)
			http.Error(w, msg, http.StatusBadRequest)

		// Catch the error caused by extra unexpected fields in the request
		// body. We extract the field name from the error message and
		// interpolate it in our custom error message. There is an open
		// issue at https://github.com/golang/go/issues/29035 regarding
		// turning this into a sentinel error.
		case strings.HasPrefix(err.Error(), "json: unknown field "):
			fieldName := strings.TrimPrefix(err.Error(), "json: unknown field ")
			msg := fmt.Sprintf("Request body contains unknown field %s", fieldName)
			http.Error(w, msg, http.StatusBadRequest)

		// An io.EOF error is returned by Decode() if the request body is
		// empty.
		case errors.Is(err, io.EOF):
			msg := "Request body must not be empty"
			http.Error(w, msg, http.StatusBadRequest)

		// Catch the error caused by the request body being too large. Again
		// there is an open issue regarding turning this into a sentinel
		// error at https://github.com/golang/go/issues/30715.
		case err.Error() == "http: request body too large":
			msg := "Request body must not be larger than 1MB"
			http.Error(w, msg, http.StatusRequestEntityTooLarge)

		// Otherwise default to logging the error and sending a 500 Internal
		// Server Error response.
		default:
			log.Print(err.Error())
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		}
		return
	}
}

func main() {
	// Command to execute the Bash script
	cmd := exec.Command("./cleanup.sh")

	// Run the command and capture the output and error streams
	output, err := cmd.CombinedOutput()

	if err != nil {
		fmt.Println(err)
	}

	// Print the output
	fmt.Println(string(output))

	http.HandleFunc("/chessGameAnalysis", publicHandler) // set router
	fmt.Println("Server started on port 8080")
	err = http.ListenAndServe(":8080", nil) // set listen port

	if err != nil {
		fmt.Println("Error starting server")
		return
	}

	// Command to execute the Bash script
	cmd = exec.Command("./cleanup.sh")

	// Run the command and capture the output and error streams
	output, err = cmd.CombinedOutput()

	// Check for errors
	if err != nil {
		fmt.Println("Error executing command:", err)
		return
	}

	// getChessGames("noopdogg07")
}
