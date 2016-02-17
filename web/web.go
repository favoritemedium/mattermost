// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

package web

import (
	"fmt"
	l4g "github.com/alecthomas/log4go"
	"github.com/gorilla/mux"
	"github.com/mattermost/platform/api"
	"github.com/mattermost/platform/model"
	"github.com/mattermost/platform/store"
	"github.com/mattermost/platform/utils"
	"github.com/mssola/user_agent"
	"gopkg.in/fsnotify.v1"
	"html/template"
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

var Templates *template.Template

type HtmlTemplatePage api.Page

func NewHtmlTemplatePage(templateName string, title string, locale string) *HtmlTemplatePage {

	if len(title) > 0 {
		title = utils.Cfg.TeamSettings.SiteName + " - " + title
	}

	props := make(map[string]string)
	props["Title"] = title
	return &HtmlTemplatePage{
		TemplateName:  templateName,
		Props:         props,
		ClientCfg:     utils.ClientCfg,
		ClientLicense: utils.ClientLicense,
		Locale:        locale,
	}
}

func (me *HtmlTemplatePage) Render(c *api.Context, w http.ResponseWriter) {
	if me.Team != nil {
		me.Team.Sanitize()
	}

	if me.User != nil {
		me.User.Sanitize(map[string]bool{})
		me.Locale = me.User.Locale
	}

	me.Props["Locale"] = me.Locale
	me.SessionTokenIndex = c.SessionTokenIndex

	me.ClientCfg["FooterHelp"] = c.T("web.footer.help")
	me.ClientCfg["FooterTerms"] = c.T("web.footer.terms")
	me.ClientCfg["FooterPrivacy"] = c.T("web.footer.privacy")
	me.ClientCfg["FooterAbout"] = c.T("web.footer.about")

	if err := Templates.ExecuteTemplate(w, me.TemplateName, me); err != nil {
		c.SetUnknownError(me.TemplateName, err.Error())
	}
}

func InitWeb() {
	l4g.Debug(utils.T("web.init.debug"))

	mainrouter := api.Srv.Router

	staticDir := utils.FindDir("web/static")
	l4g.Debug("Using static directory at %v", staticDir)
	mainrouter.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir(staticDir))))

	mainrouter.Handle("/", api.AppHandlerIndependent(root)).Methods("GET")
	mainrouter.Handle("/oauth/authorize", api.UserRequired(authorizeOAuth)).Methods("GET")
	mainrouter.Handle("/oauth/access_token", api.ApiAppHandler(getAccessToken)).Methods("POST")

	mainrouter.Handle("/signup_team_complete/", api.AppHandlerIndependent(signupTeamComplete)).Methods("GET")
	mainrouter.Handle("/signup_user_complete/", api.AppHandlerIndependent(signupUserComplete)).Methods("GET")
	mainrouter.Handle("/signup_team_confirm/", api.AppHandlerIndependent(signupTeamConfirm)).Methods("GET")
	mainrouter.Handle("/verify_email", api.AppHandlerIndependent(verifyEmail)).Methods("GET")
	mainrouter.Handle("/find_team", api.AppHandlerIndependent(findTeam)).Methods("GET")
	mainrouter.Handle("/signup_team", api.AppHandlerIndependent(signup)).Methods("GET")
	mainrouter.Handle("/login/{service:[A-Za-z]+}/complete", api.AppHandlerIndependent(completeOAuth)).Methods("GET")  // Remove after a few releases (~1.8)
	mainrouter.Handle("/signup/{service:[A-Za-z]+}/complete", api.AppHandlerIndependent(completeOAuth)).Methods("GET") // Remove after a few releases (~1.8)
	mainrouter.Handle("/{service:[A-Za-z]+}/complete", api.AppHandlerIndependent(completeOAuth)).Methods("GET")

	mainrouter.Handle("/admin_console", api.UserRequired(adminConsole)).Methods("GET")
	mainrouter.Handle("/admin_console/", api.UserRequired(adminConsole)).Methods("GET")
	mainrouter.Handle("/admin_console/{tab:[A-Za-z0-9-_]+}", api.UserRequired(adminConsole)).Methods("GET")
	mainrouter.Handle("/admin_console/{tab:[A-Za-z0-9-_]+}/{team:[A-Za-z0-9-]*}", api.UserRequired(adminConsole)).Methods("GET")

	mainrouter.Handle("/hooks/{id:[A-Za-z0-9]+}", api.ApiAppHandler(incomingWebhook)).Methods("POST")

	mainrouter.Handle("/docs/{doc:[A-Za-z0-9]+}", api.AppHandlerIndependent(docs)).Methods("GET")

	// ----------------------------------------------------------------------------------------------
	// *ANYTHING* team specific should go below this line
	// ----------------------------------------------------------------------------------------------

	mainrouter.Handle("/{team:[A-Za-z0-9-]+(__)?[A-Za-z0-9-]+}", api.AppHandler(login)).Methods("GET")
	mainrouter.Handle("/{team:[A-Za-z0-9-]+(__)?[A-Za-z0-9-]+}/", api.AppHandler(login)).Methods("GET")
	mainrouter.Handle("/{team:[A-Za-z0-9-]+(__)?[A-Za-z0-9-]+}/login", api.AppHandler(login)).Methods("GET")
	mainrouter.Handle("/{team:[A-Za-z0-9-]+(__)?[A-Za-z0-9-]+}/logout", api.AppHandler(logout)).Methods("GET")
	mainrouter.Handle("/{team:[A-Za-z0-9-]+(__)?[A-Za-z0-9-]+}/reset_password", api.AppHandler(resetPassword)).Methods("GET")
	mainrouter.Handle("/{team:[A-Za-z0-9-]+(__)?[A-Za-z0-9-]+}/claim", api.AppHandler(claimAccount)).Methods("GET")
	mainrouter.Handle("/{team}/pl/{postid}", api.AppHandler(postPermalink)).Methods("GET")         // Bug in gorilla.mux prevents us from using regex here.
	mainrouter.Handle("/{team}/login/{service}", api.AppHandler(loginWithOAuth)).Methods("GET")    // Bug in gorilla.mux prevents us from using regex here.
	mainrouter.Handle("/{team}/channels/{channelname}", api.AppHandler(getChannel)).Methods("GET") // Bug in gorilla.mux prevents us from using regex here.
	mainrouter.Handle("/{team}/signup/{service}", api.AppHandler(signupWithOAuth)).Methods("GET")  // Bug in gorilla.mux prevents us from using regex here.

	watchAndParseTemplates()
}

