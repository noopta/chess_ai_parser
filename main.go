package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	// "github.com/golang/gddo/httputil/header"

	"github.com/PuerkitoBio/goquery"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/chromedp/chromedp"
	"github.com/go-rod/rod"
	openai "github.com/sashabaranov/go-openai"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"golang.org/x/time/rate"

	cohere "github.com/cohere-ai/cohere-go/v2"
	cohereclient "github.com/cohere-ai/cohere-go/v2/client"
)

type ChessApiStruct struct {
	Games []Game `json:"games"`
}

type Game struct {
	Url string `json:"url"`
	Pgn string `json:"pgn"`
}

type FrontEndRequest struct {
	Username string `json:"username"`
	Month    string `json:"month"`
	Year     string `json:"year"`
	NumGames int    `json:"numGames"`
}

type ChessMatchHtml struct {
	HtmlContent string
}

// MIGHT HAVE TO USE A NEW STRUCT WITH JSON INSTEAD OF BSON

type MongoGame struct {
	WhiteMoves  []string `json:"whiteMoves"`
	BlackMoves  []string `json:"blackMoves"`
	PlayerColor string   `json:"playerColor"`
	Opponent    string   `json:"opponent"`
	MatchBlurb  string   `json:"matchBlurb"`
	Analysis    string   `json:"analysis"`
	Pgn         string   `json:"pgn"`
}

type MoveSet struct {
	WhiteMoves  []string `bson:"whiteMoves"`
	BlackMoves  []string `bson:"blackMoves"`
	PlayerColor string   `bson:"playerColor"`
	Opponent    string   `bson:"opponent"`
	MatchBlurb  string   `bson:"matchBlurb"`
	Analysis    string   `bson:"analysis"`
	Pgn         string   `bson:"pgn"`
}

