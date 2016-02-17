// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

package api

import (
	l4g "github.com/alecthomas/log4go"
	"github.com/gorilla/websocket"
	"github.com/mattermost/platform/model"
	"github.com/mattermost/platform/store"
	"github.com/mattermost/platform/utils"
	"time"
)

const (
	WRITE_WAIT  = 10 * time.Second
	PONG_WAIT   = 60 * time.Second
	PING_PERIOD = (PONG_WAIT * 9) / 10
	MAX_SIZE    = 512
	REDIS_WAIT  = 60 * time.Second
)

type WebConn struct {
	WebSocket          *websocket.Conn
	Send               chan *model.Message
	TeamId             string
	UserId             string
	ChannelAccessCache map[string]bool
}

func NewWebConn(ws *websocket.Conn, teamId string, userId string, sessionId string) *WebConn {
	go func() {
		achan := Srv.Store.User().UpdateUserAndSessionActivity(userId, sessionId, model.GetMillis())
		pchan := Srv.Store.User().UpdateLastPingAt(userId, model.GetMillis())

		if result := <-achan; result.Err != nil {
			l4g.Error(utils.T("api.web_conn.new_web_conn.last_activity.error"), userId, sessionId, result.Err)
		}

		if result := <-pchan; result.Err != nil {
			l4g.Error(utils.T("api.web_conn.new_web_conn.last_ping.error"), userId, result.Err)
		}
	}()

	return &WebConn{Send: make(chan *model.Message, 64), WebSocket: ws, UserId: userId, TeamId: teamId, ChannelAccessCache: make(map[string]bool)}
}

func (c *WebConn) readPump() {
	defer func() {
		hub.Unregister(c)
		c.WebSocket.Close()
	}()
	c.WebSocket.SetReadLimit(MAX_SIZE)
	c.WebSocket.SetReadDeadline(time.Now().Add(PONG_WAIT))
	c.WebSocket.SetPongHandler(func(string) error {
		c.WebSocket.SetReadDeadline(time.Now().Add(PONG_WAIT))

		go func() {
			if result := <-Srv.Store.User().UpdateLastPingAt(c.UserId, model.GetMillis()); result.Err != nil {
				l4g.Error(utils.T("api.web_conn.new_web_conn.last_ping.error"), c.UserId, result.Err)
			}
		}()

		return nil
	})

	for {
		var msg model.Message
		if err := c.WebSocket.ReadJSON(&msg); err != nil {
			return
		} else {
			msg.TeamId = c.TeamId
			msg.UserId = c.UserId
			PublishAndForget(&msg)
		}
	}
}

func (c *WebConn) writePump() {
	ticker := time.NewTicker(PING_PERIOD)

	defer func() {
		ticker.Stop()
		c.WebSocket.Close()
	}()

	for {
		select {
		case msg, ok := <-c.Send:
			if !ok {
				c.WebSocket.SetWriteDeadline(time.Now().Add(WRITE_WAIT))
				c.WebSocket.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			c.WebSocket.SetWriteDeadline(time.Now().Add(WRITE_WAIT))
			if err := c.WebSocket.WriteJSON(msg); err != nil {
				return
			}

		case <-ticker.C:
			c.WebSocket.SetWriteDeadline(time.Now().Add(WRITE_WAIT))
			if err := c.WebSocket.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				return
			}
		}
	}
}

func (c *WebConn) updateChannelAccessCache(channelId string) bool {
	allowed := hasPermissionsToChannel(Srv.Store.Channel().CheckPermissionsTo(c.TeamId, channelId, c.UserId))
	c.ChannelAccessCache[channelId] = allowed

	return allowed
}

func hasPermissionsToChannel(sc store.StoreChannel) bool {
	if cresult := <-sc; cresult.Err != nil {
		return false
	} else if cresult.Data.(int64) != 1 {
		return false
	}

	return true
}