func watchAndParseTemplates() {

	templatesDir := utils.FindDir("web/templates")
	l4g.Debug(utils.T("web.parsing_templates.debug"), templatesDir)
	var err error
	if Templates, err = template.ParseGlob(templatesDir + "*.html"); err != nil {
		l4g.Error(utils.T("web.parsing_templates.error"), err)
	}

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		l4g.Error(utils.T("web.create_dir.error"), err)
	}

	go func() {
		for {
			select {
			case event := <-watcher.Events:
				if event.Op&fsnotify.Write == fsnotify.Write {
					l4g.Info(utils.T("web.reparse_templates.info"), event.Name)
					if Templates, err = template.ParseGlob(templatesDir + "*.html"); err != nil {
						l4g.Error(utils.T("web.parsing_templates.error"), err)
					}
				}
			case err := <-watcher.Errors:
				l4g.Error(utils.T("web.dir_fail.error"), err)
			}
		}
	}()

	err = watcher.Add(templatesDir)
	if err != nil {
		l4g.Error(utils.T("web.watcher_fail.error"), err)
	}
}

var browsersNotSupported string = "MSIE/8;MSIE/9;MSIE/10;Internet Explorer/8;Internet Explorer/9;Internet Explorer/10;Safari/7;Safari/8"

func CheckBrowserCompatability(c *api.Context, r *http.Request) bool {
	ua := user_agent.New(r.UserAgent())
	bname, bversion := ua.Browser()

	browsers := strings.Split(browsersNotSupported, ";")
	for _, browser := range browsers {
		version := strings.Split(browser, "/")

		if strings.HasPrefix(bname, version[0]) && strings.HasPrefix(bversion, version[1]) {
			c.Err = model.NewLocAppError("CheckBrowserCompatability", "web.check_browser_compatibility.app_error", nil, "")
			return false
		}
	}

	return true

}

func root(c *api.Context, w http.ResponseWriter, r *http.Request) {

	if !CheckBrowserCompatability(c, r) {
		return
	}

	if len(c.Session.UserId) == 0 {
		page := NewHtmlTemplatePage("signup_team", c.T("web.root.singup_title"), c.Locale)
		page.Props["Info"] = c.T("web.root.singup_info")

		if result := <-api.Srv.Store.Team().GetAllTeamListing(); result.Err != nil {
			c.Err = result.Err
			return
		} else {
			teams := result.Data.([]*model.Team)
			for _, team := range teams {
				page.Props[team.Name] = team.DisplayName
			}

			if len(teams) == 1 && *utils.Cfg.TeamSettings.EnableTeamListing && !utils.Cfg.TeamSettings.EnableTeamCreation {
				http.Redirect(w, r, c.GetSiteURL()+"/"+teams[0].Name, http.StatusTemporaryRedirect)
				return
			}
		}

		page.Render(c, w)
	} else {
		teamChan := api.Srv.Store.Team().Get(c.Session.TeamId)
		userChan := api.Srv.Store.User().Get(c.Session.UserId)

		var team *model.Team
		if tr := <-teamChan; tr.Err != nil {
			c.Err = tr.Err
			return
		} else {
			team = tr.Data.(*model.Team)

		}

		var user *model.User
		if ur := <-userChan; ur.Err != nil {
			c.Err = ur.Err
			return
		} else {
			user = ur.Data.(*model.User)
		}

		page := NewHtmlTemplatePage("home", c.T("web.root.home_title"), c.Locale)
		page.Team = team
		page.User = user
		page.Render(c, w)
	}
}

func signup(c *api.Context, w http.ResponseWriter, r *http.Request) {

	if !CheckBrowserCompatability(c, r) {
		return
	}

	page := NewHtmlTemplatePage("signup_team", c.T("web.root.singup_title"), c.Locale)
	page.Render(c, w)
}

func login(c *api.Context, w http.ResponseWriter, r *http.Request) {
	if !CheckBrowserCompatability(c, r) {
		return
	}
	params := mux.Vars(r)
	teamName := params["team"]

	var team *model.Team
	if tResult := <-api.Srv.Store.Team().GetByName(teamName); tResult.Err != nil {
		l4g.Error(utils.T("web.login.error"), teamName, tResult.Err.Message)
		http.Redirect(w, r, api.GetProtocol(r)+"://"+r.Host, http.StatusTemporaryRedirect)
		return
	} else {
		team = tResult.Data.(*model.Team)
	}

	// We still might be able to switch to this team because we've logged in before
	_, session := api.FindMultiSessionForTeamId(r, team.Id)
	if session != nil {
		w.Header().Set(model.HEADER_TOKEN, session.Token)
		lastViewChannelName := "town-square"
		if lastViewResult := <-api.Srv.Store.Preference().Get(session.UserId, model.PREFERENCE_CATEGORY_LAST, model.PREFERENCE_NAME_LAST_CHANNEL); lastViewResult.Err == nil {
			if lastViewChannelResult := <-api.Srv.Store.Channel().Get(lastViewResult.Data.(model.Preference).Value); lastViewChannelResult.Err == nil {
				lastViewChannelName = lastViewChannelResult.Data.(*model.Channel).Name
			}
		}

		http.Redirect(w, r, c.GetSiteURL()+"/"+team.Name+"/channels/"+lastViewChannelName, http.StatusTemporaryRedirect)
		return
	}

	page := NewHtmlTemplatePage("login", c.T("web.login.login_title"), c.Locale)
	page.Props["TeamDisplayName"] = team.DisplayName
	page.Props["TeamName"] = team.Name

	if team.AllowOpenInvite {
		page.Props["InviteId"] = team.InviteId
	}

	page.Render(c, w)
}

