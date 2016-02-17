// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import * as Utils from './utils.jsx';
import ChannelInviteModal from '../components/channel_invite_modal.jsx';
import EditChannelHeaderModal from '../components/edit_channel_header_modal.jsx';
import ToggleModalButton from '../components/toggle_modal_button.jsx';
import UserProfile from '../components/user_profile.jsx';
import ChannelStore from '../stores/channel_store.jsx';
import Constants from '../utils/constants.jsx';
import TeamStore from '../stores/team_store.jsx';
import * as EventHelpers from '../dispatcher/event_helpers.jsx';

export function createChannelIntroMessage(channel) {
    if (channel.type === 'D') {
        return createDMIntroMessage(channel);
    } else if (ChannelStore.isDefault(channel)) {
        return createDefaultIntroMessage(channel);
    } else if (channel.name === Constants.OFFTOPIC_CHANNEL) {
        return createOffTopicIntroMessage(channel);
    } else if (channel.type === 'O' || channel.type === 'P') {
        return createStandardIntroMessage(channel);
    }
}

export function createDMIntroMessage(channel) {
    var teammate = Utils.getDirectTeammate(channel.id);

    if (teammate) {
        var teammateName = teammate.username;
        if (teammate.nickname.length > 0) {
            teammateName = teammate.nickname;
        }

        return (
            <div className='channel-intro'>
                <div className='post-profile-img__container channel-intro-img'>
                    <img
                        className='post-profile-img'
                        src={'/api/v1/users/' + teammate.id + '/image?time=' + teammate.update_at + '&' + Utils.getSessionIndex()}
                        height='50'
                        width='50'
                    />
                </div>
                <div className='channel-intro-profile'>
                    <strong>
                        <UserProfile userId={teammate.id} />
                    </strong>
                </div>
                <p className='channel-intro-text'>
                    {'This is the start of your direct message history with ' + teammateName + '.'}<br/>
                    {'Direct messages and files shared here are not shown to people outside this area.'}
                </p>
                {createSetHeaderButton(channel)}
            </div>
        );
    }

    return (
        <div className='channel-intro'>
            <p className='channel-intro-text'>{'This is the start of your direct message history with this teammate. Direct messages and files shared here are not shown to people outside this area.'}</p>
        </div>
    );
}

export function createOffTopicIntroMessage(channel) {
    return (
        <div className='channel-intro'>
            <h4 className='channel-intro__title'>{'Beginning of ' + channel.display_name}</h4>
            <p className='channel-intro__content'>
                {'This is the start of ' + channel.display_name + ', a channel for non-work-related conversations.'}
                <br/>
            </p>
            {createSetHeaderButton(channel)}
            {createInviteChannelMemberButton(channel, 'channel')}
        </div>
    );
}

export function createDefaultIntroMessage(channel) {
    const team = TeamStore.getCurrent();
    let inviteModalLink;
    if (team.type === Constants.INVITE_TEAM) {
        inviteModalLink = (
            <a
                className='intro-links'
                href='#'
                onClick={EventHelpers.showInviteMemberModal}
            >
                <i className='fa fa-user-plus'></i>{'Invite others to this team'}
            </a>
        );
    } else {
        inviteModalLink = (
            <a
                className='intro-links'
                href='#'
                onClick={EventHelpers.showGetTeamInviteLinkModal}
            >
                <i className='fa fa-user-plus'></i>{'Invite others to this team'}
            </a>
        );
    }

    return (
        <div className='channel-intro'>
            <h4 className='channel-intro__title'>{'Beginning of ' + channel.display_name}</h4>
            <p className='channel-intro__content'>
                <strong>{'Welcome to ' + channel.display_name + '!'}</strong>
                <br/><br/>
                {'This is the first channel teammates see when they sign up - use it for posting updates everyone needs to know.'}
            </p>
            {inviteModalLink}
            {createSetHeaderButton(channel)}
            <br/>
        </div>
    );
}

export function createStandardIntroMessage(channel) {
    var uiName = channel.display_name;
    var creatorName = '';

    var uiType;
    var memberMessage;
    if (channel.type === 'P') {
        uiType = 'private group';
        memberMessage = ' Only invited members can see this private group.';
    } else {
        uiType = 'channel';
        memberMessage = ' Any member can join and read this channel.';
    }

    var createMessage;
    if (creatorName === '') {
        createMessage = 'This is the start of the ' + uiName + ' ' + uiType + ', created on ' + Utils.displayDate(channel.create_at) + '.';
    } else {
        createMessage = (
            <span>
                {'This is the start of the '}
                <strong>{uiName}</strong>
                {' '}
                {uiType}{', created by '}
                <strong>{creatorName}</strong>
                {' on '}
                <strong>{Utils.displayDate(channel.create_at)}</strong>
            </span>
        );
    }

    return (
        <div className='channel-intro'>
            <h4 className='channel-intro__title'>{'Beginning of ' + uiName}</h4>
            <p className='channel-intro__content'>
                {createMessage}
                {memberMessage}
                <br/>
            </p>
            {createSetHeaderButton(channel)}
            {createInviteChannelMemberButton(channel, uiType)}
        </div>
    );
}

function createInviteChannelMemberButton(channel, uiType) {
    return (
        <ToggleModalButton
            className='intro-links'
            dialogType={ChannelInviteModal}
            dialogProps={{channel}}
        >
            <i className='fa fa-user-plus'></i>{'Invite others to this ' + uiType}
        </ToggleModalButton>
    );
}

function createSetHeaderButton(channel) {
    return (
        <ToggleModalButton
            className='intro-links'
            dialogType={EditChannelHeaderModal}
            dialogProps={{channel}}
        >
            <i className='fa fa-pencil'></i>{'Set a header'}
        </ToggleModalButton>
    );
}
