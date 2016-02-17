// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import * as Client from '../../utils/client.jsx';
import * as AsyncClient from '../../utils/async_client.jsx';
import crypto from 'crypto';

import {injectIntl, intlShape, defineMessages, FormattedMessage, FormattedHTMLMessage} from 'mm-intl';

var holders = defineMessages({
    notificationDisplayExample: {
        id: 'admin.email.notificationDisplayExample',
        defaultMessage: 'Ex: "Mattermost Notification", "System", "No-Reply"'
    },
    notificationEmailExample: {
        id: 'admin.email.notificationEmailExample',
        defaultMessage: 'Ex: "mattermost@yourcompany.com", "admin@yourcompany.com"'
    },
    smtpUsernameExample: {
        id: 'admin.email.smtpUsernameExample',
        defaultMessage: 'Ex: "admin@yourcompany.com", "AKIADTOVBGERKLCBV"'
    },
    smtpPasswordExample: {
        id: 'admin.email.smtpPasswordExample',
        defaultMessage: 'Ex: "yourpassword", "jcuS8PuvcpGhpgHhlcpT1Mx42pnqMxQY"'
    },
    smtpServerExample: {
        id: 'admin.email.smtpServerExample',
        defaultMessage: 'Ex: "smtp.yourcompany.com", "email-smtp.us-east-1.amazonaws.com"'
    },
    smtpPortExample: {
        id: 'admin.email.smtpPortExample',
        defaultMessage: 'Ex: "25", "465"'
    },
    connectionSecurityNone: {
        id: 'admin.email.connectionSecurityNone',
        defaultMessage: 'None'
    },
    connectionSecurityTls: {
        id: 'admin.email.connectionSecurityTls',
        defaultMessage: 'TLS (Recommended)'
    },
    connectionSecurityStart: {
        id: 'admin.email.connectionSecurityStart',
        defaultMessage: 'STARTTLS'
    },
    inviteSaltExample: {
        id: 'admin.email.inviteSaltExample',
        defaultMessage: 'Ex "bjlSR4QqkXFBr7TP4oDzlfZmcNuH9Yo"'
    },
    passwordSaltExample: {
        id: 'admin.email.passwordSaltExample',
        defaultMessage: 'Ex "bjlSR4QqkXFBr7TP4oDzlfZmcNuH9Yo"'
    },
    pushServerEx: {
        id: 'admin.email.pushServerEx',
        defaultMessage: 'E.g.: "https://push-test.mattermost.com"'
    },
    testing: {
        id: 'admin.email.testing',
        defaultMessage: 'Testing...'
    },
    saving: {
        id: 'admin.email.saving',
        defaultMessage: 'Saving Config...'
    }
});