func signupTeamConfirm(c *api.Context, w http.ResponseWriter, r *http.Request) {
	email := r.FormValue("email")

	page := NewHtmlTemplatePage("signup_team_confirm", c.T("web.signup_team_confirm.title"), c.Locale)
	page.Props["Email"] = email
	page.Render(c, w)
}

func signupTeamComplete(c *api.Context, w http.ResponseWriter, r *http.Request) {
	data := r.FormValue("d")
	hash := r.FormValue("h")

	if !model.ComparePassword(hash, fmt.Sprintf("%v:%v", data, utils.Cfg.EmailSettings.InviteSalt)) {
		c.Err = model.NewLocAppError("signupTeamComplete", "web.signup_team_complete.invalid_link.app_error", nil, "")
		return
	}

	props := model.MapFromJson(strings.NewReader(data))

	t, err := strconv.ParseInt(props["time"], 10, 64)
	if err != nil || model.GetMillis()-t > 1000*60*60*24*30 { // 30 days
		c.Err = model.NewLocAppError("signupTeamComplete", "web.signup_team_complete.link_expired.app_error", nil, "")
		return
	}

	page := NewHtmlTemplatePage("signup_team_complete", c.T("web.signup_team_complete.title"), c.Locale)
	page.Props["Email"] = props["email"]
	page.Props["Data"] = data
	page.Props["Hash"] = hash
	page.Render(c, w)
}

func signupUserComplete(c *api.Context, w http.ResponseWriter, r *http.Request) {

	id := r.FormValue("id")
	data := r.FormValue("d")
	hash := r.FormValue("h")
	var props map[string]string

	if len(id) > 0 {
		props = make(map[string]string)

		if result := <-api.Srv.Store.Team().GetByInviteId(id); result.Err != nil {
			c.Err = result.Err
			return
		} else {
			team := result.Data.(*model.Team)
			if !(team.Type == model.TEAM_OPEN || (team.Type == model.TEAM_INVITE && len(team.AllowedDomains) > 0)) {
				c.Err = model.NewLocAppError("signupUserComplete", "web.signup_user_complete.no_invites.app_error", nil, "id="+id)
				return
			}

			props["email"] = ""
			props["display_name"] = team.DisplayName
			props["name"] = team.Name
			props["id"] = team.Id
			data = model.MapToJson(props)
			hash = ""
		}
	} else {

		if !model.ComparePassword(hash, fmt.Sprintf("%v:%v", data, utils.Cfg.EmailSettings.InviteSalt)) {
			c.Err = model.NewLocAppError("signupTeamComplete", "web.signup_user_complete.link_invalid.app_error", nil, "")
			return
		}

		props = model.MapFromJson(strings.NewReader(data))

		t, err := strconv.ParseInt(props["time"], 10, 64)
		if err != nil || model.GetMillis()-t > 1000*60*60*48 { // 48 hour
			c.Err = model.NewLocAppError("signupTeamComplete", "web.signup_user_complete.link_expired.app_error", nil, "")
			return
		}
	}

	page := NewHtmlTemplatePage("signup_user_complete", c.T("web.signup_user_complete.title"), c.Locale)
	page.Props["Email"] = props["email"]
	page.Props["TeamDisplayName"] = props["display_name"]
	page.Props["TeamName"] = props["name"]
	page.Props["TeamId"] = props["id"]
	page.Props["Data"] = data
	page.Props["Hash"] = hash
	page.Render(c, w)
}

func logout(c *api.Context, w http.ResponseWriter, r *http.Request) {
	api.Logout(c, w, r)
	http.Redirect(w, r, c.GetTeamURL(), http.StatusTemporaryRedirect)
}

func postPermalink(c *api.Context, w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	teamName := params["team"]
	postId := params["postid"]

	if len(postId) != 26 {
		c.Err = model.NewLocAppError("postPermalink", "web.post_permalink.app_error", nil, "id="+postId)
		return
	}

	team := checkSessionSwitch(c, w, r, teamName)
	if team == nil {
		// Error already set by getTeam
		return
	}

	var post *model.Post
	if result := <-api.Srv.Store.Post().Get(postId); result.Err != nil {
		c.Err = result.Err
		return
	} else {
		postlist := result.Data.(*model.PostList)
		post = postlist.Posts[postlist.Order[0]]
	}

	var channel *model.Channel
	if result := <-api.Srv.Store.Channel().CheckPermissionsTo(c.Session.TeamId, post.ChannelId, c.Session.UserId); result.Err != nil {
		c.Err = result.Err
		return
	} else {
		if result.Data.(int64) == 0 {
			if channel = autoJoinChannelId(c, w, r, post.ChannelId); channel == nil {
				http.Redirect(w, r, c.GetTeamURL()+"/channels/town-square", http.StatusFound)
				return
			}
		} else {
			if result := <-api.Srv.Store.Channel().Get(post.ChannelId); result.Err != nil {
				c.Err = result.Err
				return
			} else {
				channel = result.Data.(*model.Channel)
			}
		}
	}

	doLoadChannel(c, w, r, team, channel, post.Id)
}