// APIGatewayProxyResponse represents the response to be returned by the Lambda function
type APIGatewayProxyResponse struct {
	StatusCode int               `json:"-"`
	Headers    map[string]string `json:"headers"`
	Body       string            `json:"body"`
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
			Model: openai.GPT4,
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

	for i := 0; i < 5; i++ {
		parseChessMatch(urlList[i], i, &matchList)
	}

	fmt.Println("done parsing")

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
	ctx, cancel = context.WithTimeout(ctx, 40*time.Second)
	defer cancel()

	err := chromedp.Run(ctx, chromedp.Navigate(url))

	fmt.Println(url)

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

	fmt.Println("getting html")
	// Get the HTML content of the page
	var htmlContent string
	err = chromedp.Run(ctx, chromedp.Evaluate(`document.documentElement.outerHTML`, &htmlContent))
	if err != nil {
		fmt.Println("cancelling 2")
		log.Fatal(err)
	}

	fmt.Println("done getting html")

	if err != nil {
		fmt.Println("An error occurred while reading the file")
		fmt.Println(err)
	}

	client, err := mongo.NewClient(options.Client().ApplyURI(atlasUri))
	if err != nil {
		log.Fatal(err)
	}

	ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

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

	cancel()

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

	for i := 0; i < len(currentMatch.BlackMoves[i]); i++ {
		blackMovesConcat += currentMatch.BlackMoves[i] + " "
	}

	client := openai.NewClient(os.Getenv("open_api_key"))
	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT4,
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
			Model: openai.GPT4,
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

	secondResponse = resp.Choices[0].Message.Content

	mongoClient, err := mongo.NewClient(options.Client().ApplyURI(atlasUri))
	if err != nil {
		log.Fatal(err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

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

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

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

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

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

// func HandleRequest(ctx context.Context, name MyEvent) (events.APIGatewayProxyResponse, error) {
// 	fmt.Sprintf("Hello %s!", name.Name)

// 	responseBody := map[string]interface{}{
// 		"message": "Hello!",
// 	}

// 	responseJSON, err := json.Marshal(responseBody)
// 	if err != nil {
// 		return events.APIGatewayProxyResponse{}, err
// 	}

// 	return events.APIGatewayProxyResponse{
// 		StatusCode: http.StatusOK,
// 		Headers: map[string]string{
// 			"Content-Type": "application/json",
// 		},
// 		Body: string(responseJSON),
// 	}, nil
// }

// func publicHandler(w http.ResponseWriter, r *http.Request) {\
// func publicHandler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
func publicHandler(ctx context.Context, request FrontEndRequest) (Response, error) {
	// var req FrontEndRequest
	// err := json.Unmarshal([]byte(request.Body), &req)
	// if err != nil {
	// 	fmt.Println(err)
	// }

	fmt.Println("Request Username:")
	fmt.Println(request.Username)

	// Create the response body
	// responseBody := fmt.Sprintf("Hello %s!", name.Username)
	// Create the response headers, including CORS headers
	// headers := map[string]string{
	// 	"Content-Type":                 "application/json",
	// 	"Access-Control-Allow-Origin":  "*", // Replace '*' with 'http://localhost:3000' or specific origins in production
	// 	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	// 	"Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
	// }

	// var mongoDBGames []MoveSet

	// connectToChessApi(req.Username)
	// mongoDBGames = getMongoDbGames()
	// // convert mongoDBGames to a json string and store in a variable called jsonData

	// fmt.Println("Printing mongoDBGames")
	// fmt.Println(mongoDBGames[0])

	// fmt.Println("Printing jsonData")
	// jsonData, err := json.Marshal(mongoDBGames)

	// if err != nil {
	// 	fmt.Println("Error marshaling to JSON:", err)
	// 	return events.APIGatewayProxyResponse{}, err
	// }

	// fmt.Println(string(jsonData))

	// // Create the APIGatewayProxyResponse
	// response := APIGatewayProxyResponse{
	// 	StatusCode: http.StatusOK,
	// 	Headers:    headers,
	// 	Body:       string(jsonData),
	// }
	// deleteDocuments()

	// Set response headers
	return Response{
			StatusCode: 200,
			Headers:    map[string]string{"Content-Type": "application/json"},
			Body:       request.Username,
		},
		nil
	// return request.Username, nil
}

type Response struct {
	StatusCode int               `json:"statusCode"`
	Headers    map[string]string `json:"headers"`
	Body       string            `json:"body"`
}

func getMongoDbGames(userSessionHash string) []MongoGame {
	var allMongoGames []MongoGame
	// Set up MongoDB client
	clientOptions := options.Client().ApplyURI(os.Getenv("atlas_uri"))
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}
	// Check the connection
	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal("Could not connect to the database:", err)
	}
	fmt.Println("Connected to MongoDB!")

	// Set up MongoDB collection
	// collection := client.Database("chess_match_database").Collection("individual_games")
	collection := client.Database("chess_match_database").Collection(userSessionHash)

	// Find all documents
	cursor, err := collection.Find(context.Background(), bson.D{})
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(context.Background())

	// Iterate through the cursor and process each document
	for cursor.Next(context.Background()) {
		var result bson.M
		if err := cursor.Decode(&result); err != nil {
			log.Fatal(err)
		}

		// moveSet is the struct that will be used to store the data from the database
		var moveSet MongoGame

		// Convert the bson.M to MoveSet
		data, err := bson.Marshal(result)

		// Unmarshal the bson.M to MoveSet
		err = bson.Unmarshal(data, &moveSet)

		if err != nil {
			fmt.Println("Error:", err)
			return []MongoGame{}
		}

		allMongoGames = append(allMongoGames, moveSet)
	}

	if err := cursor.Err(); err != nil {
		log.Fatal(err)
	}

	client.Database("chess_match_database").Collection(userSessionHash).Drop(context.Background())

	return allMongoGames
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

func connectToScrapingBee() {
	// API KEY = M977YHXCMPJJ569DSB0B8KSKL9NRU2O2327MIDT55785T8LS9TJGDW4GFMCMOZNRVN3GPSXF0Y6DGC32
	// https://app.scrapingbee.com/api/v1/?api_key=M977YHXCMPJJ569DSB0B8KSKL9NRU2O2327MIDT55785T8LS9TJGDW4GFMCMOZNRVN3GPSXF0Y6DGC32&url=https://www.chess.com/games/archive/noopdogg07
	// apiKey := "M977YHXCMPJJ569DSB0B8KSKL9NRU2O2327MIDT55785T8LS9TJGDW4GFMCMOZNRVN3GPSXF0Y6DGC32"
	// url := "https://www.chess.com/game/live/83358897615?username=noopdogg07"

	// Create client
	client := &http.Client{}

	// Create request
	req, err := http.NewRequest("GET", "https://app.scrapingbee.com/api/v1/?api_key=M977YHXCMPJJ569DSB0B8KSKL9NRU2O2327MIDT55785T8LS9TJGDW4GFMCMOZNRVN3GPSXF0Y6DGC32&url=https://www.chess.com/game/live/83358897615?username=noopdogg07&wait_for=.toolbar-menu-area", nil)

	parseFormErr := req.ParseForm()
	if parseFormErr != nil {
		fmt.Println(parseFormErr)
	}

	// Fetch Request
	resp, err := client.Do(req)

	if err != nil {
		fmt.Println("Failure : ", err)
	}

	// Read Response Body
	respBody, _ := ioutil.ReadAll(resp.Body)

	// Display Results
	fmt.Println("response Status : ", resp.Status)
	fmt.Println("response Headers : ", resp.Header)
	fmt.Println("response Body : ", string(respBody))
	err = ioutil.WriteFile("scraped.html", respBody, 0644)
}

func rodFunc() {
	// Create a new browser instance
	browser := rod.New().MustConnect()

	// Close the browser when the program exits
	defer browser.MustClose()

	// Navigate to the URL
	page := browser.MustPage("https://www.chess.com/game/live/83358897615?username=noopdogg07")
	page.MustWaitLoad().MustWaitIdle()

	// Wait for an element with the CSS selector ".my-element" to load
	element := page.MustElement(".move")

	// Get the text content of the element
	text := element.MustText()

	// Print the extracted text
	fmt.Println("Extracted text:", text)

}

func getGptResponse(opponentName string, playerColor string, whiteMoves []string, blackMoves []string, userSessionHash string, pgn string) string {
	// var gptResponses []string
	var firstResponse string
	var secondResponse string
	var whiteMovesConcat string
	var blackMovesConcat string
	var globalIntertwinedMoves string

	for i := 0; i < len(whiteMoves); i++ {
		whiteMovesConcat += whiteMoves[i] + " "
	}

	for i := 0; i < len(blackMoves); i++ {
		blackMovesConcat += blackMoves[i] + " "
	}

	if len(whiteMoves) <= len(blackMoves) {
		var intertwinedMoves string
		for i := 0; i < len(whiteMoves); i++ {
			moveRound := strconv.Itoa(i + 1)
			// if intertwinedMoves does not contain the substring "1-0" or "0-1" then add to intervinedMoves
			intertwinedMoves += moveRound + ". " + whiteMoves[i] + " " + blackMoves[i] + " "
		}

		globalIntertwinedMoves = intertwinedMoves
	} else {
		var intertwinedMoves string
		for i := 0; i < len(blackMoves); i++ {
			// convert i + 1 to string and store it in a variable
			moveRound := strconv.Itoa(i + 1)
			intertwinedMoves += moveRound + "." + whiteMoves[i] + " " + blackMoves[i] + " "
		}

		globalIntertwinedMoves = intertwinedMoves
	}

	log.Println("intertwined movess")
	log.Println(globalIntertwinedMoves)

	log.Println("whiteMovesConcat")
	log.Println(whiteMovesConcat)
	log.Println("blackMovesConcat")
	log.Println(blackMovesConcat)

	log.Println("pgn")
	log.Println(pgn)

	// prompt := "I am going to give you the transcript from a Chess match in standard algebraic notation. " +

	// 	"I will also give the current players piece color. I want you to analyze the transcript by the player " +
	// 	"who's piece color is specified and determine 3 of their core weaknesses or areas of improvement. " +
	// 	"Provide feedback referring to specific moves and what move they should have done instead. " +
	// 	"Mention the move the user did, and mention the alternative move with the same round number in brackets. " +
	// 	"Provide resources for concepts to learn to overcome these weaknesses (e.g. Youtube videos, articles online, etc.)." +
	// 	"Here is the game transcript: "

	client := openai.NewClient(os.Getenv("open_api_key"))
	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT4Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleUser,
					Content: "I am going to give you two sets of chess moves followed by the color of the player. I want you to write a 15-20 word enthusiastic summary on the players game and if they won or lost. Both move sets are from the same game" + whiteMovesConcat + "\n" + blackMovesConcat + "\n" + playerColor,
				},
			},
		},
	)

	if err != nil {
		fmt.Printf("ChatCompletion error: %v\n", err)
		return ""
	}

	// goodResponse := `Analysis:

	// 1. Poor pawn structure control: The move of d5 (14) allowed White to capture on d5 with their pawn. This gave up control of the center in the board, allowing White to gain an advantage in space and opening up the diagonal for the bishop. Instead, a safer move might have been e6 (14) to solidify their pawn structure and decrease the chances of creating weaknesses. This would have also limited White's central control.
	// 2. Questionable sacrifice: The player unnecessarily sacrificed a knight with Nxd5 (6), which was not a good idea as it provided White with a clear advantage early in the game. They should have played Bg7 (6) for better development and king side security.
	// 3. Poor kingside defense: The combination of moves e4 (15) and Bxb2 (16) left the player's king's defense very weak. Instead of Bxb2 (16), keeping the bishop to help with defense by moving Qc7 (16) would have been a safer option.

	// Resources:

	// 1. To improve pawn structure understanding, review this {article_or_video} that explains the fundamental concepts in detail: {valid_article_or_video_link_online}
	// 2. Understanding the importance of not giving pieces away in the early game can be aided by this {article_or_video} article: {valid_article_or_video_link_online}
	// 3. Actively managing king's safety and maintaining an organized defense is crucial. The following resource can provide insights on this subject: {valid_article_or_video_link_online}`

	// badResponseOne := `Analysis:
	// 	1. In the second move c4 (2), the user attempted too aggressive a play early, losing the center pawn in the process. Instead of c4 (2), a move like Nf3 (2) could have supported center control while developing a piece.
	// 	2. The move b3 (5) is an attempt to create pawn tension, but it further disrupts the user's pawn structure. It delegitimizes the setup for a king-side castle and weakens the protection of the king. Instead, the player could have-controlled the center with Nf3 (5), developing a piece and preparing for short castle.
	// 	3. It is pivotal to note the move Qa4+ (11), which is a wasteful check. Check options should be evaluated more carefully. Instead, capturing the dark square bishop with Nxd4 (11) would have improved piece activity without inviting counterplay.

	// 	Resources:

	// 	1. To understand how center control affects the game, this article "The Importance of the Center" on [chess.com](http://chess.com/) [https://www.chess.com/article/view/the-importance-of-the-center] can provide detailed insights.
	// 	2. A resource for learning safer king-side pressure setups, especially focusing on pawn structures, would be "Pawn Structure Chess" by Andrew Soltis.
	// 	3. For improving understanding of when to give a check and when not, a useful resource is "The King: Chess Pieces" by David Shenk.`

	// badResponseTwo := `Analysis:

	// 1. Lack of piece development: The move 2. c4 (2) is too aggressive early in the game, aiming to control the center but neglecting piece development. Instead, developing the knight with 2. Nf3 (2) could have strengthened center control and allowed for a potential kingside castle.

	// 2. Inefficient king safety: With 5. b3 (5), the player aimed to create pawn tension but ended up disrupting pawn structure, limiting the options for a kingside castle. Instead, the player should have developed another knight with 5. Nc3 (5), ensuring better control of the center and preparation for castling.

	// 3. Inaccurate checking: The move 11. Qa4+ (11) was a check that had no strategic advantage. More caution should be used before giving checks. Instead, capturing the enemy's bishop with 11. Nxd4 (11) would have improved piece activity without inviting counterplay.

	// Resources:

	// 1. For understanding piece development and center control, this article on {insert_concept_you_pointed_out} can be a helpful start: {insert_url_you_find_online_of_free_resource}
	// 2. A resource to understand king safety and pawn structures is "Pawn Structure Chess" by Andrew Soltis. This book gives detailed strategies about pawn structures, critical for maintaining king safety.
	// 3. To improve on understanding when, and when not, to give a check, the book "The King: Chess Pieces" by David Shenk explores this topic in-depth.`

	firstResponse = resp.Choices[0].Message.Content
	// systemSettings := `You are a Chess AI, similar to Deepmind by Google. Listen to these instructions word by word. You will be given a chess board transcript in standard algebraic notation. I will also give the current players piece color. I want you to analyze the transcript by the player who's piece color is specified and determine 3 of their core weaknesses or areas of improvement. Provide feedback referring to specific moves and what move they should have done instead. Mention the move the user did, and mention the alternative move with the same round number in brackets. Don't make any issues with remembering where the pieces are on the board, and keep track of what pieces are where and what are removed from the board after every move to avoid hallucination. When you mention specific moves, mention in brackets the round it occurred in (e.g. e5 (5)). Do the same for alternative moves you suggest. Do not include letters, pieces or anything else in these brackets. Only the round number. Make sure to keep track of which pieces remain on the board after every move. When you talk about the weaknesses  and alternate moves, prefix the content by saying Analysis followed by a new line. When you describe resources prefix the content by Resources and a new line. IMPORTANT when you give the link to a video or article resource online, use your browser searching capabilities to ensure it is a valid link. MAKE SURE THE LINK ISN'T A 404 PAGE and EXISTS.

	// Here is the response format that is good and that we want. Note how after each point (e.g. 1.) there is no trailing periods after a number. Examples of text not to add for each point: no (...) no (3...), no (rx7.) etc.  NO PERIODS followed by a number - that is BAD.PLEASE ENSURE THE LINK FOR RESOURCES YOU FIND ONLINE ARE VALID AND EXIST. Sometimes you recommend pages that go to 404 pages. Here is the GOOD response:
	// ` + goodResponse

	// NEW REQUEST
	analysisRequest := `You are a Chess AI, similar to Deepmind by Google. Listen to these instructions word by word. You will be given a chess board transcript in standard algebraic notation. I will also give the current players piece color. I want you to analyze the transcript by the player who's piece color is specified and determine 3 of their core weaknesses or areas of improvement. Provide feedback referring to specific moves and what move they should have done instead. Mention the move the user did, and mention the alternative move with the same round number in brackets. Don't make any issues with remembering where the pieces are on the board, and keep track of what pieces are where and what are removed from the board after every move to avoid hallucination. When you mention specific moves, mention in brackets the round it occurred in (e.g. e5 (5)). Do the same for alternative moves you suggest. Do not include letters, pieces or anything else in these brackets. Only the round number. Make sure to keep track of which pieces remain on the board after every move. When you talk about the weaknesses  and alternate moves, prefix the content by saying Analysis followed by a new line. 

	Here is the response format that is good and that we want. Note how after each point (e.g. 1.) there is no trailing periods after a number. Examples of text not to add for each point: no (...) no (3...), no (rx7.) etc.  NO PERIODS followed by a number - that is BAD. Here is the GOOD response: 

Analysis: 

	1. Poor pawn structure control: The move of d5 (14) allowed White to capture on d5 with their pawn. This gave up control of the center in the board, allowing White to gain an advantage in space and opening up the diagonal for the bishop. Instead, a safer move might have been e6 (14) to solidify their pawn structure and decrease the chances of creating weaknesses. This would have also limited White's central control.
	2. Questionable sacrifice: The player unnecessarily sacrificed a knight with Nxd5 (6), which was not a good idea as it provided White with a clear advantage early in the game. They should have played Bg7 (6) for better development and king side security.
	3. Poor kingside defense: The combination of moves e4 (15) and Bxb2 (16) left the player's king's defense very weak. Instead of Bxb2 (16), keeping the bishop to help with defense by moving Qc7 (16) would have been a safer option.`

	// ` \n and here is a response format that is BAD and that we don't want: \n` + badResponseOne + "\n here is another example of a bad respones format that we don't want: \n" + badResponseTwo

	resp, err = client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.O1Preview,
			Messages: []openai.ChatCompletionMessage{
				// {
				// 	Role:    openai.ChatMessageRoleSystem,
				// 	Content: systemSettings,
				// },
				{
					Role:    openai.ChatMessageRoleUser,
					Content: analysisRequest + "\n" + pgn + "\n" + playerColor,
				},
			},
		},
	)

	if err != nil {
		fmt.Println(err)
		return ""
	}

	resourceRequest := `I'm going to give you a list of analysis points found from analysing a users chess match. I want you to return free online resources for each analysis point. When you describe resources prefix the content by Resources and a new line. IMPORTANT when you give the link to a video or article resource online, use your browser searching capabilities to ensure it is a valid link. MAKE SURE THE LINK ISN'T A 404 PAGE and EXISTS.

PLEASE ENSURE THE LINK FOR RESOURCES YOU FIND ONLINE ARE VALID AND EXIST. This is an example of a GOOD response: ` + "\n" + "\n" +

		`Resources: 
1. To improve pawn structure understanding, review this {article_or_video} that explains the fundamental concepts in detail: {valid_article_or_video_link_online}
2. Understanding the importance of not giving pieces away in the early game can be aided by this {article_or_video} article: {valid_article_or_video_link_online}
3. Actively managing king's safety and maintaining an organized defense is crucial. The following resource can provide insights on this subject: {valid_article_or_video_link_online}`

	// linkSearchResp, err := client.CreateChatCompletion(
	// 	context.Background(),
	// 	openai.ChatCompletionRequest{
	// 		Model: openai.GPT4o,
	// 		Messages: []openai.ChatCompletionMessage{
	// 			{
	// 				Role:    openai.ChatMessageRoleUser,
	// 				Content: resourceRequest + "\n" + "here is the analysis: " + "\n" + "\n" + resp.Choices[0].Message.Content,
	// 			},
	// 		},
	// 	},
	// )

	webSearchResult := cohereWebSearch(resourceRequest + "\n" + "here is the analysis: " + "\n" + "\n" + resp.Choices[0].Message.Content)

	if webSearchResult == "error" {
		fmt.Println(webSearchResult)
		return ""
	}

	if err != nil {
		fmt.Println(err)
		return ""
	}

	// secondResponse = resp.Choices[0].Message.Content
	secondResponse = resp.Choices[0].Message.Content + webSearchResult

	mongoClient, err := mongo.NewClient(options.Client().ApplyURI(atlasUri))

	if err != nil {
		log.Fatal(err)
		return ""
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = mongoClient.Connect(ctx)
	if err != nil {
		log.Fatal(err)
		return ""
	}
	defer mongoClient.Disconnect(ctx)

	err = mongoClient.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Fatal(err)
		return ""
	}

	if err != nil {
		fmt.Println(err)
		return ""
	}

	var currentMatch MoveSet

	currentMatch.WhiteMoves = whiteMoves
	currentMatch.BlackMoves = blackMoves
	currentMatch.PlayerColor = playerColor
	currentMatch.MatchBlurb = firstResponse
	currentMatch.Analysis = secondResponse
	currentMatch.Opponent = opponentName
	currentMatch.Pgn = pgn

	collection := mongoClient.Database("chess_match_database").Collection(userSessionHash)
	result, err := collection.InsertOne(context.TODO(), currentMatch)
	// result, err := collection.InsertOne(context.TODO(), document)

	if err != nil {
		fmt.Println(err)
		return ""
	} else {
		fmt.Println(result.InsertedID)
	}
	return "200"
}

