package utils

import (
	"encoding/base64"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func EncodeBinaryID(b primitive.Binary) string {
	return base64.StdEncoding.EncodeToString(b.Data)
}

func DecodeBinaryID(idStr string) primitive.Binary {
	data, _ := base64.StdEncoding.DecodeString(idStr)
	return primitive.Binary{Subtype: 0x00, Data: data}
}