func getChannel(c *api.Context, w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	name := params["channelname"]
	teamName := params["team"]

	team := checkSessionSwitch(c, w, r, teamName)
	if team == nil {
		// Error already set by getTeam
		return
	}

	var channel *model.Channel
	if result := <-api.Srv.Store.Channel().CheckPermissionsToByName(c.Session.TeamId, name, c.Session.UserId); result.Err != nil {
		c.Err = result.Err
		return
	} else {
		channelId := result.Data.(string)
		if len(channelId) == 0 {
			if channel = autoJoinChannelName(c, w, r, name); channel == nil {
				http.Redirect(w, r, c.GetTeamURL()+"/channels/town-square", http.StatusFound)
				return
			}
		} else {
			if result := <-api.Srv.Store.Channel().Get(channelId); result.Err != nil {
				c.Err = result.Err
				return
			} else {
				channel = result.Data.(*model.Channel)
			}
		}
	}

	doLoadChannel(c, w, r, team, channel, "")
}

func autoJoinChannelName(c *api.Context, w http.ResponseWriter, r *http.Request, channelName string) *model.Channel {
	if strings.Index(channelName, "__") > 0 {
		// It's a direct message channel that doesn't exist yet so let's create it
		ids := strings.Split(channelName, "__")
		otherUserId := ""
		if ids[0] == c.Session.UserId {
			otherUserId = ids[1]
		} else {
			otherUserId = ids[0]
		}

		if sc, err := api.CreateDirectChannel(c, otherUserId); err != nil {
			api.Handle404(w, r)
			return nil
		} else {
			return sc
		}
	} else {
		// We will attempt to auto-join open channels
		return joinOpenChannel(c, w, r, api.Srv.Store.Channel().GetByName(c.Session.TeamId, channelName))
	}

	return nil
}

func autoJoinChannelId(c *api.Context, w http.ResponseWriter, r *http.Request, channelId string) *model.Channel {
	return joinOpenChannel(c, w, r, api.Srv.Store.Channel().Get(channelId))
}

func joinOpenChannel(c *api.Context, w http.ResponseWriter, r *http.Request, channel store.StoreChannel) *model.Channel {
	if cr := <-channel; cr.Err != nil {
		http.Redirect(w, r, c.GetTeamURL()+"/channels/town-square", http.StatusFound)
		return nil
	} else {
		channel := cr.Data.(*model.Channel)
		if channel.Type == model.CHANNEL_OPEN {
			api.JoinChannel(c, channel.Id, "")
			if c.Err != nil {
				return nil
			}
		} else {
			http.Redirect(w, r, c.GetTeamURL()+"/channels/town-square", http.StatusFound)
			return nil
		}
		return channel
	}
}

func checkSessionSwitch(c *api.Context, w http.ResponseWriter, r *http.Request, teamName string) *model.Team {
	var team *model.Team
	if result := <-api.Srv.Store.Team().GetByName(teamName); result.Err != nil {
		c.Err = result.Err
		return nil
	} else {
		team = result.Data.(*model.Team)
	}

	// We are logged into a different team.  Lets see if we have another
	// session in the cookie that will give us access.
	if c.Session.TeamId != team.Id {
		index, session := api.FindMultiSessionForTeamId(r, team.Id)
		if session == nil {
			// redirect to login
			http.Redirect(w, r, c.GetSiteURL()+"/"+team.Name+"/?redirect="+url.QueryEscape(r.URL.Path), http.StatusTemporaryRedirect)
		} else {
			c.Session = *session
			c.SessionTokenIndex = index
		}
	}

	return team
}

func doLoadChannel(c *api.Context, w http.ResponseWriter, r *http.Request, team *model.Team, channel *model.Channel, postid string) {
	userChan := api.Srv.Store.User().Get(c.Session.UserId)
	prefChan := api.Srv.Store.Preference().GetAll(c.Session.UserId)

	var user *model.User
	if ur := <-userChan; ur.Err != nil {
		c.Err = ur.Err
		c.RemoveSessionCookie(w, r)
		l4g.Error(utils.T("web.do_load_channel.error"), c.Session.UserId)
		return
	} else {
		user = ur.Data.(*model.User)
	}

	var preferences model.Preferences
	if result := <-prefChan; result.Err != nil {
		l4g.Error("Error in getting preferences for id=%v", c.Session.UserId)
	} else {
		preferences = result.Data.(model.Preferences)
	}

	page := NewHtmlTemplatePage("channel", "", c.Locale)
	page.Props["Title"] = channel.DisplayName + " - " + team.DisplayName + " " + page.ClientCfg["SiteName"]
	page.Props["TeamDisplayName"] = team.DisplayName
	page.Props["ChannelName"] = channel.Name
	page.Props["ChannelId"] = channel.Id
	page.Props["PostId"] = postid
	page.Team = team
	page.User = user
	page.Channel = channel
	page.Preferences = &preferences
	page.Render(c, w)
}