class EmailSettings extends React.Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleTestConnection = this.handleTestConnection.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.buildConfig = this.buildConfig.bind(this);
        this.handleGenerateInvite = this.handleGenerateInvite.bind(this);
        this.handleGenerateReset = this.handleGenerateReset.bind(this);

        this.state = {
            sendEmailNotifications: this.props.config.EmailSettings.SendEmailNotifications,
            sendPushNotifications: this.props.config.EmailSettings.SendPushNotifications,
            saveNeeded: false,
            serverError: null,
            emailSuccess: null,
            emailFail: null
        };
    }

    handleChange(action) {
        var s = {saveNeeded: true, serverError: this.state.serverError};

        if (action === 'sendEmailNotifications_true') {
            s.sendEmailNotifications = true;
        }

        if (action === 'sendEmailNotifications_false') {
            s.sendEmailNotifications = false;
        }

        if (action === 'sendPushNotifications_true') {
            s.sendPushNotifications = true;
        }

        if (action === 'sendPushNotifications_false') {
            s.sendPushNotifications = false;
        }

        this.setState(s);
    }

    buildConfig() {
        var config = this.props.config;
        config.EmailSettings.EnableSignUpWithEmail = ReactDOM.findDOMNode(this.refs.allowSignUpWithEmail).checked;
        config.EmailSettings.SendEmailNotifications = ReactDOM.findDOMNode(this.refs.sendEmailNotifications).checked;
        config.EmailSettings.SendPushNotifications = ReactDOM.findDOMNode(this.refs.sendPushNotifications).checked;
        config.EmailSettings.RequireEmailVerification = ReactDOM.findDOMNode(this.refs.requireEmailVerification).checked;
        config.EmailSettings.FeedbackName = ReactDOM.findDOMNode(this.refs.feedbackName).value.trim();
        config.EmailSettings.FeedbackEmail = ReactDOM.findDOMNode(this.refs.feedbackEmail).value.trim();
        config.EmailSettings.SMTPServer = ReactDOM.findDOMNode(this.refs.SMTPServer).value.trim();
        config.EmailSettings.PushNotificationServer = ReactDOM.findDOMNode(this.refs.PushNotificationServer).value.trim();
        config.EmailSettings.SMTPPort = ReactDOM.findDOMNode(this.refs.SMTPPort).value.trim();
        config.EmailSettings.SMTPUsername = ReactDOM.findDOMNode(this.refs.SMTPUsername).value.trim();
        config.EmailSettings.SMTPPassword = ReactDOM.findDOMNode(this.refs.SMTPPassword).value.trim();
        config.EmailSettings.ConnectionSecurity = ReactDOM.findDOMNode(this.refs.ConnectionSecurity).value.trim();

        config.EmailSettings.InviteSalt = ReactDOM.findDOMNode(this.refs.InviteSalt).value.trim();
        if (config.EmailSettings.InviteSalt === '') {
            config.EmailSettings.InviteSalt = crypto.randomBytes(256).toString('base64').substring(0, 32);
            ReactDOM.findDOMNode(this.refs.InviteSalt).value = config.EmailSettings.InviteSalt;
        }

        config.EmailSettings.PasswordResetSalt = ReactDOM.findDOMNode(this.refs.PasswordResetSalt).value.trim();
        if (config.EmailSettings.PasswordResetSalt === '') {
            config.EmailSettings.PasswordResetSalt = crypto.randomBytes(256).toString('base64').substring(0, 32);
            ReactDOM.findDOMNode(this.refs.PasswordResetSalt).value = config.EmailSettings.PasswordResetSalt;
        }

        return config;
    }

    handleGenerateInvite(e) {
        e.preventDefault();
        ReactDOM.findDOMNode(this.refs.InviteSalt).value = crypto.randomBytes(256).toString('base64').substring(0, 32);
        var s = {saveNeeded: true, serverError: this.state.serverError};
        this.setState(s);
    }

    handleGenerateReset(e) {
        e.preventDefault();
        ReactDOM.findDOMNode(this.refs.PasswordResetSalt).value = crypto.randomBytes(256).toString('base64').substring(0, 32);
        var s = {saveNeeded: true, serverError: this.state.serverError};
        this.setState(s);
    }

    handleTestConnection(e) {
        e.preventDefault();
        $('#connection-button').button('loading');

        var config = this.buildConfig();

        Client.testEmail(
            config,
            () => {
                this.setState({
                    sendEmailNotifications: config.EmailSettings.SendEmailNotifications,
                    serverError: null,
                    saveNeeded: true,
                    emailSuccess: true,
                    emailFail: null
                });
                $('#connection-button').button('reset');
            },
            (err) => {
                this.setState({
                    sendEmailNotifications: config.EmailSettings.SendEmailNotifications,
                    serverError: null,
                    saveNeeded: true,
                    emailSuccess: null,
                    emailFail: err.message + ' - ' + err.detailed_error
                });
                $('#connection-button').button('reset');
            }
        );
    }

    handleSubmit(e) {
        e.preventDefault();
        $('#save-button').button('loading');

        var config = this.buildConfig();

        Client.saveConfig(
            config,
            () => {
                AsyncClient.getConfig();
                this.setState({
                    sendEmailNotifications: config.EmailSettings.SendEmailNotifications,
                    serverError: null,
                    saveNeeded: false,
                    emailSuccess: null,
                    emailFail: null
                });
                $('#save-button').button('reset');
            },
            (err) => {
                this.setState({
                    sendEmailNotifications: config.EmailSettings.SendEmailNotifications,
                    serverError: err.message,
                    saveNeeded: true,
                    emailSuccess: null,
                    emailFail: null
                });
                $('#save-button').button('reset');
            }
        );
    }

    render() {
        const {formatMessage} = this.props.intl;
        var serverError = '';
        if (this.state.serverError) {
            serverError = <div className='form-group has-error'><label className='control-label'>{this.state.serverError}</label></div>;
        }

        var saveClass = 'btn';
        if (this.state.saveNeeded) {
            saveClass = 'btn btn-primary';
        }

        var emailSuccess = '';
        if (this.state.emailSuccess) {
            emailSuccess = (
                 <div className='alert alert-success'>
                    <i className='fa fa-check'></i>
                     <FormattedMessage
                         id='admin.email.emailSuccess'
                         defaultMessage='No errors were reported while sending an email.  Please check your inbox to make sure.'
                     />
                </div>
            );
        }

        var emailFail = '';
        if (this.state.emailFail) {
            emailSuccess = (
                 <div className='alert alert-warning'>
                    <i className='fa fa-warning'></i>
                     <FormattedMessage
                         id='admin.email.emailFail'
                         defaultMessage='Connection unsuccessful: {error}'
                         values={{
                             error: this.state.emailFail
                         }}
                     />
                </div>
            );
        }

        return (
            <div className='wrapper--fixed'>
                <h3>
                    <FormattedMessage
                        id='admin.email.emailSettings'
                        defaultMessage='Email Settings'
                    />
                </h3>
                <form
                    className='form-horizontal'
                    role='form'
                >

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='allowSignUpWithEmail'
                        >
                            <FormattedMessage
                                id='admin.email.allowSignupTitle'
                                defaultMessage='Allow Sign Up With Email: '
                            />
                        </label>
                        <div className='col-sm-8'>
                            <label className='radio-inline'>
                                <input
                                    type='radio'
                                    name='allowSignUpWithEmail'
                                    value='true'
                                    ref='allowSignUpWithEmail'
                                    defaultChecked={this.props.config.EmailSettings.EnableSignUpWithEmail}
                                    onChange={this.handleChange.bind(this, 'allowSignUpWithEmail_true')}
                                />
                                    <FormattedMessage
                                        id='admin.email.true'
                                        defaultMessage='true'
                                    />
                            </label>
                            <label className='radio-inline'>
                                <input
                                    type='radio'
                                    name='allowSignUpWithEmail'
                                    value='false'
                                    defaultChecked={!this.props.config.EmailSettings.EnableSignUpWithEmail}
                                    onChange={this.handleChange.bind(this, 'allowSignUpWithEmail_false')}
                                />
                                    <FormattedMessage
                                        id='admin.email.false'
                                        defaultMessage='false'
                                    />
                            </label>
                            <p className='help-text'>
                                <FormattedMessage
                                    id='admin.email.allowSignupDescription'
                                    defaultMessage='When true, Mattermost allows team creation and account signup using email and password.  This value should be false only when you want to limit signup to a single-sign-on service like OAuth or LDAP.'
                                />
                            </p>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='sendEmailNotifications'
                        >
                            <FormattedMessage
                                id='admin.email.notificationsTitle'
                                defaultMessage='Send Email Notifications: '
                            />
                        </label>
                        <div className='col-sm-8'>
                            <label className='radio-inline'>
                                <input
                                    type='radio'
                                    name='sendEmailNotifications'
                                    value='true'
                                    ref='sendEmailNotifications'
                                    defaultChecked={this.props.config.EmailSettings.SendEmailNotifications}
                                    onChange={this.handleChange.bind(this, 'sendEmailNotifications_true')}
                                />
                                    <FormattedMessage
                                        id='admin.email.true'
                                        defaultMessage='true'
                                    />
                            </label>
                            <label className='radio-inline'>
                                <input
                                    type='radio'
                                    name='sendEmailNotifications'
                                    value='false'
                                    defaultChecked={!this.props.config.EmailSettings.SendEmailNotifications}
                                    onChange={this.handleChange.bind(this, 'sendEmailNotifications_false')}
                                />
                                    <FormattedMessage
                                        id='admin.email.false'
                                        defaultMessage='false'
                                    />
                            </label>
                            <p className='help-text'>
                                <FormattedHTMLMessage
                                    id='admin.email.notificationsDescription'
                                    defaultMessage='Typically set to true in production. When true, Mattermost attempts to send email notifications. Developers may set this field to false to skip email setup for faster development.<br />Setting this to true removes the Preview Mode banner (requires logging out and logging back in after setting is changed).'
                                />
                            </p>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='requireEmailVerification'
                        >
                            <FormattedMessage
                                id='admin.email.requireVerificationTitle'
                                defaultMessage='Require Email Verification: '
                            />
                        </label>
                        <div className='col-sm-8'>
                            <label className='radio-inline'>
                                <input
                                    type='radio'
                                    name='requireEmailVerification'
                                    value='true'
                                    ref='requireEmailVerification'
                                    defaultChecked={this.props.config.EmailSettings.RequireEmailVerification}
                                    onChange={this.handleChange.bind(this, 'requireEmailVerification_true')}
                                    disabled={!this.state.sendEmailNotifications}
                                />
                                    <FormattedMessage
                                        id='admin.email.true'
                                        defaultMessage='true'
                                    />
                            </label>
                            <label className='radio-inline'>
                                <input
                                    type='radio'
                                    name='requireEmailVerification'
                                    value='false'
                                    defaultChecked={!this.props.config.EmailSettings.RequireEmailVerification}
                                    onChange={this.handleChange.bind(this, 'requireEmailVerification_false')}
                                    disabled={!this.state.sendEmailNotifications}
                                />
                                    <FormattedMessage
                                        id='admin.email.false'
                                        defaultMessage='false'
                                    />
                            </label>
                            <p className='help-text'>
                                <FormattedMessage
                                    id='admin.email.requireVerificationDescription'
                                    defaultMessage='Typically set to true in production. When true, Mattermost requires email verification after account creation prior to allowing login. Developers may set this field to false so skip sending verification emails for faster development.'
                                />
                            </p>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='feedbackName'
                        >
                            <FormattedMessage
                                id='admin.email.notificationDisplayTitle'
                                defaultMessage='Notification Display Name:'
                            />
                        </label>
                        <div className='col-sm-8'>
                            <input
                                type='text'
                                className='form-control'
                                id='feedbackName'
                                ref='feedbackName'
                                placeholder={formatMessage(holders.notificationDisplayExample)}
                                defaultValue={this.props.config.EmailSettings.FeedbackName}
                                onChange={this.handleChange}
                                disabled={!this.state.sendEmailNotifications}
                            />
                            <p className='help-text'>
                                <FormattedMessage
                                    id='admin.email.notificationDisplayDescription'
                                    defaultMessage='Display name on email account used when sending notification emails from Mattermost.'
                                />
                            </p>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='feedbackEmail'
                        >
                            <FormattedMessage
                                id='admin.email.notificationEmailTitle'
                                defaultMessage='Notification Email Address:'
                            />
                        </label>
                        <div className='col-sm-8'>
                            <input
                                type='email'
                                className='form-control'
                                id='feedbackEmail'
                                ref='feedbackEmail'
                                placeholder={formatMessage(holders.notificationEmailExample)}
                                defaultValue={this.props.config.EmailSettings.FeedbackEmail}
                                onChange={this.handleChange}
                                disabled={!this.state.sendEmailNotifications}
                            />
                            <p className='help-text'>
                                <FormattedMessage
                                    id='admin.email.notificationEmailDescription'
                                    defaultMessage='Email address displayed on email account used when sending notification emails from Mattermost.'
                                />
                            </p>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='SMTPUsername'
                        >
                            <FormattedMessage
                                id='admin.email.smtpUsernameTitle'
                                defaultMessage='SMTP Username:'
                            />
                        </label>
                        <div className='col-sm-8'>
                            <input
                                type='text'
                                className='form-control'
                                id='SMTPUsername'
                                ref='SMTPUsername'
                                placeholder={formatMessage(holders.smtpUsernameExample)}
                                defaultValue={this.props.config.EmailSettings.SMTPUsername}
                                onChange={this.handleChange}
                                disabled={!this.state.sendEmailNotifications}
                            />
                            <p className='help-text'>
                                <FormattedMessage
                                    id='admin.email.smtpUsernameDescription'
                                    defaultMessage=' Obtain this credential from administrator setting up your email server.'
                                />
                            </p>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='SMTPPassword'
                        >
                            <FormattedMessage
                                id='admin.email.smtpPasswordTitle'
                                defaultMessage='SMTP Password:'
                            />
                        </label>
                        <div className='col-sm-8'>
                            <input
                                type='text'
                                className='form-control'
                                id='SMTPPassword'
                                ref='SMTPPassword'
                                placeholder={formatMessage(holders.smtpPasswordExample)}
                                defaultValue={this.props.config.EmailSettings.SMTPPassword}
                                onChange={this.handleChange}
                                disabled={!this.state.sendEmailNotifications}
                            />
                            <p className='help-text'>
                                <FormattedMessage
                                    id='admin.email.smtpPasswordDescription'
                                    defaultMessage=' Obtain this credential from administrator setting up your email server.'
                                />
                            </p>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='SMTPServer'
                        >
                            <FormattedMessage
                                id='admin.email.smtpServerTitle'
                                defaultMessage='SMTP Server:'
                            />
                        </label>
                        <div className='col-sm-8'>
                            <input
                                type='text'
                                className='form-control'
                                id='SMTPServer'
                                ref='SMTPServer'
                                placeholder={formatMessage(holders.smtpServerExample)}
                                defaultValue={this.props.config.EmailSettings.SMTPServer}
                                onChange={this.handleChange}
                                disabled={!this.state.sendEmailNotifications}
                            />
                            <p className='help-text'>
                                <FormattedMessage
                                    id='admin.email.smtpServerDescription'
                                    defaultMessage='Location of SMTP email server.'
                                />
                            </p>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='SMTPPort'
                        >
                            <FormattedMessage
                                id='admin.email.smtpPortTitle'
                                defaultMessage='SMTP Port:'
                            />
                        </label>
                        <div className='col-sm-8'>
                            <input
                                type='text'
                                className='form-control'
                                id='SMTPPort'
                                ref='SMTPPort'
                                placeholder={formatMessage(holders.smtpPortExample)}
                                defaultValue={this.props.config.EmailSettings.SMTPPort}
                                onChange={this.handleChange}
                                disabled={!this.state.sendEmailNotifications}
                            />
                            <p className='help-text'>
                                <FormattedMessage
                                    id='admin.email.smtpPortDescription'
                                    defaultMessage='Port of SMTP email server.'
                                />
                            </p>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='ConnectionSecurity'
                        >
                            <FormattedMessage
                                id='admin.email.connectionSecurityTitle'
                                defaultMessage='Connection Security:'
                            />
                        </label>
                        <div className='col-sm-8'>
                            <select
                                className='form-control'
                                id='ConnectionSecurity'
                                ref='ConnectionSecurity'
                                defaultValue={this.props.config.EmailSettings.ConnectionSecurity}
                                onChange={this.handleChange}
                                disabled={!this.state.sendEmailNotifications}
                            >
                                <option value=''>{formatMessage(holders.connectionSecurityNone)}</option>
                                <option value='TLS'>{formatMessage(holders.connectionSecurityTls)}</option>
                                <option value='STARTTLS'>{formatMessage(holders.connectionSecurityStart)}</option>
                            </select>
                            <div className='help-text'>
                                <table
                                    className='table table-bordered'
                                    cellPadding='5'
                                >
                                    <tbody>
                                        <tr><td className='help-text'>
                                            <FormattedMessage
                                                id='admin.email.connectionSecurityNone'
                                                defaultMessage='None'
                                            />
                                        </td><td className='help-text'>
                                            <FormattedMessage
                                                id='admin.email.connectionSecurityNoneDescription'
                                                defaultMessage='Mattermost will send email over an unsecure connection.'
                                            />
                                        </td></tr>
                                        <tr><td className='help-text'>{'TLS'}</td><td className='help-text'>
                                            <FormattedMessage
                                                id='admin.email.connectionSecurityTlsDescription'
                                                defaultMessage='Encrypts the communication between Mattermost and your email server.'
                                            />
                                        </td></tr>
                                        <tr><td className='help-text'>{'STARTTLS'}</td><td className='help-text'>
                                            <FormattedMessage
                                                id='admin.email.connectionSecurityStartDescription'
                                                defaultMessage='Takes an existing insecure connection and attempts to upgrade it to a secure connection using TLS.'
                                            />
                                        </td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className='help-text'>
                                <button
                                    className='btn btn-default'
                                    onClick={this.handleTestConnection}
                                    disabled={!this.state.sendEmailNotifications}
                                    id='connection-button'
                                    data-loading-text={'<span class=\'glyphicon glyphicon-refresh glyphicon-refresh-animate\'></span> ' + formatMessage(holders.testing)}
                                >
                                    <FormattedMessage
                                        id='admin.email.connectionSecurityTest'
                                        defaultMessage='Test Connection'
                                    />
                                </button>
                                {emailSuccess}
                                {emailFail}
                            </div>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='InviteSalt'
                        >
                            <FormattedMessage
                                id='admin.email.inviteSaltTitle'
                                defaultMessage='Invite Salt:'
                            />
                        </label>
                        <div className='col-sm-8'>
                            <input
                                type='text'
                                className='form-control'
                                id='InviteSalt'
                                ref='InviteSalt'
                                placeholder={formatMessage(holders.inviteSaltExample)}
                                defaultValue={this.props.config.EmailSettings.InviteSalt}
                                onChange={this.handleChange}
                                disabled={!this.state.sendEmailNotifications}
                            />
                            <p className='help-text'>
                                <FormattedMessage
                                    id='admin.email.inviteSaltDescription'
                                    defaultMessage='32-character salt added to signing of email invites. Randomly generated on install. Click "Re-Generate" to create new salt.'
                                />
                            </p>
                            <div className='help-text'>
                                <button
                                    className='btn btn-default'
                                    onClick={this.handleGenerateInvite}
                                    disabled={!this.state.sendEmailNotifications}
                                >
                                    <FormattedMessage
                                        id='admin.email.regenerate'
                                        defaultMessage='Re-Generate'
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='PasswordResetSalt'
                        >
                            <FormattedMessage
                                id='admin.email.passwordSaltTitle'
                                defaultMessage='Password Reset Salt:'
                            />
                        </label>
                        <div className='col-sm-8'>
                            <input
                                type='text'
                                className='form-control'
                                id='PasswordResetSalt'
                                ref='PasswordResetSalt'
                                placeholder={formatMessage(holders.passwordSaltExample)}
                                defaultValue={this.props.config.EmailSettings.PasswordResetSalt}
                                onChange={this.handleChange}
                                disabled={!this.state.sendEmailNotifications}
                            />
                            <p className='help-text'>
                                <FormattedMessage
                                    id='admin.email.passwordSaltDescription'
                                    defaultMessage='32-character salt added to signing of password reset emails. Randomly generated on install. Click "Re-Generate" to create new salt.'
                                />
                            </p>
                            <div className='help-text'>
                                <button
                                    className='btn btn-default'
                                    onClick={this.handleGenerateReset}
                                    disabled={!this.state.sendEmailNotifications}
                                >
                                    <FormattedMessage
                                        id='admin.email.regenerate'
                                        defaultMessage='Re-Generate'
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='sendPushNotifications'
                        >
                            <FormattedMessage
                                id='admin.email.pushTitle'
                                defaultMessage='Send Push Notifications: '
                            />
                        </label>
                        <div className='col-sm-8'>
                            <label className='radio-inline'>
                                <input
                                    type='radio'
                                    name='sendPushNotifications'
                                    value='true'
                                    ref='sendPushNotifications'
                                    defaultChecked={this.props.config.EmailSettings.SendPushNotifications}
                                    onChange={this.handleChange.bind(this, 'sendPushNotifications_true')}
                                />
                                    <FormattedMessage
                                        id='admin.email.true'
                                        defaultMessage='true'
                                    />
                            </label>
                            <label className='radio-inline'>
                                <input
                                    type='radio'
                                    name='sendPushNotifications'
                                    value='false'
                                    defaultChecked={!this.props.config.EmailSettings.SendPushNotifications}
                                    onChange={this.handleChange.bind(this, 'sendPushNotifications_false')}
                                />
                                    <FormattedMessage
                                        id='admin.email.false'
                                        defaultMessage='false'
                                    />
                            </label>
                            <p className='help-text'>
                                <FormattedMessage
                                    id='admin.email.pushDesc'
                                    defaultMessage='Typically set to true in production. When true, Mattermost attempts to send iOS and Android push notifications through the push notification server.'
                                />
                            </p>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='PushNotificationServer'
                        >
                            <FormattedMessage
                                id='admin.email.pushServerTitle'
                                defaultMessage='Push Notification Server:'
                            />
                        </label>
                        <div className='col-sm-8'>
                            <input
                                type='text'
                                className='form-control'
                                id='PushNotificationServer'
                                ref='PushNotificationServer'
                                placeholder={formatMessage(holders.pushServerEx)}
                                defaultValue={this.props.config.EmailSettings.PushNotificationServer}
                                onChange={this.handleChange}
                                disabled={!this.state.sendPushNotifications}
                            />
                            <p className='help-text'>
                                <FormattedMessage
                                    id='admin.email.pushServerDesc'
                                    defaultMessage='Location of Mattermost push notification service you can set up behind your firewall using https://github.com/mattermost/push-proxy. For testing you can use https://push-test.mattermost.com, which connects to the sample Mattermost iOS app in the public Apple AppStore. Please do not use test service for production deployments.'
                                />
                            </p>
                        </div>
                    </div>

                    <div className='form-group'>
                        <div className='col-sm-12'>
                            {serverError}
                            <button
                                disabled={!this.state.saveNeeded}
                                type='submit'
                                className={saveClass}
                                onClick={this.handleSubmit}
                                id='save-button'
                                data-loading-text={'<span class=\'glyphicon glyphicon-refresh glyphicon-refresh-animate\'></span> ' + formatMessage(holders.saving)}
                            >
                                <FormattedMessage
                                    id='admin.email.save'
                                    defaultMessage='Save'
                                />
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        );
    }
}

EmailSettings.propTypes = {
    intl: intlShape.isRequired,
    config: React.PropTypes.object
};

export default injectIntl(EmailSettings);