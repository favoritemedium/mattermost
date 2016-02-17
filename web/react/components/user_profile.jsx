// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import * as Utils from '../utils/utils.jsx';
import UserStore from '../stores/user_store.jsx';
var Popover = ReactBootstrap.Popover;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

var id = 0;

function nextId() {
    id = id + 1;
    return id;
}

export default class UserProfile extends React.Component {
    constructor(props) {
        super(props);

        this.uniqueId = nextId();
        this.onChange = this.onChange.bind(this);

        this.state = this.getStateFromStores(this.props.userId);
    }
    getStateFromStores(userId) {
        var profile = UserStore.getProfile(userId);

        if (profile == null) {
            return {profile: {id: '0', username: '...'}};
        }

        return {profile};
    }
    componentDidMount() {
        UserStore.addChangeListener(this.onChange);
        if (!this.props.disablePopover) {
            $('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover click'});
        }
    }
    componentWillUnmount() {
        UserStore.removeChangeListener(this.onChange);
    }
    onChange(userId) {
        if (!userId || userId === this.props.userId) {
            var newState = this.getStateFromStores(this.props.userId);
            if (!Utils.areObjectsEqual(newState, this.state)) {
                this.setState(newState);
            }
        }
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.userId !== nextProps.userId) {
            this.setState(this.getStateFromStores(nextProps.userId));
        }
    }
    render() {
        var name = Utils.displayUsername(this.state.profile.id);
        if (this.props.overwriteName) {
            name = this.props.overwriteName;
        } else if (!name) {
            name = '...';
        }

        if (this.props.disablePopover) {
            return <div>{name}</div>;
        }

        var profileImg = '/api/v1/users/' + this.state.profile.id + '/image?time=' + this.state.profile.update_at + '&' + Utils.getSessionIndex();
        if (this.props.overwriteImage) {
            profileImg = this.props.overwriteImage;
        }

        var dataContent = [];
        dataContent.push(
            <img
                className='user-popover__image'
                src={profileImg}
                height='128'
                width='128'
                key='user-popover-image'
            />
        );

        if (!global.window.mm_config.ShowEmailAddress === 'true') {
            dataContent.push(
                <div
                    className='text-nowrap'
                    key='user-popover-no-email'
                >
                    {'Email not shared'}
                </div>
            );
        } else {
            dataContent.push(
                <div
                    data-toggle='tooltip'
                    title={this.state.profile.email}
                    key='user-popover-email'
                >
                    <a
                        href={'mailto:' + this.state.profile.email}
                        className='text-nowrap text-lowercase user-popover__email'
                    >
                        {this.state.profile.email}
                    </a>
                </div>
            );
        }

        return (
            <OverlayTrigger
                trigger='click'
                placement='right'
                rootClose={true}
                overlay={
                    <Popover
                        title={name}
                        id='user-profile-popover'
                    >
                        {dataContent}
                    </Popover>
                }
            >
                <div
                    className='user-popover'
                    id={'profile_' + this.uniqueId}
                >
                    {name}
                </div>
            </OverlayTrigger>
        );
    }
}

UserProfile.defaultProps = {
    userId: '',
    overwriteName: '',
    overwriteImage: '',
    disablePopover: false
};
UserProfile.propTypes = {
    userId: React.PropTypes.string,
    overwriteName: React.PropTypes.string,
    overwriteImage: React.PropTypes.string,
    disablePopover: React.PropTypes.bool
};