func verifyEmail(c *api.Context, w http.ResponseWriter, r *http.Request) {
	resend := r.URL.Query().Get("resend")
	resendSuccess := r.URL.Query().Get("resend_success")
	name := r.URL.Query().Get("teamname")
	email := r.URL.Query().Get("email")
	hashedId := r.URL.Query().Get("hid")
	userId := r.URL.Query().Get("uid")

	var team *model.Team
	if result := <-api.Srv.Store.Team().GetByName(name); result.Err != nil {
		c.Err = result.Err
		return
	} else {
		team = result.Data.(*model.Team)
	}

	if resend == "true" {
		if result := <-api.Srv.Store.User().GetByEmail(team.Id, email); result.Err != nil {
			c.Err = result.Err
			return
		} else {
			user := result.Data.(*model.User)

			if user.LastActivityAt > 0 {
				api.SendEmailChangeVerifyEmailAndForget(c, user.Id, user.Email, team.Name, team.DisplayName, c.GetSiteURL(), c.GetTeamURLFromTeam(team))
			} else {
				api.SendVerifyEmailAndForget(c, user.Id, user.Email, team.Name, team.DisplayName, c.GetSiteURL(), c.GetTeamURLFromTeam(team))
			}

			newAddress := strings.Replace(r.URL.String(), "&resend=true", "&resend_success=true", -1)
			http.Redirect(w, r, newAddress, http.StatusFound)
			return
		}
	}

	if len(userId) == 26 && len(hashedId) != 0 && model.ComparePassword(hashedId, userId) {
		if c.Err = (<-api.Srv.Store.User().VerifyEmail(userId)).Err; c.Err != nil {
			return
		} else {
			c.LogAudit("Email Verified")
			http.Redirect(w, r, api.GetProtocol(r)+"://"+r.Host+"/"+name+"/login?extra=verified&email="+url.QueryEscape(email), http.StatusTemporaryRedirect)
			return
		}
	}

	page := NewHtmlTemplatePage("verify", c.T("web.email_verified.title"), c.Locale)
	page.Props["TeamURL"] = c.GetTeamURLFromTeam(team)
	page.Props["UserEmail"] = email
	page.Props["ResendSuccess"] = resendSuccess
	page.Render(c, w)
}

func findTeam(c *api.Context, w http.ResponseWriter, r *http.Request) {
	page := NewHtmlTemplatePage("find_team", c.T("web.find_team.title"), c.Locale)
	page.Render(c, w)
}

func docs(c *api.Context, w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	doc := params["doc"]

	var user *model.User
	if len(c.Session.UserId) != 0 {
		userChan := api.Srv.Store.User().Get(c.Session.UserId)
		if userChan := <-userChan; userChan.Err == nil {
			user = userChan.Data.(*model.User)
		}
	}

	page := NewHtmlTemplatePage("docs", c.T("web.doc.title"), c.Locale)
	page.Props["Site"] = doc
	page.User = user
	page.Render(c, w)
}

func resetPassword(c *api.Context, w http.ResponseWriter, r *http.Request) {
	isResetLink := true
	hash := r.URL.Query().Get("h")
	data := r.URL.Query().Get("d")
	params := mux.Vars(r)
	teamName := params["team"]

	if len(hash) == 0 || len(data) == 0 {
		isResetLink = false
	} else {
		if !model.ComparePassword(hash, fmt.Sprintf("%v:%v", data, utils.Cfg.EmailSettings.PasswordResetSalt)) {
			c.Err = model.NewLocAppError("resetPassword", "web.reset_password.invalid_link.app_error", nil, "")
			return
		}

		props := model.MapFromJson(strings.NewReader(data))

		t, err := strconv.ParseInt(props["time"], 10, 64)
		if err != nil || model.GetMillis()-t > 1000*60*60 { // one hour
			c.Err = model.NewLocAppError("resetPassword", "web.reset_password.expired_link.app_error", nil, "")
			return
		}
	}

	teamDisplayName := "Developer/Beta"
	var team *model.Team
	if tResult := <-api.Srv.Store.Team().GetByName(teamName); tResult.Err != nil {
		c.Err = tResult.Err
		return
	} else {
		team = tResult.Data.(*model.Team)
	}

	if team != nil {
		teamDisplayName = team.DisplayName
	}

	page := NewHtmlTemplatePage("password_reset", "", c.Locale)
	page.Props["Title"] = "Reset Password " + page.ClientCfg["SiteName"]
	page.Props["TeamDisplayName"] = teamDisplayName
	page.Props["TeamName"] = teamName
	page.Props["Hash"] = hash
	page.Props["Data"] = data
	page.Props["TeamName"] = teamName
	page.Props["IsReset"] = strconv.FormatBool(isResetLink)
	page.Render(c, w)
}

func signupWithOAuth(c *api.Context, w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	service := params["service"]
	teamName := params["team"]

	if !utils.Cfg.TeamSettings.EnableUserCreation {
		c.Err = model.NewLocAppError("signupTeam", "web.singup_with_oauth.disabled.app_error", nil, "")
		c.Err.StatusCode = http.StatusNotImplemented
		return
	}

	if len(teamName) == 0 {
		c.Err = model.NewLocAppError("signupWithOAuth", "web.singup_with_oauth.invalid_team.app_error", nil, "team_name="+teamName)
		c.Err.StatusCode = http.StatusBadRequest
		return
	}

	hash := r.URL.Query().Get("h")

	var team *model.Team
	if result := <-api.Srv.Store.Team().GetByName(teamName); result.Err != nil {
		c.Err = result.Err
		return
	} else {
		team = result.Data.(*model.Team)
	}

	if api.IsVerifyHashRequired(nil, team, hash) {
		data := r.URL.Query().Get("d")
		props := model.MapFromJson(strings.NewReader(data))

		if !model.ComparePassword(hash, fmt.Sprintf("%v:%v", data, utils.Cfg.EmailSettings.InviteSalt)) {
			c.Err = model.NewLocAppError("signupWithOAuth", "web.singup_with_oauth.invalid_link.app_error", nil, "")
			return
		}

		t, err := strconv.ParseInt(props["time"], 10, 64)
		if err != nil || model.GetMillis()-t > 1000*60*60*48 { // 48 hours
			c.Err = model.NewLocAppError("signupWithOAuth", "web.singup_with_oauth.expired_link.app_error", nil, "")
			return
		}

		if team.Id != props["id"] {
			c.Err = model.NewLocAppError("signupWithOAuth", "web.singup_with_oauth.invalid_team.app_error", nil, data)
			return
		}
	}

	stateProps := map[string]string{}
	stateProps["action"] = model.OAUTH_ACTION_SIGNUP

	if authUrl, err := api.GetAuthorizationCode(c, service, teamName, stateProps, ""); err != nil {
		c.Err = err
		return
	} else {
		http.Redirect(w, r, authUrl, http.StatusFound)
	}
}