func cohereWebSearch(request string) string {
	cohere_api_key := "i5SfrWG12ZDdqztyx1TBkMUxrHU3RAOa01mUVy6a"

	client := cohereclient.NewClient(cohereclient.WithToken(cohere_api_key))
	response, err := client.Chat(
		context.TODO(),
		&cohere.ChatRequest{
			Message: request,
			Connectors: []*cohere.ChatConnector{
				{Id: "web-search"},
			},
		},
	)

	if err != nil {
		fmt.Println(err.Error())
		return "error"
	}

	return response.Text
}

func connectToChessApi(jsonRequest FrontEndRequest, userSessionHash string) string {
	var chessMatches ChessApiStruct

	client := &http.Client{}
	chessUrl := "https://api.chess.com/pub/player/" + jsonRequest.Username + "/games/" + jsonRequest.Year + "/" + jsonRequest.Month

	// Create request
	// req, err := http.NewRequest("GET", "https://api.chess.com/pub/player/noopdogg07/games/2023/07", nil)
	req, err := http.NewRequest("GET", chessUrl, nil)

	parseFormErr := req.ParseForm()

	if parseFormErr != nil {
		fmt.Println(parseFormErr)
		return ""
	}

	// Fetch Request
	resp, err := client.Do(req)

	if err != nil {
		fmt.Println("Failure : ", err)
		return ""
	}

	// Read Response Body
	respBody, _ := ioutil.ReadAll(resp.Body)

	json.Unmarshal(respBody, &chessMatches)

	// Channel to signal goroutine completion
	var wg sync.WaitGroup
	numGames := 0

	if jsonRequest.NumGames > len(chessMatches.Games) {
		numGames = len(chessMatches.Games)
	} else {
		numGames = jsonRequest.NumGames
	}

	wg.Add(numGames)

	done := make(chan struct{})
	// get min of jsonRequest.NumGames and len(chessMatches.Games)

	log.Println("going to for loop")
	// I can make a list of the urls
	// return the list of urls
	// string match on the front end
	for k := 0; k < numGames; k++ {
		go func(k int) {
			splitStrings := strings.Split(chessMatches.Games[k].Pgn, "\n")
			isWhite := true

			// fmt.Println(currentGame)
			var whiteMoves []string
			var blackMoves []string
			var playerColor string
			var opponentName string

			// pgn = chessMatches.Games[k].Pgn

			for _, v := range splitStrings {
				// fmt.Println(v)
				if len(v) >= 6 && strings.Contains(v, jsonRequest.Username) {
					if v[0:6] == "[White" {
						playerColor = "White"
					} else if v[0:6] == "[Black" {
						playerColor = "Black"
					}
					// fmt.Println(username + " color = " + playerColor)
				} else if len(v) >= 6 && !strings.Contains(v, jsonRequest.Username) {
					if v[0:7] == "[White " {
						opponentName = v[8 : len(v)-2]
					} else if v[0:7] == "[Black " {
						opponentName = v[8 : len(v)-2]
					}
				}

				if len(v) >= 1 && v[0:1] == "[" {
					continue
				} else {
					moves := strings.Split(splitStrings[len(splitStrings)-2], " ")

					for _, m := range moves {
						// fmt.Println(m)
						if !strings.Contains(m, "{") && !strings.Contains(m, ".") && !strings.Contains(m, "}") {
							// fmt.Println(m)
							if isWhite {
								whiteMoves = append(whiteMoves, m)
								isWhite = false
							} else {
								blackMoves = append(blackMoves, m)
								isWhite = true
							}
						}
					}

					isWhite = true
					// get response
				}
			}

			gamePgn := strings.Split(chessMatches.Games[k].Pgn, "\n")
			pgnString := gamePgn[len(gamePgn)-2]

			gptResp := getGptResponse(opponentName, playerColor, whiteMoves, blackMoves, userSessionHash, pgnString)

			done <- struct{}{}

			if gptResp != "200" {
				return
			}
		}(k)
	}
	// Wait for all goroutines to complete
	for k := 0; k < numGames; k++ {
		<-done
	}

	fmt.Println("done2")
	// wg.Wait()

	fmt.Println("done3")
	return "200"
}

