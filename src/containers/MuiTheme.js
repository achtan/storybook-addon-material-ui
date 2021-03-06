import React from 'react';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import { EVENT_ID_DATA } from '../';
import { CSS_CLASS } from '../';
import ThemeToolbar from '../components/ThemeToolbar';
import ThemeSideBar from '../components/ThemeSideBar';
import SplitPane from '../components/SplitPane';

const propTypes = {
    themeObj: React.PropTypes.object,
    themeArr: React.PropTypes.arrayOf(React.PropTypes.object),
    themeName: React.PropTypes.string,
    themeNameArr: React.PropTypes.arrayOf(React.PropTypes.string),
    story: React.PropTypes.object.isRequired,
//    onChangeTheme: React.PropTypes.func.isRequired,
    onChangeState: React.PropTypes.func.isRequired,
    onThemeOverride: React.PropTypes.func.isRequired,
    initState: React.PropTypes.object,
    channel: React.PropTypes.object,
};

export class MuiTheme extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = props.initState;
        this.state.themesAppliedList = props.themesAppliedListInit;
        this.state.muiTheme = getMuiTheme(props.themesAppliedListInit[props.initState.themeInd]);
        this.state.isMount = false;
        this.isNewData = false;
        /*
        this.state = {
            muiTheme: getMuiTheme(props.themesList[props.defautThemeInd]),
            themeInd: props.defautThemeInd,
            isSideBarOpen: props.isSideBarOpen,
        };
*/

        this.UpdateList = {};

        this.changeTheme = this.changeTheme.bind(this);
        this.onChannel = this.onChannel.bind(this);
        this.openSideBar = this.openSideBar.bind(this);
        this.onThemeOverride = this.onThemeOverride.bind(this);
        this.subState = this.subState.bind(this);
        this.wouldComponentUpdate = this.wouldComponentUpdate.bind(this);
        this.needComponentUpdate = this.needComponentUpdate.bind(this);
    }


    componentDidMount() {
        this.props.channel.on(EVENT_ID_DATA, this.onChannel);
        if (!this.state.isMount) {
            setTimeout(() => {
                this.needComponentUpdate('ThemeSideBar');
                this.setState({ isMount: true });
            }, 1);
        }
    }

    componentWillUnmount() {
        this.props.channel.removeListener(EVENT_ID_DATA, this.onChannel);
    }

    onChannel(state) {
        this.needComponentUpdate('ThemeSideBar');
        this.isNewData = true;
        /* const propsThemeOverFunc = this.props.onThemeOverride(this.state.themeInd);
        const themesAppliedList = propsThemeOverFunc(
            state.themesAppliedList[state.themeInd]
        );
        state.themesAppliedList = themesAppliedList;*/
        this.setState({ ...state, isMount: false }, () => setTimeout(() => {
            this.isNewData = true;
            this.setState({ isMount: true });
        }, 10));
    }

    changeTheme(ind) {
        this.needComponentUpdate('ThemeSideBar');
        this.setState({
            muiTheme: getMuiTheme(this.state.themesAppliedList[ind]),
            themeInd: ind,
        });
    }

    openSideBar(f) {
        this.needComponentUpdate('ThemeSideBar');
        this.setState({
            isSideBarOpen: f,
        });
    }

    onThemeOverride() {
        const propsThemeOverFunc = this.props.onThemeOverride(this.state.themeInd);
        return (overTheme) => {
//            console.info('MuiTheme')
            const themesAppliedList = propsThemeOverFunc(overTheme);
//            console.log(themesAppliedList);
            this.needComponentUpdate('ThemeSideBar');
            this.setState({ themesAppliedList });
        };
    }

    subState(componentName, prop) {
        return (val) => {
            if (val == undefined) {
                return this.state[prop];
            }
            const subState = {};
            subState[prop] = val;
            this.setState(subState);
            this.needComponentUpdate(componentName);
            return val;
        };
    }

    wouldComponentUpdate(componentName) {
        if (this.UpdateList[componentName] == undefined) {
            this.UpdateList[componentName] = false;
        }
        const upd = this.UpdateList[componentName];
        this.UpdateList[componentName] = false;
        return upd;
    }

    needComponentUpdate(componentName) {
        this.UpdateList[componentName] = true;
    }

    componentWillUpdate(nextProps, nextState) {
        this.props.onChangeState(nextState, this.isNewData);
        this.isNewData = false;
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    render() {
        const ThemesNameList = this.state.themesAppliedList.map((val, ind) => (val.themeName || `Theme ${ind + 1}`));
        const muiTheme = getMuiTheme(this.props.themeListRender(this.state.themesAppliedList[this.state.themeInd]));
        return (<MuiThemeProvider muiTheme={muiTheme/* this.state.muiTheme*/}>
                <div
                  style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: muiTheme.palette.canvasColor,
                  }}

                >
                    <SplitPane split="vertical"
                      minSize={200}
                      defaultSize={400}
                      primary="second"
                      style={{

                      }}
                    >
                       {
                        true ? <div style={{/* flexGrow: 1 */}}>
                            {/* <div style={{ width: '100%' }}>
                                  <ThemeToolbar
                                    themesNameList={ThemesNameList}
                                    defautThemeInd={this.state.themeInd}
                                    onThemeSelect={this.changeTheme}
                                    onToggleSideBar={this.openSideBar}
                                    isSideBarOpen={this.state.isSideBarOpen}
                                />
                            </div>*/}
                            { this.props.story }
                        </div> : <div>Null</div>
                        }
                        <ThemeSideBar
                          shouldComponentUpdate
                          shouldShowData={this.state.isMount}
                          open={this.state.isSideBarOpen}
                          theme={this.state.themesAppliedList[this.state.themeInd]}
                          muiTheme={muiTheme}
                          themeName={ThemesNameList[this.state.themeInd]}
                          fullTheme={this.subState('ThemeSideBar', 'isFullTheme')}
                          collapseList={this.subState('ThemeSideBar', 'collapseList')}
                          themesOverrideList={this.subState('ThemeSideBar', 'currentThemeOverride')}
                          onThemeOverride={this.onThemeOverride()}
                        />
                    </SplitPane>
                    </div>
        </MuiThemeProvider>);
    }
}

MuiTheme.propTypes = propTypes;
