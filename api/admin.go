// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

package api

import (
	"bufio"
	"net/http"
	"os"
	"strings"

	l4g "github.com/alecthomas/log4go"
	"github.com/gorilla/mux"

	"github.com/mattermost/platform/model"
	"github.com/mattermost/platform/utils"
)

func InitAdmin(r *mux.Router) {
	l4g.Debug(utils.T("api.admin.init.debug"))

	sr := r.PathPrefix("/admin").Subrouter()
	sr.Handle("/logs", ApiUserRequired(getLogs)).Methods("GET")
	sr.Handle("/config", ApiUserRequired(getConfig)).Methods("GET")
	sr.Handle("/save_config", ApiUserRequired(saveConfig)).Methods("POST")
	sr.Handle("/test_email", ApiUserRequired(testEmail)).Methods("POST")
	sr.Handle("/client_props", ApiAppHandler(getClientConfig)).Methods("GET")
	sr.Handle("/log_client", ApiAppHandler(logClient)).Methods("POST")
	sr.Handle("/analytics/{id:[A-Za-z0-9]+}/{name:[A-Za-z0-9_]+}", ApiAppHandler(getAnalytics)).Methods("GET")
	sr.Handle("/analytics/{name:[A-Za-z0-9_]+}", ApiAppHandler(getAnalytics)).Methods("GET")
}

func getLogs(c *Context, w http.ResponseWriter, r *http.Request) {

	if !c.HasSystemAdminPermissions("getLogs") {
		return
	}

	var lines []string

	if utils.Cfg.LogSettings.EnableFile {

		file, err := os.Open(utils.GetLogFileLocation(utils.Cfg.LogSettings.FileLocation))
		if err != nil {
			c.Err = model.NewLocAppError("getLogs", "api.admin.file_read_error", nil, err.Error())
		}

		defer file.Close()

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			lines = append(lines, scanner.Text())
		}
	} else {
		lines = append(lines, "")
	}

	w.Write([]byte(model.ArrayToJson(lines)))
}

func getClientConfig(c *Context, w http.ResponseWriter, r *http.Request) {
	w.Write([]byte(model.MapToJson(utils.ClientCfg)))
}

func logClient(c *Context, w http.ResponseWriter, r *http.Request) {
	m := model.MapFromJson(r.Body)

	lvl := m["level"]
	msg := m["message"]

	if len(msg) > 400 {
		msg = msg[0:399]
	}

	if lvl == "ERROR" {
		err := &model.AppError{}
		err.Message = msg
		err.Where = "client"
		c.LogError(err)
	}

	rm := make(map[string]string)
	rm["SUCCESS"] = "true"
	w.Write([]byte(model.MapToJson(rm)))
}

func getConfig(c *Context, w http.ResponseWriter, r *http.Request) {
	if !c.HasSystemAdminPermissions("getConfig") {
		return
	}

	json := utils.Cfg.ToJson()
	cfg := model.ConfigFromJson(strings.NewReader(json))
	json = cfg.ToJson()

	w.Write([]byte(json))
}

func saveConfig(c *Context, w http.ResponseWriter, r *http.Request) {
	if !c.HasSystemAdminPermissions("getConfig") {
		return
	}

	cfg := model.ConfigFromJson(r.Body)
	if cfg == nil {
		c.SetInvalidParam("saveConfig", "config")
		return
	}

	cfg.SetDefaults()

	if err := cfg.IsValid(); err != nil {
		c.Err = err
		return
	}

	utils.SaveConfig(utils.CfgFileName, cfg)
	utils.LoadConfig(utils.CfgFileName)
	json := utils.Cfg.ToJson()
	w.Write([]byte(json))
}

func testEmail(c *Context, w http.ResponseWriter, r *http.Request) {
	if !c.HasSystemAdminPermissions("testEmail") {
		return
	}

	cfg := model.ConfigFromJson(r.Body)
	if cfg == nil {
		c.SetInvalidParam("testEmail", "config")
		return
	}

	if result := <-Srv.Store.User().Get(c.Session.UserId); result.Err != nil {
		c.Err = result.Err
		return
	} else {
		if err := utils.SendMailUsingConfig(result.Data.(*model.User).Email, c.T("api.admin.test_email.subject"), c.T("api.admin.test_email.body"), cfg); err != nil {
			c.Err = err
			return
		}
	}

	m := make(map[string]string)
	m["SUCCESS"] = "true"
	w.Write([]byte(model.MapToJson(m)))
}

func getAnalytics(c *Context, w http.ResponseWriter, r *http.Request) {
	if !c.HasSystemAdminPermissions("getAnalytics") {
		return
	}

	params := mux.Vars(r)
	teamId := params["id"]
	name := params["name"]

	if name == "standard" {
		var rows model.AnalyticsRows = make([]*model.AnalyticsRow, 4)
		rows[0] = &model.AnalyticsRow{"channel_open_count", 0}
		rows[1] = &model.AnalyticsRow{"channel_private_count", 0}
		rows[2] = &model.AnalyticsRow{"post_count", 0}
		rows[3] = &model.AnalyticsRow{"unique_user_count", 0}
		openChan := Srv.Store.Channel().AnalyticsTypeCount(teamId, model.CHANNEL_OPEN)
		privateChan := Srv.Store.Channel().AnalyticsTypeCount(teamId, model.CHANNEL_PRIVATE)
		postChan := Srv.Store.Post().AnalyticsPostCount(teamId)
		userChan := Srv.Store.User().AnalyticsUniqueUserCount(teamId)

		if r := <-openChan; r.Err != nil {
			c.Err = r.Err
			return
		} else {
			rows[0].Value = float64(r.Data.(int64))
		}

		if r := <-privateChan; r.Err != nil {
			c.Err = r.Err
			return
		} else {
			rows[1].Value = float64(r.Data.(int64))
		}

		if r := <-postChan; r.Err != nil {
			c.Err = r.Err
			return
		} else {
			rows[2].Value = float64(r.Data.(int64))
		}

		if r := <-userChan; r.Err != nil {
			c.Err = r.Err
			return
		} else {
			rows[3].Value = float64(r.Data.(int64))
		}

		w.Write([]byte(rows.ToJson()))
	} else if name == "post_counts_day" {
		if r := <-Srv.Store.Post().AnalyticsPostCountsByDay(teamId); r.Err != nil {
			c.Err = r.Err
			return
		} else {
			w.Write([]byte(r.Data.(model.AnalyticsRows).ToJson()))
		}
	} else if name == "user_counts_with_posts_day" {
		if r := <-Srv.Store.Post().AnalyticsUserCountsWithPostsByDay(teamId); r.Err != nil {
			c.Err = r.Err
			return
		} else {
			w.Write([]byte(r.Data.(model.AnalyticsRows).ToJson()))
		}
	} else {
		c.SetInvalidParam("getAnalytics", "name")
	}

}
