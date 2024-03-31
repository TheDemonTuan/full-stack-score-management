package common

import (
	"bytes"
	"math/rand"
	"strconv"
)

func GenerateRandNum(length int) string {
	arr := make([]int, length)
	for i := range arr {
		arr[i] = rand.Intn(length)
	}
	var buf bytes.Buffer
	for _, n := range arr {
		buf.WriteString(strconv.Itoa(n))
	}
	return buf.String()
}