func completeOAuth(c *api.Context, w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	service := params["service"]

	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")

	uri := c.GetSiteURL() + "/signup/" + service + "/complete" // Remove /signup after a few releases (~1.8)

	if body, team, props, err := api.AuthorizeOAuthUser(service, code, state, uri); err != nil {
		c.Err = err
		return
	} else {
		action := props["action"]
		switch action {
		case model.OAUTH_ACTION_SIGNUP:
			api.CreateOAuthUser(c, w, r, service, body, team)
			if c.Err == nil {
				root(c, w, r)
			}
			break
		case model.OAUTH_ACTION_LOGIN:
			l4g.Debug(fmt.Sprintf("CODE === %v", code))
			l4g.Debug(fmt.Sprintf("BODY === %v", body))
			api.LoginByOAuth(c, w, r, service, body, team)
			if c.Err == nil {
				root(c, w, r)
			}
			break
		case model.OAUTH_ACTION_EMAIL_TO_SSO:
			api.CompleteSwitchWithOAuth(c, w, r, service, body, team, props["email"])
			if c.Err == nil {
				http.Redirect(w, r, api.GetProtocol(r)+"://"+r.Host+"/"+team.Name+"/login?extra=signin_change", http.StatusTemporaryRedirect)
			}
			break
		case model.OAUTH_ACTION_SSO_TO_EMAIL:
			api.LoginByOAuth(c, w, r, service, body, team)
			if c.Err == nil {
				http.Redirect(w, r, api.GetProtocol(r)+"://"+r.Host+"/"+team.Name+"/"+"/claim?email="+url.QueryEscape(props["email"]), http.StatusTemporaryRedirect)
			}
			break
		default:
			api.LoginByOAuth(c, w, r, service, body, team)
			if c.Err == nil {
				root(c, w, r)
			}
			break
		}
	}
}

func loginWithOAuth(c *api.Context, w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	service := params["service"]
	teamName := params["team"]
	loginHint := r.URL.Query().Get("login_hint")

	if len(teamName) == 0 {
		c.Err = model.NewLocAppError("loginWithOAuth", "web.login_with_oauth.invalid_team.app_error", nil, "team_name="+teamName)
		c.Err.StatusCode = http.StatusBadRequest
		return
	}

	// Make sure team exists
	if result := <-api.Srv.Store.Team().GetByName(teamName); result.Err != nil {
		c.Err = result.Err
		return
	}

	stateProps := map[string]string{}
	stateProps["action"] = model.OAUTH_ACTION_LOGIN

	if authUrl, err := api.GetAuthorizationCode(c, service, teamName, stateProps, loginHint); err != nil {
		c.Err = err
		return
	} else {
		http.Redirect(w, r, authUrl, http.StatusFound)
	}
}

func adminConsole(c *api.Context, w http.ResponseWriter, r *http.Request) {

	if !c.HasSystemAdminPermissions("adminConsole") {
		return
	}

	teamChan := api.Srv.Store.Team().Get(c.Session.TeamId)
	userChan := api.Srv.Store.User().Get(c.Session.UserId)

	var team *model.Team
	if tr := <-teamChan; tr.Err != nil {
		c.Err = tr.Err
		return
	} else {
		team = tr.Data.(*model.Team)

	}

	var user *model.User
	if ur := <-userChan; ur.Err != nil {
		c.Err = ur.Err
		return
	} else {
		user = ur.Data.(*model.User)
	}

	params := mux.Vars(r)
	activeTab := params["tab"]
	teamId := params["team"]

	page := NewHtmlTemplatePage("admin_console", c.T("web.admin_console.title"), c.Locale)
	page.User = user
	page.Team = team
	page.Props["ActiveTab"] = activeTab
	page.Props["TeamId"] = teamId
	page.Render(c, w)
}

func authorizeOAuth(c *api.Context, w http.ResponseWriter, r *http.Request) {
	if !utils.Cfg.ServiceSettings.EnableOAuthServiceProvider {
		c.Err = model.NewLocAppError("authorizeOAuth", "web.authorize_oauth.disabled.app_error", nil, "")
		c.Err.StatusCode = http.StatusNotImplemented
		return
	}

	if !CheckBrowserCompatability(c, r) {
		return
	}

	responseType := r.URL.Query().Get("response_type")
	clientId := r.URL.Query().Get("client_id")
	redirect := r.URL.Query().Get("redirect_uri")
	scope := r.URL.Query().Get("scope")
	state := r.URL.Query().Get("state")

	if len(responseType) == 0 || len(clientId) == 0 || len(redirect) == 0 {
		c.Err = model.NewLocAppError("authorizeOAuth", "web.authorize_oauth.missing.app_error", nil, "")
		return
	}

	var app *model.OAuthApp
	if result := <-api.Srv.Store.OAuth().GetApp(clientId); result.Err != nil {
		c.Err = result.Err
		return
	} else {
		app = result.Data.(*model.OAuthApp)
	}

	var team *model.Team
	if result := <-api.Srv.Store.Team().Get(c.Session.TeamId); result.Err != nil {
		c.Err = result.Err
		return
	} else {
		team = result.Data.(*model.Team)
	}

	page := NewHtmlTemplatePage("authorize", c.T("web.authorize_oauth.title"), c.Locale)
	page.Props["TeamName"] = team.Name
	page.Props["AppName"] = app.Name
	page.Props["ResponseType"] = responseType
	page.Props["ClientId"] = clientId
	page.Props["RedirectUri"] = redirect
	page.Props["Scope"] = scope
	page.Props["State"] = state
	page.Render(c, w)
}

