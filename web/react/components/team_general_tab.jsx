// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import SettingItemMin from './setting_item_min.jsx';
import SettingItemMax from './setting_item_max.jsx';

import * as Client from '../utils/client.jsx';
import * as Utils from '../utils/utils.jsx';
import TeamStore from '../stores/team_store.jsx';

export default class GeneralTab extends React.Component {
    constructor(props) {
        super(props);

        this.updateSection = this.updateSection.bind(this);
        this.handleNameSubmit = this.handleNameSubmit.bind(this);
        this.handleInviteIdSubmit = this.handleInviteIdSubmit.bind(this);
        this.handleOpenInviteSubmit = this.handleOpenInviteSubmit.bind(this);
        this.handleTeamListingSubmit = this.handleTeamListingSubmit.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.onUpdateNameSection = this.onUpdateNameSection.bind(this);
        this.updateName = this.updateName.bind(this);
        this.onUpdateInviteIdSection = this.onUpdateInviteIdSection.bind(this);
        this.updateInviteId = this.updateInviteId.bind(this);
        this.onUpdateOpenInviteSection = this.onUpdateOpenInviteSection.bind(this);
        this.handleOpenInviteRadio = this.handleOpenInviteRadio.bind(this);
        this.onUpdateTeamListingSection = this.onUpdateTeamListingSection.bind(this);
        this.handleTeamListingRadio = this.handleTeamListingRadio.bind(this);
        this.handleGenerateInviteId = this.handleGenerateInviteId.bind(this);

        this.state = this.setupInitialState(props);
    }

    updateSection(section) {
        this.setState(this.setupInitialState(this.props));
        this.props.updateSection(section);
    }

    setupInitialState(props) {
        const team = props.team;

        return {
            name: team.display_name,
            invite_id: team.invite_id,
            allow_open_invite: team.allow_open_invite,
            allow_team_listing: team.allow_team_listing,
            serverError: '',
            clientError: ''
        };
    }

    handleGenerateInviteId(e) {
        e.preventDefault();

        var newId = '';
        for (var i = 0; i < 32; i++) {
            newId += Math.floor(Math.random() * 16).toString(16);
        }

        this.setState({invite_id: newId});
    }

    handleOpenInviteRadio(openInvite) {
        this.setState({allow_open_invite: openInvite});
    }

    handleTeamListingRadio(listing) {
        if (global.window.mm_config.EnableTeamListing !== 'true' && listing) {
            this.setState({clientError: 'Team Directory has been disabled.  Please ask a System Admin to enable the Team Directory in the System Console team settings.'});
        } else {
            this.setState({allow_team_listing: listing});
        }
    }

    handleOpenInviteSubmit(e) {
        e.preventDefault();

        var state = {serverError: '', clientError: ''};

        var data = this.props.team;
        data.allow_open_invite = this.state.allow_open_invite;
        Client.updateTeam(data,
            (team) => {
                TeamStore.saveTeam(team);
                TeamStore.emitChange();
                this.updateSection('');
            },
            (err) => {
                state.serverError = err.message;
                this.setState(state);
            }
        );
    }

    handleTeamListingSubmit(e) {
        e.preventDefault();

        var state = {serverError: '', clientError: ''};

        var data = this.props.team;
        data.allow_team_listing = this.state.allow_team_listing;
        Client.updateTeam(data,
            (team) => {
                TeamStore.saveTeam(team);
                TeamStore.emitChange();
                this.updateSection('');
            },
            (err) => {
                state.serverError = err.message;
                this.setState(state);
            }
        );
    }

    handleNameSubmit(e) {
        e.preventDefault();

        var state = {serverError: '', clientError: ''};
        let valid = true;

        const name = this.state.name.trim();
        if (!name) {
            state.clientError = 'This field is required';
            valid = false;
        } else if (name === this.props.team.display_name) {
            state.clientError = 'Please choose a new name for your team';
            valid = false;
        } else {
            state.clientError = '';
        }

        this.setState(state);

        if (!valid) {
            return;
        }

        var data = this.props.team;
        data.display_name = this.state.name;
        Client.updateTeam(data,
            (team) => {
                TeamStore.saveTeam(team);
                TeamStore.emitChange();
                this.updateSection('');
            },
            (err) => {
                state.serverError = err.message;
                this.setState(state);
            }
        );
    }