// TODO: Uncomment after perplexity AI testing
func main() {
	lambda.Start(HandleRequest)
}

type MyEvent struct {
	Name string `json:"name"`
}

func HandleRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var e FrontEndRequest
	err := json.Unmarshal([]byte(request.Body), &e)
	if err != nil {
		log.Fatalln("Failed to unmarshal request body")
	}

	// deleteDocuments()
	deleteCollections()

	log.Println("Received username: ", e.Username)

	var mongoDBGames []MongoGame
	// client stuff
	clientOptions := options.Client().ApplyURI(os.Getenv("atlas_uri"))
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}
	// Check the connection
	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal("Could not connect to the database:", err)
	}
	fmt.Println("Connected to MongoDB!")

	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	// create a random hash for the user and create a collection named with that hash
	timeStamp := strconv.FormatInt(time.Now().UnixNano()/1e6, 10)

	res := make([]rune, 3)
	for i := range res {
		res[i] = letters[rand.Intn(len(letters))]
	}

	hash := string(res)
	command := bson.D{{Key: "create", Value: "individual_games" + timeStamp + hash}}
	var result bson.M

	if err := client.Database("chess_match_database").RunCommand(context.TODO(), command).Decode(&result); err != nil {
		log.Fatal(err)
	}

	// disconnect
	err = client.Disconnect(context.TODO())

	if err != nil {
		log.Fatal(err)
	}

	connectToChessApi(e, "individual_games"+timeStamp+hash)
	mongoDBGames = getMongoDbGames("individual_games" + timeStamp + hash)
	// convert mongoDBGames to a json string and store in a variable called jsonData

	fmt.Println("Printing mongoDBGames")
	fmt.Println(mongoDBGames[0])
	// convert mongoDBGames to a string and store in a variable called mongoString

	// fmt.Println("Printing jsonData")
	jsonData, err := json.Marshal(mongoDBGames)

	// deleteDocuments()
	deleteCollections()

	if err != nil {
		fmt.Println("Error marshaling to JSON:", err)
		return events.APIGatewayProxyResponse{}, err
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       string(jsonData),
	}, nil
}

