package utils

import (
	"crypto/rand"
	"math/big"
)

const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func GenerateShortID(length int) (string, error) {
	id := make([]byte, length)
	for i := range id {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(alphabet))))
		if err != nil {
			return "", err
		}
		id[i] = alphabet[n.Int64()]
	}
	return string(id), nil
}