    handleInviteIdSubmit(e) {
        e.preventDefault();

        var state = {serverError: '', clientError: ''};
        let valid = true;

        const inviteId = this.state.invite_id.trim();
        if (inviteId) {
            state.clientError = '';
        } else {
            state.clientError = 'This field is required';
            valid = false;
        }

        this.setState(state);

        if (!valid) {
            return;
        }

        var data = this.props.team;
        data.invite_id = this.state.invite_id;
        Client.updateTeam(data,
            (team) => {
                TeamStore.saveTeam(team);
                TeamStore.emitChange();
                this.updateSection('');
            },
            (err) => {
                state.serverError = err.message;
                this.setState(state);
            }
        );
    }

    componentWillReceiveProps(newProps) {
        if (newProps.team && newProps.teamDisplayName) {
            this.setState({name: newProps.teamDisplayName});
        }
    }

    handleClose() {
        this.updateSection('');
    }

    componentDidMount() {
        $('#team_settings').on('hidden.bs.modal', this.handleClose);
    }

    componentWillUnmount() {
        $('#team_settings').off('hidden.bs.modal', this.handleClose);
    }

    onUpdateNameSection(e) {
        e.preventDefault();
        if (this.props.activeSection === 'name') {
            this.updateSection('');
        } else {
            this.updateSection('name');
        }
    }

    onUpdateInviteIdSection(e) {
        e.preventDefault();
        if (this.props.activeSection === 'invite_id') {
            this.updateSection('');
        } else {
            this.updateSection('invite_id');
        }
    }

    onUpdateOpenInviteSection(e) {
        e.preventDefault();
        if (this.props.activeSection === 'open_invite') {
            this.updateSection('');
        } else {
            this.updateSection('open_invite');
        }
    }

    onUpdateTeamListingSection(e) {
        e.preventDefault();
        if (this.props.activeSection === 'team_listing') {
            this.updateSection('');
        } else {
            this.updateSection('team_listing');
        }
    }

    updateName(e) {
        e.preventDefault();
        this.setState({name: e.target.value});
    }

    updateInviteId(e) {
        e.preventDefault();
        this.setState({invite_id: e.target.value});
    }

