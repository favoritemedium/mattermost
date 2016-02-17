// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

package api

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	l4g "github.com/alecthomas/log4go"
	"github.com/mattermost/platform/model"
	"github.com/mattermost/platform/utils"
	"io"
	"mime/multipart"
	"strconv"
	"strings"
)

type SlackChannel struct {
	Id      string            `json:"id"`
	Name    string            `json:"name"`
	Members []string          `json:"members"`
	Topic   map[string]string `json:"topic"`
}

type SlackUser struct {
	Id       string            `json:"id"`
	Username string            `json:"name"`
	Profile  map[string]string `json:"profile"`
}

type SlackPost struct {
	User        string            `json:"user"`
	BotId       string            `json:"bot_id"`
	BotUsername string            `json:"username"`
	Text        string            `json:"text"`
	TimeStamp   string            `json:"ts"`
	Type        string            `json:"type"`
	SubType     string            `json:"subtype"`
	Comment     map[string]string `json:"comment"`
}

func SlackConvertTimeStamp(ts string) int64 {
	timeString := strings.SplitN(ts, ".", 2)[0]

	timeStamp, err := strconv.ParseInt(timeString, 10, 64)
	if err != nil {
		l4g.Warn(utils.T("api.slackimport.slack_convert_timestamp.bad.warn"))
		return 1
	}
	return timeStamp * 1000 // Convert to milliseconds
}

func SlackConvertChannelName(channelName string) string {
	newName := strings.Trim(channelName, "_-")
	if len(newName) == 1 {
		return "slack-channel-" + newName
	}

	return newName
}

func SlackParseChannels(data io.Reader) []SlackChannel {
	decoder := json.NewDecoder(data)

	var channels []SlackChannel
	if err := decoder.Decode(&channels); err != nil {
		return make([]SlackChannel, 0)
	}
	return channels
}

func SlackParseUsers(data io.Reader) []SlackUser {
	decoder := json.NewDecoder(data)

	var users []SlackUser
	if err := decoder.Decode(&users); err != nil {
		return make([]SlackUser, 0)
	}
	return users
}

func SlackParsePosts(data io.Reader) []SlackPost {
	decoder := json.NewDecoder(data)

	var posts []SlackPost
	if err := decoder.Decode(&posts); err != nil {
		return make([]SlackPost, 0)
	}
	return posts
}

func SlackAddUsers(teamId string, slackusers []SlackUser, log *bytes.Buffer) map[string]*model.User {
	// Log header
	log.WriteString(utils.T("api.slackimport.slack_add_users.created"))
	log.WriteString("===============\r\n\r\n")

	addedUsers := make(map[string]*model.User)
	for _, sUser := range slackusers {
		firstName := ""
		lastName := ""
		if name, ok := sUser.Profile["first_name"]; ok {
			firstName = name
		}
		if name, ok := sUser.Profile["last_name"]; ok {
			lastName = name
		}

		password := model.NewId()

		newUser := model.User{
			TeamId:    teamId,
			Username:  sUser.Username,
			FirstName: firstName,
			LastName:  lastName,
			Email:     sUser.Profile["email"],
			Password:  password,
		}

		if mUser := ImportUser(&newUser); mUser != nil {
			addedUsers[sUser.Id] = mUser
			log.WriteString(utils.T("api.slackimport.slack_add_users.email_pwd", map[string]interface{}{"Email": newUser.Email, "Password": password}))
		} else {
			log.WriteString(utils.T("api.slackimport.slack_add_users.unable_import", map[string]interface{}{"Username": sUser.Username}))
		}
	}

	return addedUsers
}

