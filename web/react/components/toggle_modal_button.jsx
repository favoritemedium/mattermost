// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

export default class ModalToggleButton extends React.Component {
    constructor(props) {
        super(props);

        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);

        this.state = {
            show: false
        };
    }

    show() {
        this.setState({show: true});
    }

    hide() {
        this.setState({show: false});
    }

    render() {
        const {children, dialogType, dialogProps, onClick, ...props} = this.props; // eslint-disable-line no-redeclare

        // allow callers to provide an onClick which will be called before the modal is shown
        let clickHandler = this.show;
        if (onClick) {
            clickHandler = () => {
                onClick();

                this.show();
            };
        }

        // this assumes that all modals will have a show property and an onHide event
        const dialog = React.createElement(this.props.dialogType, Object.assign({}, dialogProps, {
            show: this.state.show,
            onHide: () => {
                this.hide();

                if (dialogProps.onHide) {
                    dialogProps.onHide();
                }
            }
        }));

        // nesting the dialog in the anchor tag looks like it shouldn't work, but it does due to how react-bootstrap
        // renders modals at the top level of the DOM instead of where you specify in the virtual DOM
        return (
            <a
                {...props}
                href='#'
                onClick={clickHandler}
            >
                {children}
                {dialog}
            </a>
        );
    }
}

ModalToggleButton.propTypes = {
    children: React.PropTypes.node.isRequired,
    dialogType: React.PropTypes.func.isRequired,
    dialogProps: React.PropTypes.object,
    onClick: React.PropTypes.func
};

ModalToggleButton.defaultProps = {
    dialogProps: {}
};