    render() {
        let clientError = null;
        let serverError = null;
        if (this.state.clientError) {
            clientError = this.state.clientError;
        }
        if (this.state.serverError) {
            serverError = this.state.serverError;
        }

        const enableTeamListing = global.window.mm_config.EnableTeamListing === 'true';

        let teamListingSection;
        if (this.props.activeSection === 'team_listing') {
            const inputs = [];
            let submitHandle = null;

            if (enableTeamListing) {
                submitHandle = this.handleTeamListingSubmit;

                inputs.push(
                    <div key='userTeamListingOptions'>
                        <div className='radio'>
                            <label>
                                <input
                                    name='userTeamListingOptions'
                                    type='radio'
                                    defaultChecked={this.state.allow_team_listing}
                                    onChange={this.handleTeamListingRadio.bind(this, true)}
                                />
                                {'Yes'}
                            </label>
                            <br/>
                        </div>
                        <div className='radio'>
                            <label>
                                <input
                                    ref='teamListingRadioNo'
                                    name='userTeamListingOptions'
                                    type='radio'
                                    defaultChecked={!this.state.allow_team_listing}
                                    onChange={this.handleTeamListingRadio.bind(this, false)}
                                />
                                {'No'}
                            </label>
                            <br/>
                        </div>
                        <div><br/>{'Including this team will display the team name from the Team Directory section of the Home Page, and provide a link to the sign-in page.'}</div>
                    </div>
                );
            } else {
                inputs.push(
                    <div key='userTeamListingOptions'>
                        <div><br/>{'Contact your system administrator to turn on the team directory on the system home page.'}</div>
                    </div>
                );
            }

            teamListingSection = (
                <SettingItemMax
                    title='Include this team in the Team Directory'
                    inputs={inputs}
                    submit={submitHandle}
                    server_error={serverError}
                    client_error={clientError}
                    updateSection={this.onUpdateTeamListingSection}
                />
            );
        } else {
            let describe = '';

            if (enableTeamListing) {
                if (this.state.allow_team_listing === true) {
                    describe = 'Yes';
                } else {
                    describe = 'No';
                }
            } else {
                describe = 'Team directory is turned off for this system.';
            }

            teamListingSection = (
                <SettingItemMin
                    title='Include this team in the Team Directory'
                    describe={describe}
                    updateSection={this.onUpdateTeamListingSection}
                />
            );
        }

        let openInviteSection;
        if (this.props.activeSection === 'open_invite') {
            const inputs = [
                <div key='userOpenInviteOptions'>
                    <div className='radio'>
                        <label>
                            <input
                                name='userOpenInviteOptions'
                                type='radio'
                                defaultChecked={this.state.allow_open_invite}
                                onChange={this.handleOpenInviteRadio.bind(this, true)}
                            />
                            {'Yes'}
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                name='userOpenInviteOptions'
                                type='radio'
                                defaultChecked={!this.state.allow_open_invite}
                                onChange={this.handleOpenInviteRadio.bind(this, false)}
                            />
                            {'No'}
                        </label>
                        <br/>
                    </div>
                    <div><br/>{'When allowed, a link to account creation will be included on the sign-in page of this team and allow any visitor to sign-up.'}</div>
                </div>
            ];

            openInviteSection = (
                <SettingItemMax
                    title='Allow anyone to sign-up from login page'
                    inputs={inputs}
                    submit={this.handleOpenInviteSubmit}
                    server_error={serverError}
                    updateSection={this.onUpdateOpenInviteSection}
                />
            );
        } else {
            let describe = '';
            if (this.state.allow_open_invite === true) {
                describe = 'Yes';
            } else {
                describe = 'No';
            }

            openInviteSection = (
                <SettingItemMin
                    title='Allow anyone to sign-up from login page'
                    describe={describe}
                    updateSection={this.onUpdateOpenInviteSection}
                />
            );
        }

        let inviteSection;

        if (this.props.activeSection === 'invite_id') {
            const inputs = [];

            inputs.push(
                <div key='teamInviteSetting'>
                    <div className='row'>
                        <label className='col-sm-5 control-label'>{'Invite Code'}</label>
                        <div className='col-sm-7'>
                            <input
                                className='form-control'
                                type='text'
                                onChange={this.updateInviteId}
                                value={this.state.invite_id}
                                maxLength='32'
                            />
                            <div className='padding-top x2'>
                                <a
                                    href='#'
                                    onClick={this.handleGenerateInviteId}
                                >
                                    {'Re-Generate'}
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className='setting-list__hint'>{'The Invite Code is used as part of the URL in the team invitation link created by **Get Team Invite Link** in the main menu. Regenerating creates a new team invitation link and invalidates the previous link.'}</div>
                </div>
            );

            inviteSection = (
                <SettingItemMax
                    title={`Invite Code`}
                    inputs={inputs}
                    submit={this.handleInviteIdSubmit}
                    server_error={serverError}
                    client_error={clientError}
                    updateSection={this.onUpdateInviteIdSection}
                />
            );
        } else {
            inviteSection = (
                <SettingItemMin
                    title={`Invite Code`}
                    describe={`Click 'Edit' to regenerate Invite Code.`}
                    updateSection={this.onUpdateInviteIdSection}
                />
            );
        }

        let nameSection;

        if (this.props.activeSection === 'name') {
            const inputs = [];

            let teamNameLabel = 'Team Name';
            if (Utils.isMobile()) {
                teamNameLabel = '';
            }

            inputs.push(
                <div
                    key='teamNameSetting'
                    className='form-group'
                >
                    <label className='col-sm-5 control-label'>{teamNameLabel}</label>
                    <div className='col-sm-7'>
                        <input
                            className='form-control'
                            type='text'
                            maxLength='22'
                            onChange={this.updateName}
                            value={this.state.name}
                        />
                    </div>
                </div>
            );

            nameSection = (
                <SettingItemMax
                    title={`Team Name`}
                    inputs={inputs}
                    submit={this.handleNameSubmit}
                    server_error={serverError}
                    client_error={clientError}
                    updateSection={this.onUpdateNameSection}
                    extraInfo='Set the name of the team as it appears on your sign-in screen and at the top of the left-hand sidebar.'
                />
            );
        } else {
            var describe = this.state.name;

            nameSection = (
                <SettingItemMin
                    title={`Team Name`}
                    describe={describe}
                    updateSection={this.onUpdateNameSection}
                />
            );
        }

        return (
            <div>
                <div className='modal-header'>
                    <button
                        type='button'
                        className='close'
                        data-dismiss='modal'
                        aria-label='Close'
                    >
                        <span aria-hidden='true'>&times;</span>
                    </button>
                    <h4
                        className='modal-title'
                        ref='title'
                    >
                        <i className='modal-back'></i>
                        {'General Settings'}
                    </h4>
                </div>
                <div
                    ref='wrapper'
                    className='user-settings'
                >
                    <h3 className='tab-header'>{'General Settings'}</h3>
                    <div className='divider-dark first'/>
                    {nameSection}
                    <div className='divider-light'/>
                    {openInviteSection}
                    <div className='divider-light'/>
                    {teamListingSection}
                    <div className='divider-light'/>
                    {inviteSection}
                    <div className='divider-dark'/>
                </div>
            </div>
        );
    }
}

GeneralTab.propTypes = {
    updateSection: React.PropTypes.func.isRequired,
    team: React.PropTypes.object.isRequired,
    activeSection: React.PropTypes.string.isRequired
};
