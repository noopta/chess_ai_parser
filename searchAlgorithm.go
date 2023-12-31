package main

import (
	// "fmt"
	"unicode/utf8"
)

// build skip table of needle for Boyer-Moore search.
func BuildSkipTable(needle string) map[rune]int {
	l := utf8.RuneCountInString(needle)
	runes := []rune(needle)

	table := make(map[rune]int)

	for i := 0; i < l-1; i++ {
		j := runes[i]
		table[j] = l - i - 1
	}

	return table
}

// search a needle in haystack and return count of needle.
// table is build by BuildSkipTable.
func SearchBySkipTable(haystack, needle string, table map[rune]int) []string {
	var playerMoves []string

	i, c := 0, 0
	hrunes := []rune(haystack)
	nrunes := []rune(needle)
	hl := utf8.RuneCountInString(haystack)
	nl := utf8.RuneCountInString(needle)

	if hl == 0 || nl == 0 || hl < nl {
		return nil
	}

	if hl == nl && haystack == needle {
		// was 1 before
		return nil
	}

loop:
	for i+nl <= hl {
		for j := nl - 1; j >= 0; j-- {
			if hrunes[i+j] != nrunes[j] {
				if _, ok := table[hrunes[i+j]]; !ok {
					if j == nl-1 {
						i += nl
					} else {
						i += nl - j - 1
					}
				} else {
					n := table[hrunes[i+j]] - (nl - j - 1)
					if n <= 0 {
						i++
					} else {
						i += n
					}
				}
				goto loop
			}
		}

		if _, ok := table[hrunes[i+nl-1]]; ok {
			i += table[hrunes[i+nl-1]]
		} else {
			i += nl
		}

		k := i + 8

		if needle == "black node" {
			k = i + 2
		}

		for []rune(haystack)[k] != '<' {
			k++
		}

		// fmt.Println(haystack[i+2 : k])

		if needle == "black node" {
			playerMoves = append(playerMoves, haystack[i+2:k])
		} else {
			playerMoves = append(playerMoves, haystack[i+7:k])
		}

		c++
	}

	return playerMoves
}

// search a needle in haystack and return count of needle.
func Search(haystack, needle string) []string {
	table := BuildSkipTable(needle)
	return SearchBySkipTable(haystack, needle, table)
}