func getAccessToken(c *api.Context, w http.ResponseWriter, r *http.Request) {
	if !utils.Cfg.ServiceSettings.EnableOAuthServiceProvider {
		c.Err = model.NewLocAppError("getAccessToken", "web.get_access_token.disabled.app_error", nil, "")
		c.Err.StatusCode = http.StatusNotImplemented
		return
	}

	c.LogAudit("attempt")

	r.ParseForm()

	grantType := r.FormValue("grant_type")
	if grantType != model.ACCESS_TOKEN_GRANT_TYPE {
		c.Err = model.NewLocAppError("getAccessToken", "web.get_access_token.bad_grant.app_error", nil, "")
		return
	}

	clientId := r.FormValue("client_id")
	if len(clientId) != 26 {
		c.Err = model.NewLocAppError("getAccessToken", "web.get_access_token.bad_client_id.app_error", nil, "")
		return
	}

	secret := r.FormValue("client_secret")
	if len(secret) == 0 {
		c.Err = model.NewLocAppError("getAccessToken", "web.get_access_token.bad_client_secret.app_error", nil, "")
		return
	}

	code := r.FormValue("code")
	if len(code) == 0 {
		c.Err = model.NewLocAppError("getAccessToken", "web.get_access_token.missing_code.app_error", nil, "")
		return
	}

	redirectUri := r.FormValue("redirect_uri")

	achan := api.Srv.Store.OAuth().GetApp(clientId)
	tchan := api.Srv.Store.OAuth().GetAccessDataByAuthCode(code)

	authData := api.GetAuthData(code)

	if authData == nil {
		c.LogAudit("fail - invalid auth code")
		c.Err = model.NewLocAppError("getAccessToken", "web.get_access_token.expired_code.app_error", nil, "")
		return
	}

	uchan := api.Srv.Store.User().Get(authData.UserId)

	if authData.IsExpired() {
		c.LogAudit("fail - auth code expired")
		c.Err = model.NewLocAppError("getAccessToken", "web.get_access_token.expired_code.app_error", nil, "")
		return
	}

	if authData.RedirectUri != redirectUri {
		c.LogAudit("fail - redirect uri provided did not match previous redirect uri")
		c.Err = model.NewLocAppError("getAccessToken", "web.get_access_token.redirect_uri.app_error", nil, "")
		return
	}

	if !model.ComparePassword(code, fmt.Sprintf("%v:%v:%v:%v", clientId, redirectUri, authData.CreateAt, authData.UserId)) {
		c.LogAudit("fail - auth code is invalid")
		c.Err = model.NewLocAppError("getAccessToken", "web.get_access_token.expired_code.app_error", nil, "")
		return
	}

	var app *model.OAuthApp
	if result := <-achan; result.Err != nil {
		c.Err = model.NewLocAppError("getAccessToken", "web.get_access_token.credentials.app_error", nil, "")
		return
	} else {
		app = result.Data.(*model.OAuthApp)
	}

	if !model.ComparePassword(app.ClientSecret, secret) {
		c.LogAudit("fail - invalid client credentials")
		c.Err = model.NewLocAppError("getAccessToken", "web.get_access_token.credentials.app_error", nil, "")
		return
	}

	callback := redirectUri
	if len(callback) == 0 {
		callback = app.CallbackUrls[0]
	}

	if result := <-tchan; result.Err != nil {
		c.Err = model.NewLocAppError("getAccessToken", "web.get_access_token.internal.app_error", nil, "")
		return
	} else if result.Data != nil {
		c.LogAudit("fail - auth code has been used previously")
		accessData := result.Data.(*model.AccessData)

		// Revoke access token, related auth code, and session from DB as well as from cache
		if err := api.RevokeAccessToken(accessData.Token); err != nil {
			l4g.Error(utils.T("web.get_access_token.revoking.error") + err.Message)
		}

		c.Err = model.NewLocAppError("getAccessToken", "web.get_access_token.exchanged.app_error", nil, "")
		return
	}

	var user *model.User
	if result := <-uchan; result.Err != nil {
		c.Err = model.NewLocAppError("getAccessToken", "web.get_access_token.internal_user.app_error", nil, "")
		return
	} else {
		user = result.Data.(*model.User)
	}

	session := &model.Session{UserId: user.Id, TeamId: user.TeamId, Roles: user.Roles, IsOAuth: true}

	if result := <-api.Srv.Store.Session().Save(session); result.Err != nil {
		c.Err = model.NewLocAppError("getAccessToken", "web.get_access_token.internal_session.app_error", nil, "")
		return
	} else {
		session = result.Data.(*model.Session)
		api.AddSessionToCache(session)
	}

	accessData := &model.AccessData{AuthCode: authData.Code, Token: session.Token, RedirectUri: callback}

	if result := <-api.Srv.Store.OAuth().SaveAccessData(accessData); result.Err != nil {
		l4g.Error(result.Err)
		c.Err = model.NewLocAppError("getAccessToken", "web.get_access_token.internal_saving.app_error", nil, "")
		return
	}

	accessRsp := &model.AccessResponse{AccessToken: session.Token, TokenType: model.ACCESS_TOKEN_TYPE, ExpiresIn: int32(*utils.Cfg.ServiceSettings.SessionLengthSSOInDays * 60 * 60 * 24)}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Pragma", "no-cache")

	c.LogAuditWithUserId(user.Id, "success")

	w.Write([]byte(accessRsp.ToJson()))
}

