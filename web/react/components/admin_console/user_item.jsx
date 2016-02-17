// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';

import {FormattedMessage} from 'mm-intl';

export default class UserItem extends React.Component {
    constructor(props) {
        super(props);

        this.handleMakeMember = this.handleMakeMember.bind(this);
        this.handleMakeActive = this.handleMakeActive.bind(this);
        this.handleMakeNotActive = this.handleMakeNotActive.bind(this);
        this.handleMakeAdmin = this.handleMakeAdmin.bind(this);
        this.handleMakeSystemAdmin = this.handleMakeSystemAdmin.bind(this);
        this.handleResetPassword = this.handleResetPassword.bind(this);

        this.state = {};
    }

    handleMakeMember(e) {
        e.preventDefault();
        const data = {
            user_id: this.props.user.id,
            new_roles: ''
        };

        Client.updateRoles(data,
            () => {
                this.props.refreshProfiles();
            },
            (err) => {
                this.setState({serverError: err.message});
            }
        );
    }

    handleMakeActive(e) {
        e.preventDefault();
        Client.updateActive(this.props.user.id, true,
            () => {
                this.props.refreshProfiles();
            },
            (err) => {
                this.setState({serverError: err.message});
            }
        );
    }

    handleMakeNotActive(e) {
        e.preventDefault();
        Client.updateActive(this.props.user.id, false,
            () => {
                this.props.refreshProfiles();
            },
            (err) => {
                this.setState({serverError: err.message});
            }
        );
    }

    handleMakeAdmin(e) {
        e.preventDefault();
        const data = {
            user_id: this.props.user.id,
            new_roles: 'admin'
        };

        Client.updateRoles(data,
            () => {
                this.props.refreshProfiles();
            },
            (err) => {
                this.setState({serverError: err.message});
            }
        );
    }

    handleMakeSystemAdmin(e) {
        e.preventDefault();
        const data = {
            user_id: this.props.user.id,
            new_roles: 'system_admin'
        };

        Client.updateRoles(data,
            () => {
                this.props.refreshProfiles();
            },
            (err) => {
                this.setState({serverError: err.message});
            }
        );
    }

    handleResetPassword(e) {
        e.preventDefault();
        this.props.doPasswordReset(this.props.user);
    }

    render() {
        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div className='has-error'>
                    <label className='has-error control-label'>{this.state.serverError}</label>
                </div>
            );
        }

        const user = this.props.user;
        let currentRoles = (
            <FormattedMessage
                id='admin.user_item.member'
                defaultMessage='Member'
            />
        );
        if (user.roles.length > 0) {
            if (Utils.isSystemAdmin(user.roles)) {
                currentRoles = (
                    <FormattedMessage
                        id='admin.user_item.sysAdmin'
                        defaultMessage='System Admin'
                    />
                );
            } else if (Utils.isAdmin(user.roles)) {
                currentRoles = (
                    <FormattedMessage
                        id='admin.user_item.teamAdmin'
                        defaultMessage='Team Admin'
                    />
                );
            } else {
                currentRoles = user.roles.charAt(0).toUpperCase() + user.roles.slice(1);
            }
        }

        const email = user.email;
        let showMakeMember = user.roles === 'admin' || user.roles === 'system_admin';
        let showMakeAdmin = user.roles === '' || user.roles === 'system_admin';
        let showMakeSystemAdmin = user.roles === '' || user.roles === 'admin';
        let showMakeActive = false;
        let showMakeNotActive = user.roles !== 'system_admin';

        if (user.delete_at > 0) {
            currentRoles = (
                <FormattedMessage
                    id='admin.user_item.inactive'
                    defaultMessage='Inactive'
                />
            );
            showMakeMember = false;
            showMakeAdmin = false;
            showMakeSystemAdmin = false;
            showMakeActive = true;
            showMakeNotActive = false;
        }

        let makeSystemAdmin = null;
        if (showMakeSystemAdmin) {
            makeSystemAdmin = (
                <li role='presentation'>
                    <a
                        role='menuitem'
                        href='#'
                        onClick={this.handleMakeSystemAdmin}
                    >
                        <FormattedMessage
                            id='admin.user_item.makeSysAdmin'
                            defaultMessage='Make System Admin'
                        />
                    </a>
                </li>
            );
        }

        let makeAdmin = null;
        if (showMakeAdmin) {
            makeAdmin = (
                <li role='presentation'>
                    <a
                        role='menuitem'
                        href='#'
                        onClick={this.handleMakeAdmin}
                    >
                        <FormattedMessage
                            id='admin.user_item.makeTeamAdmin'
                            defaultMessage='Make Team Admin'
                        />
                    </a>
                </li>
            );
        }

        let makeMember = null;
        if (showMakeMember) {
            makeMember = (
                <li role='presentation'>
                    <a
                        role='menuitem'
                        href='#'
                        onClick={this.handleMakeMember}
                    >
                        <FormattedMessage
                            id='admin.user_item.makeMember'
                            defaultMessage='Make Member'
                        />
                    </a>
                </li>
            );
        }

        let makeActive = null;
        if (showMakeActive) {
            makeActive = (
                <li role='presentation'>
                    <a
                        role='menuitem'
                        href='#'
                        onClick={this.handleMakeActive}
                    >
                        <FormattedMessage
                            id='admin.user_item.makeActive'
                            defaultMessage='Make Active'
                        />
                    </a>
                </li>
            );
        }

        let makeNotActive = null;
        if (showMakeNotActive) {
            makeNotActive = (
                <li role='presentation'>
                    <a
                        role='menuitem'
                        href='#'
                        onClick={this.handleMakeNotActive}
                    >
                        <FormattedMessage
                            id='admin.user_item.makeInactive'
                            defaultMessage='Make Inactive'
                        />
                    </a>
                </li>
            );
        }

        return (
            <tr>
                <td className='row member-div'>
                    <img
                        className='post-profile-img pull-left'
                        src={`/api/v1/users/${user.id}/image?time=${user.update_at}&${Utils.getSessionIndex()}`}
                        height='36'
                        width='36'
                    />
                    <span className='member-name'>{Utils.getDisplayName(user)}</span>
                    <span className='member-email'>{email}</span>
                    <div className='dropdown member-drop'>
                        <a
                            href='#'
                            className='dropdown-toggle theme'
                            type='button'
                            data-toggle='dropdown'
                            aria-expanded='true'
                        >
                            <span>{currentRoles} </span>
                            <span className='caret'></span>
                        </a>
                        <ul
                            className='dropdown-menu member-menu'
                            role='menu'
                        >
                            {makeAdmin}
                            {makeMember}
                            {makeActive}
                            {makeNotActive}
                            {makeSystemAdmin}
                            <li role='presentation'>
                                <a
                                    role='menuitem'
                                    href='#'
                                    onClick={this.handleResetPassword}
                                >
                                    <FormattedMessage
                                        id='admin.user_item.resetPwd'
                                        defaultMessage='Reset Password'
                                    />
                                </a>
                            </li>
                        </ul>
                    </div>
                    {serverError}
                </td>
            </tr>
        );
    }
}

UserItem.propTypes = {
    user: React.PropTypes.object.isRequired,
    refreshProfiles: React.PropTypes.func.isRequired,
    doPasswordReset: React.PropTypes.func.isRequired
};
