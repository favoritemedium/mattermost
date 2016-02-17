// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

package utils

import (
	"net/http"
	"net/url"
)

const (
	DIAGNOSTIC_URL = "https://d7zmvsa9e04kk.cloudfront.net"

	PROP_DIAGNOSTIC_ID                = "id"
	PROP_DIAGNOSTIC_CATEGORY          = "c"
	VAL_DIAGNOSTIC_CATEGORY_DEFAULT   = "d"
	PROP_DIAGNOSTIC_BUILD             = "b"
	PROP_DIAGNOSTIC_ENTERPRISE_READY  = "be"
	PROP_DIAGNOSTIC_DATABASE          = "db"
	PROP_DIAGNOSTIC_OS                = "os"
	PROP_DIAGNOSTIC_USER_COUNT        = "uc"
	PROP_DIAGNOSTIC_ACTIVE_USER_COUNT = "auc"
	PROP_DIAGNOSTIC_UNIT_TESTS        = "ut"
)

func SendDiagnostic(values url.Values) {
	if *Cfg.ServiceSettings.EnableSecurityFixAlert {

		res, err := http.Get(DIAGNOSTIC_URL + "/i?" + values.Encode())
		if err != nil {
			return
		}

		res.Body.Close()
	}
}