func incomingWebhook(c *api.Context, w http.ResponseWriter, r *http.Request) {
	if !utils.Cfg.ServiceSettings.EnableIncomingWebhooks {
		c.Err = model.NewLocAppError("incomingWebhook", "web.incoming_webhook.disabled.app_error", nil, "")
		c.Err.StatusCode = http.StatusNotImplemented
		return
	}

	params := mux.Vars(r)
	id := params["id"]

	hchan := api.Srv.Store.Webhook().GetIncoming(id)

	r.ParseForm()

	var parsedRequest *model.IncomingWebhookRequest
	contentType := r.Header.Get("Content-Type")
	if strings.Split(contentType, "; ")[0] == "application/json" {
		parsedRequest = model.IncomingWebhookRequestFromJson(r.Body)
	} else {
		parsedRequest = model.IncomingWebhookRequestFromJson(strings.NewReader(r.FormValue("payload")))
	}

	if parsedRequest == nil {
		c.Err = model.NewLocAppError("incomingWebhook", "web.incoming_webhook.parse.app_error", nil, "")
		return
	}

	text := parsedRequest.Text
	if len(text) == 0 && parsedRequest.Attachments == nil {
		c.Err = model.NewLocAppError("incomingWebhook", "web.incoming_webhook.text.app_error", nil, "")
		return
	}

	channelName := parsedRequest.ChannelName
	webhookType := parsedRequest.Type

	//attachments is in here for slack compatibility
	if parsedRequest.Attachments != nil {
		if len(parsedRequest.Props) == 0 {
			parsedRequest.Props = make(model.StringInterface)
		}
		parsedRequest.Props["attachments"] = parsedRequest.Attachments
		webhookType = model.POST_SLACK_ATTACHMENT
	}

	var hook *model.IncomingWebhook
	if result := <-hchan; result.Err != nil {
		c.Err = model.NewLocAppError("incomingWebhook", "web.incoming_webhook.invalid.app_error", nil, "err="+result.Err.Message)
		return
	} else {
		hook = result.Data.(*model.IncomingWebhook)
	}

	var channel *model.Channel
	var cchan store.StoreChannel

	if len(channelName) != 0 {
		if channelName[0] == '@' {
			if result := <-api.Srv.Store.User().GetByUsername(hook.TeamId, channelName[1:]); result.Err != nil {
				c.Err = model.NewLocAppError("incomingWebhook", "web.incoming_webhook.user.app_error", nil, "err="+result.Err.Message)
				return
			} else {
				channelName = model.GetDMNameFromIds(result.Data.(*model.User).Id, hook.UserId)
			}
		} else if channelName[0] == '#' {
			channelName = channelName[1:]
		}

		cchan = api.Srv.Store.Channel().GetByName(hook.TeamId, channelName)
	} else {
		cchan = api.Srv.Store.Channel().Get(hook.ChannelId)
	}

	overrideUsername := parsedRequest.Username
	overrideIconUrl := parsedRequest.IconURL

	if result := <-cchan; result.Err != nil {
		c.Err = model.NewLocAppError("incomingWebhook", "web.incoming_webhook.channel.app_error", nil, "err="+result.Err.Message)
		return
	} else {
		channel = result.Data.(*model.Channel)
	}

	pchan := api.Srv.Store.Channel().CheckPermissionsTo(hook.TeamId, channel.Id, hook.UserId)

	// create a mock session
	c.Session = model.Session{UserId: hook.UserId, TeamId: hook.TeamId, IsOAuth: false}

	if !c.HasPermissionsToChannel(pchan, "createIncomingHook") && channel.Type != model.CHANNEL_OPEN {
		c.Err = model.NewLocAppError("incomingWebhook", "web.incoming_webhook.permissions.app_error", nil, "")
		return
	}

	if _, err := api.CreateWebhookPost(c, channel.Id, text, overrideUsername, overrideIconUrl, parsedRequest.Props, webhookType); err != nil {
		c.Err = err
		return
	}

	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte("ok"))
}

func claimAccount(c *api.Context, w http.ResponseWriter, r *http.Request) {
	if !CheckBrowserCompatability(c, r) {
		return
	}

	params := mux.Vars(r)
	teamName := params["team"]
	email := r.URL.Query().Get("email")
	newType := r.URL.Query().Get("new_type")

	var team *model.Team
	if tResult := <-api.Srv.Store.Team().GetByName(teamName); tResult.Err != nil {
		l4g.Error(utils.T("web.claim_account.team.error"), teamName, tResult.Err.Message)
		http.Redirect(w, r, api.GetProtocol(r)+"://"+r.Host, http.StatusTemporaryRedirect)
		return
	} else {
		team = tResult.Data.(*model.Team)
	}

	authType := ""
	if len(email) != 0 {
		if uResult := <-api.Srv.Store.User().GetByEmail(team.Id, email); uResult.Err != nil {
			l4g.Error(utils.T("web.claim_account.user.error"), team.Id, email, uResult.Err.Message)
			http.Redirect(w, r, api.GetProtocol(r)+"://"+r.Host, http.StatusTemporaryRedirect)
			return
		} else {
			user := uResult.Data.(*model.User)
			authType = user.AuthService

			// if user is not logged in to their SSO account, ask them to log in
			if len(authType) != 0 && user.Id != c.Session.UserId {
				stateProps := map[string]string{}
				stateProps["action"] = model.OAUTH_ACTION_SSO_TO_EMAIL
				stateProps["email"] = email

				if authUrl, err := api.GetAuthorizationCode(c, authType, team.Name, stateProps, ""); err != nil {
					c.Err = err
					return
				} else {
					http.Redirect(w, r, authUrl, http.StatusFound)
				}
			}
		}
	}

	page := NewHtmlTemplatePage("claim_account", c.T("web.claim_account.title"), c.Locale)
	page.Props["Email"] = email
	page.Props["CurrentType"] = authType
	page.Props["NewType"] = newType
	page.Props["TeamDisplayName"] = team.DisplayName
	page.Props["TeamName"] = team.Name

	page.Render(c, w)
}
