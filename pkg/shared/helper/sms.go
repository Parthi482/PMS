package helper

import (
	"bytes"
	"fmt"
	"io"
	"kriyatec.com/go-api/pkg/shared/database"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"time"
)

var smsEndpoint, route, userName, password, senderId, entityId, templateNonDeliveryId, templateOtpId string

func LoadSMSConfig() {
	smsEndpoint = os.Getenv("SMS_ENDPOINT")
	route = os.Getenv("SMS_ROUTE")
	userName = os.Getenv("SMS_USERNAME")
	password = os.Getenv("SMS_PASSWORD")
	senderId = os.Getenv("SMS_SENDER_ID")
	entityId = os.Getenv("SMS_ENTITY_ID")
	templateNonDeliveryId = os.Getenv("SMS_TEMPLATE_NON_DELIVERY_ID")
	templateOtpId = os.Getenv("SMS_TEMPLATE_OTP_ID")

}

func SendSMS(smsURL string) (string, string) {
	req, err := http.NewRequest("POST", smsURL, bytes.NewBuffer([]byte("")))
	if err != nil {
		return "", err.Error()
	}
	// Add headers to the request
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	// Create an HTTP client and make the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Print("Unable to send SMS, Possible Cause : ", err.Error())
		return "", err.Error()
	}
	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		log.Print("Unable to send SMS, Possible Cause : ", body)
		return "", "Unable to send SMS"
	}
	defer resp.Body.Close()
	return "SMS Sent Successfully", ""
}

func SmsInitNonDelivery(dNumber, to, consignmentNumber, reason string) {
	message := url.QueryEscape(fmt.Sprintf("Your Consignment %s is not delivered due to %s . To get it today , kindly call The Professional Couriers, %s or 0431-2500600", consignmentNumber, reason, dNumber))
	smsURL := fmt.Sprintf("%s?route=%s&uname=%s&pwd=%s&senderid=%s&to=%s&msg=%s&peid=%s&tempid=%s",
		smsEndpoint, route, userName, password, senderId, to, message, entityId, templateNonDeliveryId)
	SendSMS(smsURL)
}

func SmsInitOTP(to string, otp int) {
	message := url.QueryEscape(fmt.Sprintf("Use this OTP %d for The Professional Couriers mobile app installation", otp))
	smsURL := fmt.Sprintf("%s?route=%s&uname=%s&pwd=%s&senderid=%s&to=%s&msg=%s&peid=%s&tempid=%s",
		smsEndpoint, route, userName, password, senderId, to, message, entityId, templateOtpId)
	SendSMS(smsURL)
}

func SmsInitNonDelivery2(data map[string]interface{}) {
	var branchNumber, to, consignmentNumber, reason string
	holdingReason := data["holding_reason"].(string)
	if database.GetSMSDeliverableDetails(holdingReason) {
		if data["pccode"] != nil && data["mobile"] != nil && data["cno"] != nil {
			to = data["mobile"].(string)
		}
	}
	if len(to) != 0 {
		branchNumber = database.GetPickupCenterDetails(data["pccode"].(string))
		consignmentNumber = data["cno"].(string)
		reason = database.GetDeliveryStatusDescription(holdingReason)
		SmsInitNonDelivery(branchNumber, to, consignmentNumber, reason)
	}

}

func URLEncoding(input string) string {
	//log.Println("Input : ", input)
	encodedString := url.QueryEscape(input)
	//log.Println("After Encoding : ", encodedString)
	return encodedString
}

func GetOTPValue() int {
	rand.Seed(time.Now().UnixNano())
	otp := rand.Intn(900000) + 100000 // generates a random number between 100000 and 999999
	//fmt.Printf("Your OTP is: %d\n", otp)
	return otp
}