func deleteCollections() {
	clientOptions := options.Client().ApplyURI(os.Getenv("atlas_uri"))
	client, err := mongo.Connect(context.Background(), clientOptions)

	if err != nil {
		log.Fatal(err)
	}

	// Check the connection
	err = client.Ping(context.TODO(), nil)

	if err != nil {
		log.Fatal(err)
	}

	// Get names of the collections
	collectionNames, err := client.Database("chess_match_database").ListCollectionNames(context.Background(), bson.M{})

	if err != nil {
		log.Fatal(err)
	}

	// Loop through the collections and drop each one
	for _, collectionName := range collectionNames {
		if err := client.Database("chess_match_database").Collection(collectionName).Drop(context.TODO()); err != nil {
			log.Fatal(err)
		}
	}

	err = client.Disconnect(context.TODO())

	if err != nil {
		log.Fatal(err)
	}

	println("Disconnected from MongoDB")
}

func deleteDocuments() {
	// Set up MongoDB client
	clientOptions := options.Client().ApplyURI(os.Getenv("atlas_uri"))
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	// Set up MongoDB collection
	collection := client.Database("chess_match_database").Collection("individual_games")

	// Create a filter to match all documents (empty filter to match all)
	filter := bson.D{}

	// Delete all documents that match the filter
	deleteResult, err := collection.DeleteMany(context.Background(), filter)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Deleted %d documents\n", deleteResult.DeletedCount)
}
