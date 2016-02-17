// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

package oauthgoogle

import (
	"encoding/json"
	l4g "github.com/alecthomas/log4go"
	"github.com/mattermost/platform/einterfaces"
	"github.com/mattermost/platform/model"
	"io"
	"strings"
)

const (
	USER_AUTH_SERVICE_GOOGLE = "google"
)

type GoogleProvider struct {
}

type GoogleUser struct {
	Id            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
}

func init() {
	l4g.Debug("GOOGLE OAUTH INITIALIZED")
	provider := &GoogleProvider{}
	einterfaces.RegisterOauthProvider(USER_AUTH_SERVICE_GOOGLE, provider)
}

func userFromGoogleUser(gou *GoogleUser) *model.User {
	user := &model.User{}
	username := gou.Email

	user.Username = model.CleanUsername(username)
	splitName := strings.Split(gou.Name, " ")
	if len(splitName) == 2 {
		user.FirstName = splitName[0]
		user.LastName = splitName[1]
	} else if len(splitName) >= 2 {
		user.FirstName = splitName[0]
		user.LastName = strings.Join(splitName[1:], " ")
	} else {
		user.FirstName = gou.Name
	}
	user.Email = gou.Email
	user.AuthData = gou.Id
	user.AuthService = USER_AUTH_SERVICE_GOOGLE

	return user
}

func googleUserFromJson(data io.Reader) *GoogleUser {
	decoder := json.NewDecoder(data)
	var gou GoogleUser
	err := decoder.Decode(&gou)
	if err == nil {
		return &gou
	} else {
		return nil
	}
}

func (gou *GoogleUser) getAuthData() string {
	return gou.Id
}

func (m *GoogleProvider) GetIdentifier() string {
	return USER_AUTH_SERVICE_GOOGLE
}

func (m *GoogleProvider) GetUserFromJson(data io.Reader) *model.User {
	return userFromGoogleUser(googleUserFromJson(data))
}

func (m *GoogleProvider) GetAuthDataFromJson(data io.Reader) string {
	return googleUserFromJson(data).getAuthData()
}
