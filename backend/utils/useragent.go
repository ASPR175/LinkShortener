package utils

import (
	"github.com/mssola/user_agent"
)

func ParseUserAgent(ua string) (browser, device string) {
	if ua == "" {
		return "Unknown", "Unknown"
	}

	uaParser := user_agent.New(ua)

	name, _ := uaParser.Browser()
	if name == "" {
		name = "Unknown"
	}

	device = "Desktop"
	if uaParser.Mobile() {
		device = "Mobile"
	} else if uaParser.Bot() {
		device = "Tablet"
	} else {
		device = "Desktop"
	}

	return name, device
}