func SlackAddPosts(channel *model.Channel, posts []SlackPost, users map[string]*model.User) {
	for _, sPost := range posts {
		switch {
		case sPost.Type == "message" && (sPost.SubType == "" || sPost.SubType == "file_share"):
			if sPost.User == "" {
				l4g.Debug(utils.T("api.slackimport.slack_add_posts.without_user.debug"))
				continue
			} else if users[sPost.User] == nil {
				l4g.Debug(utils.T("api.slackimport.slack_add_posts.user_no_exists.debug"), sPost.User)
				continue
			}
			newPost := model.Post{
				UserId:    users[sPost.User].Id,
				ChannelId: channel.Id,
				Message:   sPost.Text,
				CreateAt:  SlackConvertTimeStamp(sPost.TimeStamp),
			}
			ImportPost(&newPost)
		case sPost.Type == "message" && sPost.SubType == "file_comment":
			if sPost.Comment["user"] == "" {
				l4g.Debug(utils.T("api.slackimport.slack_add_posts.msg_no_usr.debug"))
				continue
			} else if users[sPost.Comment["user"]] == nil {
				l4g.Debug(utils.T("api.slackimport.slack_add_posts.user_no_exists.debug"), sPost.User)
				continue
			}
			newPost := model.Post{
				UserId:    users[sPost.Comment["user"]].Id,
				ChannelId: channel.Id,
				Message:   sPost.Comment["comment"],
				CreateAt:  SlackConvertTimeStamp(sPost.TimeStamp),
			}
			ImportPost(&newPost)
		case sPost.Type == "message" && sPost.SubType == "bot_message":
			// In the future this will use the "Action Post" spec to post
			// a message without using a username. For now we just warn that we don't handle this case
			l4g.Warn(utils.T("api.slackimport.slack_add_posts.bot.warn"))
		default:
			l4g.Warn(utils.T("api.slackimport.slack_add_posts.unsupported.warn"), sPost.Type, sPost.SubType)
		}
	}
}

func SlackAddChannels(teamId string, slackchannels []SlackChannel, posts map[string][]SlackPost, users map[string]*model.User, log *bytes.Buffer) map[string]*model.Channel {
	// Write Header
	log.WriteString(utils.T("api.slackimport.slack_add_channels.added"))
	log.WriteString("=================\r\n\r\n")

	addedChannels := make(map[string]*model.Channel)
	for _, sChannel := range slackchannels {
		newChannel := model.Channel{
			TeamId:      teamId,
			Type:        model.CHANNEL_OPEN,
			DisplayName: sChannel.Name,
			Name:        SlackConvertChannelName(sChannel.Name),
			Purpose:     sChannel.Topic["value"],
		}
		mChannel := ImportChannel(&newChannel)
		if mChannel == nil {
			// Maybe it already exists?
			if result := <-Srv.Store.Channel().GetByName(teamId, sChannel.Name); result.Err != nil {
				l4g.Debug(utils.T("api.slackimport.slack_add_channels.import_failed.debug"), newChannel.DisplayName)
				log.WriteString(utils.T("api.slackimport.slack_add_channels.import_failed", map[string]interface{}{"DisplayName": newChannel.DisplayName}))
				continue
			} else {
				mChannel = result.Data.(*model.Channel)
				log.WriteString(utils.T("api.slackimport.slack_add_channels.merge", map[string]interface{}{"DisplayName": newChannel.DisplayName}))
			}
		}
		log.WriteString(newChannel.DisplayName + "\r\n")
		addedChannels[sChannel.Id] = mChannel
		SlackAddPosts(mChannel, posts[sChannel.Name], users)
	}

	return addedChannels
}

func SlackImport(fileData multipart.File, fileSize int64, teamID string) (*model.AppError, *bytes.Buffer) {
	zipreader, err := zip.NewReader(fileData, fileSize)
	if err != nil || zipreader.File == nil {
		return model.NewLocAppError("SlackImport", "api.slackimport.slack_import.zip.app_error", nil, err.Error()), nil
	}

	// Create log file
	log := bytes.NewBufferString(utils.T("api.slackimport.slack_import.log"))

	var channels []SlackChannel
	var users []SlackUser
	posts := make(map[string][]SlackPost)
	for _, file := range zipreader.File {
		reader, err := file.Open()
		if err != nil {
			return model.NewLocAppError("SlackImport", "api.slackimport.slack_import.open.app_error", map[string]interface{}{"Filename": file.Name}, err.Error()), log
		}
		if file.Name == "channels.json" {
			channels = SlackParseChannels(reader)
		} else if file.Name == "users.json" {
			users = SlackParseUsers(reader)
		} else {
			spl := strings.Split(file.Name, "/")
			if len(spl) == 2 && strings.HasSuffix(spl[1], ".json") {
				newposts := SlackParsePosts(reader)
				channel := spl[0]
				if _, ok := posts[channel]; ok == false {
					posts[channel] = newposts
				} else {
					posts[channel] = append(posts[channel], newposts...)
				}
			}

		}
	}

	addedUsers := SlackAddUsers(teamID, users, log)
	SlackAddChannels(teamID, channels, posts, addedUsers, log)

	log.WriteString(utils.T("api.slackimport.slack_import.notes"))
	log.WriteString("=======\r\n\r\n")

	log.WriteString(utils.T("api.slackimport.slack_import.note1"))
	log.WriteString(utils.T("api.slackimport.slack_import.note2"))

	return nil, log
}
