package utils

import (
	"log"
	"net/netip"

	"github.com/oschwald/geoip2-golang/v2"
)

var geoDB *geoip2.Reader

func InitGeoIP() {
	db, err := geoip2.Open("db/GeoLite2-Country.mmdb")
	if err != nil {
		log.Fatalf("failed to open GeoLite2 DB: %v", err)
	}
	geoDB = db
}

func LookupCountry(ip string) string {
	if geoDB == nil {
		return ""
	}
	addr, err := netip.ParseAddr(ip)
	if err != nil {
		return "Unknown"
	}
	record, err := geoDB.Country(addr)
	if err != nil || record == nil || record.Country.ISOCode == "" {
		return "Unknown"
	}
	return record.Country.ISOCode
}
