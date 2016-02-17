// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import keyMirror from 'keymirror';

export default {
    ActionTypes: keyMirror({
        RECIEVED_ERROR: null,

        CLICK_CHANNEL: null,
        CREATE_CHANNEL: null,
        LEAVE_CHANNEL: null,
        CREATE_POST: null,
        POST_DELETED: null,

        RECIEVED_CHANNELS: null,
        RECIEVED_CHANNEL: null,
        RECIEVED_MORE_CHANNELS: null,
        RECIEVED_CHANNEL_EXTRA_INFO: null,

        FOCUS_POST: null,
        RECIEVED_POSTS: null,
        RECIEVED_FOCUSED_POST: null,
        RECIEVED_POST: null,
        RECIEVED_EDIT_POST: null,
        RECIEVED_SEARCH: null,
        RECIEVED_SEARCH_TERM: null,
        RECIEVED_POST_SELECTED: null,
        RECIEVED_MENTION_DATA: null,
        RECIEVED_ADD_MENTION: null,

        RECIEVED_PROFILES: null,
        RECIEVED_ME: null,
        RECIEVED_SESSIONS: null,
        RECIEVED_AUDITS: null,
        RECIEVED_TEAMS: null,
        RECIEVED_STATUSES: null,
        RECIEVED_PREFERENCE: null,
        RECIEVED_PREFERENCES: null,
        RECIEVED_FILE_INFO: null,

        RECIEVED_MSG: null,

        RECIEVED_TEAM: null,

        RECIEVED_CONFIG: null,
        RECIEVED_LOGS: null,
        RECIEVED_ALL_TEAMS: null,

        SHOW_SEARCH: null,

        TOGGLE_IMPORT_THEME_MODAL: null,
        TOGGLE_INVITE_MEMBER_MODAL: null,
        TOGGLE_DELETE_POST_MODAL: null,
        TOGGLE_GET_TEAM_INVITE_LINK_MODAL: null,
        TOGGLE_REGISTER_APP_MODAL: null,

        SUGGESTION_PRETEXT_CHANGED: null,
        SUGGESTION_RECEIVED_SUGGESTIONS: null,
        SUGGESTION_CLEAR_SUGGESTIONS: null,
        SUGGESTION_COMPLETE_WORD: null,
        SUGGESTION_SELECT_NEXT: null,
        SUGGESTION_SELECT_PREVIOUS: null
    }),

    PayloadSources: keyMirror({
        SERVER_ACTION: null,
        VIEW_ACTION: null
    }),

    SocketEvents: {
        POSTED: 'posted',
        POST_EDITED: 'post_edited',
        POST_DELETED: 'post_deleted',
        CHANNEL_VIEWED: 'channel_viewed',
        NEW_USER: 'new_user',
        USER_ADDED: 'user_added',
        USER_REMOVED: 'user_removed',
        TYPING: 'typing',
        PREFERENCE_CHANGED: 'preference_changed'
    },

    //SPECIAL_MENTIONS: ['all', 'channel'],
    SPECIAL_MENTIONS: ['channel'],
    CHARACTER_LIMIT: 4000,
    IMAGE_TYPES: ['jpg', 'gif', 'bmp', 'png', 'jpeg'],
    AUDIO_TYPES: ['mp3', 'wav', 'wma', 'm4a', 'flac', 'aac'],
    VIDEO_TYPES: ['mp4', 'avi', 'webm', 'mkv', 'wmv', 'mpg', 'mov', 'flv'],
    PRESENTATION_TYPES: ['ppt', 'pptx'],
    SPREADSHEET_TYPES: ['xlsx', 'csv'],
    WORD_TYPES: ['doc', 'docx'],
    CODE_TYPES: ['css', 'html', 'js', 'php', 'rb'],
    PDF_TYPES: ['pdf'],
    PATCH_TYPES: ['patch'],
    ICON_FROM_TYPE: {
        audio: 'audio',
        video: 'video',
        spreadsheet: 'excel',
        presentation: 'ppt',
        pdf: 'pdf',
        code: 'code',
        word: 'word',
        patch: 'patch',
        other: 'generic'
    },
    MAX_DISPLAY_FILES: 5,
    MAX_UPLOAD_FILES: 5,
    MAX_FILE_SIZE: 50000000, // 50 MB
    THUMBNAIL_WIDTH: 128,
    THUMBNAIL_HEIGHT: 100,
    WEB_VIDEO_WIDTH: 640,
    WEB_VIDEO_HEIGHT: 480,
    MOBILE_VIDEO_WIDTH: 480,
    MOBILE_VIDEO_HEIGHT: 360,
    DEFAULT_CHANNEL: 'town-square',
    OFFTOPIC_CHANNEL: 'off-topic',
    GITLAB_SERVICE: 'gitlab',
    GOOGLE_SERVICE: 'google',
    EMAIL_SERVICE: 'email',
    SIGNIN_CHANGE: 'signin_change',
    SIGNIN_VERIFIED: 'verified',
    POST_CHUNK_SIZE: 60,
    MAX_POST_CHUNKS: 3,
    POST_FOCUS_CONTEXT_RADIUS: 10,
    POST_LOADING: 'loading',
    POST_FAILED: 'failed',
    POST_DELETED: 'deleted',
    POST_TYPE_JOIN_LEAVE: 'system_join_leave',
    SYSTEM_MESSAGE_PREFIX: 'system_',
    SYSTEM_MESSAGE_PROFILE_NAME: 'System',
    SYSTEM_MESSAGE_PROFILE_IMAGE: '/static/images/logo_compact.png',
    RESERVED_TEAM_NAMES: [
        'www',
        'web',
        'admin',
        'support',
        'notify',
        'test',
        'demo',
        'mail',
        'team',
        'channel',
        'internal',
        'localhost',
        'dockerhost',
        'stag',
        'post',
        'cluster',
        'api'
    ],
    RESERVED_USERNAMES: [
        'valet',
        'all',
        'channel'
    ],
    MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    MAX_DMS: 20,
    MAX_CHANNEL_POPOVER_COUNT: 100,
    DM_CHANNEL: 'D',
    OPEN_CHANNEL: 'O',
    PRIVATE_CHANNEL: 'P',
    INVITE_TEAM: 'I',
    OPEN_TEAM: 'O',
    MAX_POST_LEN: 4000,
    EMOJI_SIZE: 16,
    ONLINE_ICON_SVG: "<svg version='1.1'id='Layer_1' xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:svg='http://www.w3.org/2000/svg' xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd' xmlns:cc='http://creativecommons.org/ns#' inkscape:version='0.48.4 r9939' sodipodi:docname='TRASH_1_4.svg'xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='-243 245 12 12'style='enable-background:new -243 245 12 12;' xml:space='preserve'> <sodipodi:namedview  inkscape:cx='26.358185' inkscape:zoom='1.18' bordercolor='#666666' pagecolor='#ffffff' borderopacity='1' objecttolerance='10' inkscape:cy='139.7898' gridtolerance='10' guidetolerance='10' showgrid='false' showguides='true' id='namedview6' inkscape:pageopacity='0' inkscape:pageshadow='2' inkscape:guide-bbox='true' inkscape:window-width='1366' inkscape:current-layer='Layer_1' inkscape:window-height='705' inkscape:window-y='-8' inkscape:window-maximized='1' inkscape:window-x='-8'> <sodipodi:guide  position='50.036793,85.991376' orientation='1,0' id='guide2986'></sodipodi:guide> <sodipodi:guide  position='58.426196,66.216355' orientation='0,1' id='guide3047'></sodipodi:guide> </sodipodi:namedview> <g> <path class='online--icon' d='M-236,250.5C-236,250.5-236,250.5-236,250.5C-236,250.5-236,250.5-236,250.5C-236,250.5-236,250.5-236,250.5z'/> <ellipse class='online--icon' cx='-238.5' cy='248' rx='2.5' ry='2.5'/> </g> <path class='online--icon' d='M-238.9,253.8c0-0.4,0.1-0.9,0.2-1.3c-2.2-0.2-2.2-2-2.2-2s-1,0.1-1.2,0.5c-0.4,0.6-0.6,1.7-0.7,2.5c0,0.1-0.1,0.5,0,0.6 c0.2,1.3,2.2,2.3,4.4,2.4c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0C-238.7,255.7-238.9,254.8-238.9,253.8z'/> <g> <g> <path class='online--icon' d='M-232.3,250.1l1.3,1.3c0,0,0,0.1,0,0.1l-4.1,4.1c0,0,0,0-0.1,0c0,0,0,0,0,0l-2.7-2.7c0,0,0-0.1,0-0.1l1.2-1.2 c0,0,0.1,0,0.1,0l1.4,1.4l2.9-2.9C-232.4,250.1-232.3,250.1-232.3,250.1z'/> </g> </g> </svg>",
    AWAY_ICON_SVG: "<svg version='1.1'id='Layer_1' xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:svg='http://www.w3.org/2000/svg' xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd' xmlns:cc='http://creativecommons.org/ns#' inkscape:version='0.48.4 r9939' sodipodi:docname='TRASH_1_4.svg'xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='-299 391 12 12'style='enable-background:new -299 391 12 12;' xml:space='preserve'> <sodipodi:namedview  inkscape:cx='26.358185' inkscape:zoom='1.18' bordercolor='#666666' pagecolor='#ffffff' borderopacity='1' objecttolerance='10' inkscape:cy='139.7898' gridtolerance='10' guidetolerance='10' showgrid='false' showguides='true' id='namedview6' inkscape:pageopacity='0' inkscape:pageshadow='2' inkscape:guide-bbox='true' inkscape:window-width='1366' inkscape:current-layer='Layer_1' inkscape:window-height='705' inkscape:window-y='-8' inkscape:window-maximized='1' inkscape:window-x='-8'> <sodipodi:guide  position='50.036793,85.991376' orientation='1,0' id='guide2986'></sodipodi:guide> <sodipodi:guide  position='58.426196,66.216355' orientation='0,1' id='guide3047'></sodipodi:guide> </sodipodi:namedview> <g> <ellipse class='away--icon' cx='-294.6' cy='394' rx='2.5' ry='2.5'/> <path class='away--icon' d='M-293.8,399.4c0-0.4,0.1-0.7,0.2-1c-0.3,0.1-0.6,0.2-1,0.2c-2.5,0-2.5-2-2.5-2s-1,0.1-1.2,0.5c-0.4,0.6-0.6,1.7-0.7,2.5 c0,0.1-0.1,0.5,0,0.6c0.2,1.3,2.2,2.3,4.4,2.4c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0c0.7,0,1.4-0.1,2-0.3 C-293.3,401.5-293.8,400.5-293.8,399.4z'/> </g> <path class='away--icon' d='M-287,400c0,0.1-0.1,0.1-0.1,0.1l-4.9,0c-0.1,0-0.1-0.1-0.1-0.1v-1.6c0-0.1,0.1-0.1,0.1-0.1l4.9,0c0.1,0,0.1,0.1,0.1,0.1 V400z'/> </svg>",
    OFFLINE_ICON_SVG: "<svg version='1.1'id='Layer_1' xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:svg='http://www.w3.org/2000/svg' xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd' xmlns:cc='http://creativecommons.org/ns#' inkscape:version='0.48.4 r9939' sodipodi:docname='TRASH_1_4.svg'xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='-299 391 12 12'style='enable-background:new -299 391 12 12;' xml:space='preserve'> <sodipodi:namedview  inkscape:cx='26.358185' inkscape:zoom='1.18' bordercolor='#666666' pagecolor='#ffffff' borderopacity='1' objecttolerance='10' inkscape:cy='139.7898' gridtolerance='10' guidetolerance='10' showgrid='false' showguides='true' id='namedview6' inkscape:pageopacity='0' inkscape:pageshadow='2' inkscape:guide-bbox='true' inkscape:window-width='1366' inkscape:current-layer='Layer_1' inkscape:window-height='705' inkscape:window-y='-8' inkscape:window-maximized='1' inkscape:window-x='-8'> <sodipodi:guide  position='50.036793,85.991376' orientation='1,0' id='guide2986'></sodipodi:guide> <sodipodi:guide  position='58.426196,66.216355' orientation='0,1' id='guide3047'></sodipodi:guide> </sodipodi:namedview> <g> <g> <ellipse class='offline--icon' cx='-294.5' cy='394' rx='2.5' ry='2.5'/> <path class='offline--icon' d='M-294.3,399.7c0-0.4,0.1-0.8,0.2-1.2c-0.1,0-0.2,0-0.4,0c-2.5,0-2.5-2-2.5-2s-1,0.1-1.2,0.5c-0.4,0.6-0.6,1.7-0.7,2.5 c0,0.1-0.1,0.5,0,0.6c0.2,1.3,2.2,2.3,4.4,2.4h0.1h0.1c0.3,0,0.7,0,1-0.1C-293.9,401.6-294.3,400.7-294.3,399.7z'/> </g> </g> <g> <path class='offline--icon' d='M-288.9,399.4l1.8-1.8c0.1-0.1,0.1-0.3,0-0.3l-0.7-0.7c-0.1-0.1-0.3-0.1-0.3,0l-1.8,1.8l-1.8-1.8c-0.1-0.1-0.3-0.1-0.3,0 l-0.7,0.7c-0.1,0.1-0.1,0.3,0,0.3l1.8,1.8l-1.8,1.8c-0.1,0.1-0.1,0.3,0,0.3l0.7,0.7c0.1,0.1,0.3,0.1,0.3,0l1.8-1.8l1.8,1.8 c0.1,0.1,0.3,0.1,0.3,0l0.7-0.7c0.1-0.1,0.1-0.3,0-0.3L-288.9,399.4z'/> </g> </svg>",
    MENU_ICON: "<svg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px'width='4px' height='16px' viewBox='0 0 8 32' enable-background='new 0 0 8 32' xml:space='preserve'> <g> <circle cx='4' cy='4.062' r='4'/> <circle cx='4' cy='16' r='4'/> <circle cx='4' cy='28' r='4'/> </g> </svg>",
    COMMENT_ICON: "<svg version='1.1' id='Layer_2' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px'width='15px' height='15px' viewBox='1 1.5 15 15' enable-background='new 1 1.5 15 15' xml:space='preserve'> <g> <g> <path fill='#211B1B' d='M14,1.5H3c-1.104,0-2,0.896-2,2v8c0,1.104,0.896,2,2,2h1.628l1.884,3l1.866-3H14c1.104,0,2-0.896,2-2v-8 C16,2.396,15.104,1.5,14,1.5z M15,11.5c0,0.553-0.447,1-1,1H8l-1.493,2l-1.504-1.991L5,12.5H3c-0.552,0-1-0.447-1-1v-8 c0-0.552,0.448-1,1-1h11c0.553,0,1,0.448,1,1V11.5z'/> </g> </g> </svg>",
    REPLY_ICON: "<svg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px'viewBox='-158 242 18 18' style='enable-background:new -158 242 18 18;' xml:space='preserve'> <path d='M-142.2,252.6c-2-3-4.8-4.7-8.3-4.8v-3.3c0-0.2-0.1-0.3-0.2-0.3s-0.3,0-0.4,0.1l-6.9,6.2c-0.1,0.1-0.1,0.2-0.1,0.3 c0,0.1,0,0.2,0.1,0.3l6.9,6.4c0.1,0.1,0.3,0.1,0.4,0.1c0.1-0.1,0.2-0.2,0.2-0.4v-3.8c4.2,0,7.4,0.4,9.6,4.4c0.1,0.1,0.2,0.2,0.3,0.2 c0,0,0.1,0,0.1,0c0.2-0.1,0.3-0.3,0.2-0.4C-140.2,257.3-140.6,255-142.2,252.6z M-150.8,252.5c-0.2,0-0.4,0.2-0.4,0.4v3.3l-6-5.5 l6-5.3v2.8c0,0.2,0.2,0.4,0.4,0.4c3.3,0,6,1.5,8,4.5c0.5,0.8,0.9,1.6,1.2,2.3C-144,252.8-147.1,252.5-150.8,252.5z'/> </svg>",
    UPDATE_TYPING_MS: 5000,
    THEMES: {
        default: {
            type: 'Organization',
            sidebarBg: '#2071a7',
            sidebarText: '#fff',
            sidebarUnreadText: '#fff',
            sidebarTextHoverBg: '#136197',
            sidebarTextActiveBorder: '#7AB0D6',
            sidebarTextActiveColor: '#FFFFFF',
            sidebarHeaderBg: '#2f81b7',
            sidebarHeaderTextColor: '#FFFFFF',
            onlineIndicator: '#7DBE00',
            awayIndicator: '#DCBD4E',
            mentionBj: '#136197',
            mentionColor: '#bfcde8',
            centerChannelBg: '#f2f4f8',
            centerChannelColor: '#333333',
            newMessageSeparator: '#FF8800',
            linkColor: '#2f81b7',
            buttonBg: '#1dacfc',
            buttonColor: '#FFFFFF',
            mentionHighlightBg: '#fff2bb',
            mentionHighlightLink: '#2f81b7',
            codeTheme: 'github'
        },
        mattermost: {
            type: 'Mattermost',
            sidebarBg: '#fafafa',
            sidebarText: '#333333',
            sidebarUnreadText: '#333333',
            sidebarTextHoverBg: '#e6f2fa',
            sidebarTextActiveBorder: '#378FD2',
            sidebarTextActiveColor: '#111111',
            sidebarHeaderBg: '#2389d7',
            sidebarHeaderTextColor: '#ffffff',
            onlineIndicator: '#7DBE00',
            awayIndicator: '#DCBD4E',
            mentionBj: '#2389d7',
            mentionColor: '#ffffff',
            centerChannelBg: '#ffffff',
            centerChannelColor: '#333333',
            newMessageSeparator: '#FF8800',
            linkColor: '#2389d7',
            buttonBg: '#2389d7',
            buttonColor: '#FFFFFF',
            mentionHighlightBg: '#fff2bb',
            mentionHighlightLink: '#2f81b7',
            codeTheme: 'github'
        },
        mattermostDark: {
            type: 'Mattermost Dark',
            sidebarBg: '#1B2C3E',
            sidebarText: '#fff',
            sidebarUnreadText: '#fff',
            sidebarTextHoverBg: '#4A5664',
            sidebarTextActiveBorder: '#39769C',
            sidebarTextActiveColor: '#FFFFFF',
            sidebarHeaderBg: '#1B2C3E',
            sidebarHeaderTextColor: '#FFFFFF',
            onlineIndicator: '#55C5B2',
            awayIndicator: '#A9A14C',
            mentionBj: '#B74A4A',
            mentionColor: '#FFFFFF',
            centerChannelBg: '#2F3E4E',
            centerChannelColor: '#DDDDDD',
            newMessageSeparator: '#5de5da',
            linkColor: '#A4FFEB',
            buttonBg: '#4CBBA4',
            buttonColor: '#FFFFFF',
            mentionHighlightBg: '#984063',
            mentionHighlightLink: '#A4FFEB',
            codeTheme: 'solarized_dark'
        },
        windows10: {
            type: 'Windows Dark',
            sidebarBg: '#171717',
            sidebarText: '#fff',
            sidebarUnreadText: '#fff',
            sidebarTextHoverBg: '#302e30',
            sidebarTextActiveBorder: '#196CAF',
            sidebarTextActiveColor: '#FFFFFF',
            sidebarHeaderBg: '#1f1f1f',
            sidebarHeaderTextColor: '#FFFFFF',
            onlineIndicator: '#0177e7',
            awayIndicator: '#A9A14C',
            mentionBj: '#0177e7',
            mentionColor: '#FFFFFF',
            centerChannelBg: '#1F1F1F',
            centerChannelColor: '#DDDDDD',
            newMessageSeparator: '#CC992D',
            linkColor: '#0D93FF',
            buttonBg: '#0177e7',
            buttonColor: '#FFFFFF',
            mentionHighlightBg: '#784098',
            mentionHighlightLink: '#A4FFEB',
            codeTheme: 'monokai'
        }
    },
    THEME_ELEMENTS: [
        {
            id: 'sidebarBg',
            uiName: 'Sidebar BG'
        },
        {
            id: 'sidebarText',
            uiName: 'Sidebar Text'
        },
        {
            id: 'sidebarHeaderBg',
            uiName: 'Sidebar Header BG'
        },
        {
            id: 'sidebarHeaderTextColor',
            uiName: 'Sidebar Header Text'
        },
        {
            id: 'sidebarUnreadText',
            uiName: 'Sidebar Unread Text'
        },
        {
            id: 'sidebarTextHoverBg',
            uiName: 'Sidebar Text Hover BG'
        },
        {
            id: 'sidebarTextActiveBorder',
            uiName: 'Sidebar Text Active Border'
        },
        {
            id: 'sidebarTextActiveColor',
            uiName: 'Sidebar Text Active Color'
        },
        {
            id: 'onlineIndicator',
            uiName: 'Online Indicator'
        },
        {
            id: 'awayIndicator',
            uiName: 'Away Indicator'
        },
        {
            id: 'mentionBj',
            uiName: 'Mention Jewel BG'
        },
        {
            id: 'mentionColor',
            uiName: 'Mention Jewel Text'
        },
        {
            id: 'centerChannelBg',
            uiName: 'Center Channel BG'
        },
        {
            id: 'centerChannelColor',
            uiName: 'Center Channel Text'
        },
        {
            id: 'newMessageSeparator',
            uiName: 'New Message Separator'
        },
        {
            id: 'linkColor',
            uiName: 'Link Color'
        },
        {
            id: 'buttonBg',
            uiName: 'Button BG'
        },
        {
            id: 'buttonColor',
            uiName: 'Button Text'
        },
        {
            id: 'mentionHighlightBg',
            uiName: 'Mention Highlight BG'
        },
        {
            id: 'mentionHighlightLink',
            uiName: 'Mention Highlight Link'
        },
        {
            id: 'codeTheme',
            uiName: 'Code Theme',
            themes: [
                {
                    id: 'solarized_dark',
                    uiName: 'Solarized Dark'
                },
                {
                    id: 'solarized_light',
                    uiName: 'Solarized Light'
                },
                {
                    id: 'github',
                    uiName: 'GitHub'
                },
                {
                    id: 'monokai',
                    uiName: 'Monokai'
                }
            ]
        }
    ],
    DEFAULT_CODE_THEME: 'github',
    FONTS: {
        'Droid Serif': 'font--droid_serif',
        'Roboto Slab': 'font--roboto_slab',
        Lora: 'font--lora',
        Arvo: 'font--arvo',
        'Open Sans': 'font--open_sans',
        Roboto: 'font--roboto',
        'PT Sans': 'font--pt_sans',
        Lato: 'font--lato',
        'Source Sans Pro': 'font--source_sans_pro',
        'Exo 2': 'font--exo_2',
        Ubuntu: 'font--ubuntu'
    },
    DEFAULT_FONT: 'Open Sans',
    Preferences: {
        CATEGORY_DIRECT_CHANNEL_SHOW: 'direct_channel_show',
        CATEGORY_DISPLAY_SETTINGS: 'display_settings',
        CATEGORY_ADVANCED_SETTINGS: 'advanced_settings',
        TUTORIAL_STEP: 'tutorial_step'
    },
    TutorialSteps: {
        INTRO_SCREENS: 0,
        POST_POPOVER: 1,
        CHANNEL_POPOVER: 2,
        MENU_POPOVER: 3
    },
    KeyCodes: {
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        BACKSPACE: 8,
        ENTER: 13,
        ESCAPE: 27,
        SPACE: 32,
        TAB: 9
    },
    HighlightedLanguages: {
        diff: 'Diff',
        apache: 'Apache',
        makefile: 'Makefile',
        http: 'HTTP',
        json: 'JSON',
        markdown: 'Markdown',
        javascript: 'JavaScript',
        css: 'CSS',
        nginx: 'nginx',
        objectivec: 'Objective-C',
        python: 'Python',
        xml: 'XML',
        perl: 'Perl',
        bash: 'Bash',
        php: 'PHP',
        coffeescript: 'CoffeeScript',
        cs: 'C#',
        cpp: 'C++',
        sql: 'SQL',
        go: 'Go',
        ruby: 'Ruby',
        java: 'Java',
        ini: 'ini'
    },
    PostsViewJumpTypes: {
        BOTTOM: 1,
        POST: 2,
        SIDEBAR_OPEN: 3
    },
    NotificationPrefs: {
        MENTION: 'mention'
    },
    FeatureTogglePrefix: 'feature_enabled_',
    PRE_RELEASE_FEATURES: {
        MARKDOWN_PREVIEW: {
            label: 'markdown_preview', // github issue: https://github.com/mattermost/platform/pull/1389
            description: 'Show markdown preview option in message input box'
        },
        EMBED_PREVIEW: {
            label: 'embed_preview',
            description: 'Show preview snippet of links below message'
        },
        LOC_PREVIEW: {
            label: 'loc_preview',
            description: 'Show user language in display settings'
        }
    },
    OVERLAY_TIME_DELAY: 400,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 15,
    MIN_PASSWORD_LENGTH: 5,
    MAX_PASSWORD_LENGTH: 50
};
