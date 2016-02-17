// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {savePreferences} from '../../utils/client.jsx';
import SettingItemMin from '../setting_item_min.jsx';
import SettingItemMax from '../setting_item_max.jsx';
import Constants from '../../utils/constants.jsx';
const PreReleaseFeatures = Constants.PRE_RELEASE_FEATURES;
import PreferenceStore from '../../stores/preference_store.jsx';
import ManageLanguages from './manage_languages.jsx';
import * as Utils from '../../utils/utils.jsx';

function getDisplayStateFromStores() {
    const militaryTime = PreferenceStore.getPreference(Constants.Preferences.CATEGORY_DISPLAY_SETTINGS, 'use_military_time', {value: 'false'});
    const nameFormat = PreferenceStore.getPreference(Constants.Preferences.CATEGORY_DISPLAY_SETTINGS, 'name_format', {value: 'username'});
    const selectedFont = PreferenceStore.getPreference(Constants.Preferences.CATEGORY_DISPLAY_SETTINGS, 'selected_font', {value: Constants.DEFAULT_FONT});

    return {
        militaryTime: militaryTime.value,
        nameFormat: nameFormat.value,
        selectedFont: selectedFont.value
    };
}

export default class UserSettingsDisplay extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleClockRadio = this.handleClockRadio.bind(this);
        this.handleNameRadio = this.handleNameRadio.bind(this);
        this.handleFont = this.handleFont.bind(this);
        this.updateSection = this.updateSection.bind(this);
        this.updateState = this.updateState.bind(this);
        this.deactivate = this.deactivate.bind(this);

        this.state = getDisplayStateFromStores();
    }
    handleSubmit() {
        const timePreference = PreferenceStore.setPreference(Constants.Preferences.CATEGORY_DISPLAY_SETTINGS, 'use_military_time', this.state.militaryTime);
        const namePreference = PreferenceStore.setPreference(Constants.Preferences.CATEGORY_DISPLAY_SETTINGS, 'name_format', this.state.nameFormat);
        const fontPreference = PreferenceStore.setPreference(Constants.Preferences.CATEGORY_DISPLAY_SETTINGS, 'selected_font', this.state.selectedFont);

        savePreferences([timePreference, namePreference, fontPreference],
            () => {
                PreferenceStore.emitChange();
                this.updateSection('');
            },
            (err) => {
                this.setState({serverError: err.message});
            }
        );
    }
    handleClockRadio(militaryTime) {
        this.setState({militaryTime});
    }
    handleNameRadio(nameFormat) {
        this.setState({nameFormat});
    }
    handleFont(selectedFont) {
        Utils.applyFont(selectedFont);
        this.setState({selectedFont});
    }
    updateSection(section) {
        this.updateState();
        this.props.updateSection(section);
    }
    updateState() {
        const newState = getDisplayStateFromStores();
        if (!Utils.areObjectsEqual(newState, this.state)) {
            this.handleFont(newState.selectedFont);
            this.setState(newState);
        }
    }
    deactivate() {
        this.updateState();
    }
    render() {
        const serverError = this.state.serverError || null;
        let clockSection;
        let nameFormatSection;
        let fontSection;
        let languagesSection;

        if (this.props.activeSection === 'clock') {
            const clockFormat = [false, false];
            if (this.state.militaryTime === 'true') {
                clockFormat[1] = true;
            } else {
                clockFormat[0] = true;
            }

            const handleUpdateClockSection = (e) => {
                this.updateSection('');
                e.preventDefault();
            };

            const inputs = [
                <div key='userDisplayClockOptions'>
                    <div className='radio'>
                        <label>
                            <input
                                type='radio'
                                checked={clockFormat[0]}
                                onChange={this.handleClockRadio.bind(this, 'false')}
                            />
                            {'12-hour clock (example: 4:00 PM)'}
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                type='radio'
                                checked={clockFormat[1]}
                                onChange={this.handleClockRadio.bind(this, 'true')}
                            />
                            {'24-hour clock (example: 16:00)'}
                        </label>
                        <br/>
                    </div>
                    <div><br/>{'Select how you prefer time displayed.'}</div>
                </div>
            ];

            clockSection = (
                <SettingItemMax
                    title='Clock Display'
                    inputs={inputs}
                    submit={this.handleSubmit}
                    server_error={serverError}
                    updateSection={handleUpdateClockSection}
                />
            );
        } else {
            let describe = '';
            if (this.state.militaryTime === 'true') {
                describe = '24-hour clock (example: 16:00)';
            } else {
                describe = '12-hour clock (example: 4:00 PM)';
            }

            const handleUpdateClockSection = () => {
                this.props.updateSection('clock');
            };

            clockSection = (
                <SettingItemMin
                    title='Clock Display'
                    describe={describe}
                    updateSection={handleUpdateClockSection}
                />
            );
        }

        const showUsername = 'Show username (team default)';
        const showNickname = 'Show nickname if one exists, otherwise show first and last name';
        const showFullName = 'Show first and last name';
        if (this.props.activeSection === 'name_format') {
            const nameFormat = [false, false, false];
            if (this.state.nameFormat === 'nickname_full_name') {
                nameFormat[0] = true;
            } else if (this.state.nameFormat === 'full_name') {
                nameFormat[2] = true;
            } else {
                nameFormat[1] = true;
            }

            const inputs = [
                <div key='userDisplayNameOptions'>
                    <div className='radio'>
                        <label>
                            <input
                                type='radio'
                                checked={nameFormat[1]}
                                onChange={this.handleNameRadio.bind(this, 'username')}
                            />
                            {showUsername}
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                type='radio'
                                checked={nameFormat[0]}
                                onChange={this.handleNameRadio.bind(this, 'nickname_full_name')}
                            />
                            {showNickname}
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                type='radio'
                                checked={nameFormat[2]}
                                onChange={this.handleNameRadio.bind(this, 'full_name')}
                            />
                            {showFullName}
                        </label>
                        <br/>
                    </div>
                    <div><br/>{'Set how to display other user\'s names in posts and the Direct Messages list.'}</div>
                </div>
            ];

            nameFormatSection = (
                <SettingItemMax
                    title='Teammate Name Display'
                    inputs={inputs}
                    submit={this.handleSubmit}
                    server_error={serverError}
                    updateSection={(e) => {
                        this.updateSection('');
                        e.preventDefault();
                    }}
                />
            );
        } else {
            let describe = '';
            if (this.state.nameFormat === 'username') {
                describe = showUsername;
            } else if (this.state.nameFormat === 'full_name') {
                describe = showFullName;
            } else {
                describe = showNickname;
            }

            nameFormatSection = (
                <SettingItemMin
                    title='Teammate Name Display'
                    describe={describe}
                    updateSection={() => {
                        this.props.updateSection('name_format');
                    }}
                />
            );
        }

        if (this.props.activeSection === 'font') {
            const options = [];
            Object.keys(Constants.FONTS).forEach((fontName, idx) => {
                const className = Constants.FONTS[fontName];
                options.push(
                    <option
                        key={'font_' + idx}
                        value={fontName}
                        className={className}
                    >
                        {fontName}
                    </option>
                );
            });

            const inputs = [
                <div key='userDisplayNameOptions'>
                    <div
                        className='dropdown'
                    >
                        <select
                            className='form-control'
                            type='text'
                            value={this.state.selectedFont}
                            onChange={(e) => this.handleFont(e.target.value)}
                        >
                            {options}
                        </select>
                    </div>
                    <div><br/>{'Select the font displayed in the Mattermost user interface.'}</div>
                </div>
            ];

            fontSection = (
                <SettingItemMax
                    title='Display Font'
                    inputs={inputs}
                    submit={this.handleSubmit}
                    server_error={serverError}
                    updateSection={(e) => {
                        this.updateSection('');
                        e.preventDefault();
                    }}
                />
            );
        } else {
            fontSection = (
                <SettingItemMin
                    title='Display Font'
                    describe={this.state.selectedFont}
                    updateSection={() => {
                        this.props.updateSection('font');
                    }}
                />
            );
        }

        if (Utils.isFeatureEnabled(PreReleaseFeatures.LOC_PREVIEW)) {
            if (this.props.activeSection === 'languages') {
                var inputs = [];
                inputs.push(
                    <ManageLanguages
                        user={this.props.user}
                        key='languages-ui'
                    />
                );

                languagesSection = (
                    <SettingItemMax
                        title={'Language'}
                        width='medium'
                        inputs={inputs}
                        updateSection={(e) => {
                            this.updateSection('');
                            e.preventDefault();
                        }}
                    />
                );
            } else {
                var locale = 'English';
                Utils.languages().forEach((l) => {
                    if (l.value === this.props.user.locale) {
                        locale = l.name;
                    }
                });

                languagesSection = (
                    <SettingItemMin
                        title={'Language'}
                        width='medium'
                        describe={locale}
                        updateSection={() => {
                            this.updateSection('languages');
                        }}
                    />
                );
            }
        }

        return (
            <div>
                <div className='modal-header'>
                    <button
                        type='button'
                        className='close'
                        data-dismiss='modal'
                        aria-label='Close'
                        onClick={this.props.closeModal}
                    >
                        <span aria-hidden='true'>{'×'}</span>
                    </button>
                    <h4
                        className='modal-title'
                        ref='title'
                    >
                        <i
                            className='modal-back'
                            onClick={this.props.collapseModal}
                        />
                        {'Display Settings'}
                    </h4>
                </div>
                <div className='user-settings'>
                    <h3 className='tab-header'>{'Display Settings'}</h3>
                    <div className='divider-dark first'/>
                    {fontSection}
                    <div className='divider-dark'/>
                    {clockSection}
                    <div className='divider-dark'/>
                    {nameFormatSection}
                    <div className='divider-dark'/>
                    {languagesSection}
                </div>
            </div>
        );
    }
}

UserSettingsDisplay.propTypes = {
    user: React.PropTypes.object,
    updateSection: React.PropTypes.func,
    updateTab: React.PropTypes.func,
    activeSection: React.PropTypes.string,
    closeModal: React.PropTypes.func.isRequired,
    collapseModal: React.PropTypes.func.isRequired
};
