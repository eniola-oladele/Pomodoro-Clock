// Accurate_Interval.js 
// Thanks Squeege! For the elegant answer provided to this question: 
// http://stackoverflow.com/questions/8173580/setinterval-timing-slowly-drifts-away-from-staying-accurate
// Github: https://gist.github.com/Squeegy/1d99b3cd81d610ac7351
// Slightly modified to accept 'normal' interval/timeout format (func, time). 

(function () {
  window.accurateInterval = function (fn, time) {
    var cancel, nextAt, timeout, wrapper;
    nextAt = new Date().getTime() + time;
    timeout = null;
    wrapper = function () {
      nextAt += time;
      timeout = setTimeout(wrapper, nextAt - new Date().getTime());
      return fn();
    };
    cancel = function () {
      return clearTimeout(timeout);
    };
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return {
      cancel: cancel };

  };
}).call(this);

const projectName = 'pomodoro-clock';
localStorage.setItem('example_project', 'Pomodoro Clock');

// COMPONENTS:
class TimerLengthControl extends React.Component {
  render() {
    return (
      React.createElement("div", { className: "length-control" },
      React.createElement("div", { id: this.props.titleID },
      this.props.title),

      React.createElement("button", { id: this.props.minID,
        className: "btn-level", value: "-",
        onClick: this.props.onClick },
      React.createElement("i", { className: "fa fa-arrow-down fa-2x" })),

      React.createElement("div", { id: this.props.lengthID, className: "btn-level" },
      this.props.length),

      React.createElement("button", { id: this.props.addID,
        className: "btn-level", value: "+",
        onClick: this.props.onClick },
      React.createElement("i", { className: "fa fa-arrow-up fa-2x" }))));



  }}
;

class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      brkLength: 5,
      seshLength: 25,
      timerState: 'stopped',
      timerType: 'Session',
      timer: 1500,
      intervalID: '',
      alarmColor: { color: 'white' } };

    this.setBrkLength = this.setBrkLength.bind(this);
    this.setSeshLength = this.setSeshLength.bind(this);
    this.lengthControl = this.lengthControl.bind(this);
    this.timerControl = this.timerControl.bind(this);
    this.beginCountDown = this.beginCountDown.bind(this);
    this.decrementTimer = this.decrementTimer.bind(this);
    this.phaseControl = this.phaseControl.bind(this);
    this.warning = this.warning.bind(this);
    this.buzzer = this.buzzer.bind(this);
    this.switchTimer = this.switchTimer.bind(this);
    this.clockify = this.clockify.bind(this);
    this.reset = this.reset.bind(this);
  }
  setBrkLength(e) {
    this.lengthControl('brkLength', e.currentTarget.value,
    this.state.brkLength, 'Session');
  }
  setSeshLength(e) {
    this.lengthControl('seshLength', e.currentTarget.value,
    this.state.seshLength, 'Break');
  }
  lengthControl(stateToChange, sign, currentLength, timerType) {
    if (this.state.timerState == 'running') return;
    if (this.state.timerType == timerType) {
      if (sign == "-" && currentLength != 1) {
        this.setState({ [stateToChange]: currentLength - 1 });
      } else if (sign == "+" && currentLength != 60) {
        this.setState({ [stateToChange]: currentLength + 1 });
      }
    } else {
      if (sign == "-" && currentLength != 1) {
        this.setState({ [stateToChange]: currentLength - 1,
          timer: currentLength * 60 - 60 });
      } else if (sign == "+" && currentLength != 60) {
        this.setState({ [stateToChange]: currentLength + 1,
          timer: currentLength * 60 + 60 });
      }
    }
  }
  timerControl() {
    let control = this.state.timerState == 'stopped' ? (
    this.beginCountDown(),
    this.setState({ timerState: 'running' })) : (

    this.setState({ timerState: 'stopped' }),
    this.state.intervalID && this.state.intervalID.cancel());

  }
  beginCountDown() {
    this.setState({
      intervalID: accurateInterval(() => {
        this.decrementTimer();
        this.phaseControl();
      }, 1000) });

  }
  decrementTimer() {
    this.setState({ timer: this.state.timer - 1 });
  }
  phaseControl() {
    let timer = this.state.timer;
    this.warning(timer);
    this.buzzer(timer);
    if (timer < 0) {
      this.state.timerType == 'Session' ? (
      this.state.intervalID && this.state.intervalID.cancel(),
      this.beginCountDown(),
      this.switchTimer(this.state.brkLength * 60, 'Break')) : (

      this.state.intervalID && this.state.intervalID.cancel(),
      this.beginCountDown(),
      this.switchTimer(this.state.seshLength * 60, 'Session'));

    }
  }
  warning(_timer) {
    let warn = _timer < 61 ?
    this.setState({ alarmColor: { color: '#a50d0d' } }) :
    this.setState({ alarmColor: { color: 'white' } });
  }
  buzzer(_timer) {
    if (_timer === 0) {
      this.audioBeep.play();
    }
  }
  switchTimer(num, str) {
    this.setState({
      timer: num,
      timerType: str,
      alarmColor: { color: 'white' } });

  }
  clockify() {
    let minutes = Math.floor(this.state.timer / 60);
    let seconds = this.state.timer - minutes * 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return minutes + ':' + seconds;
  }
  reset() {
    this.setState({
      brkLength: 5,
      seshLength: 25,
      timerState: 'stopped',
      timerType: 'Session',
      timer: 1500,
      intervalID: '',
      alarmColor: { color: 'white' } });

    this.state.intervalID && this.state.intervalID.cancel();
    this.audioBeep.pause();
    this.audioBeep.currentTime = 0;
  }
  render() {
    return (
      React.createElement("div", null,
      React.createElement("div", { className: "main-title" }, "Pomodoro Clock"),


      React.createElement(TimerLengthControl, {
        titleID: "break-label", minID: "break-decrement",
        addID: "break-increment", lengthID: "break-length",
        title: "Break Length", onClick: this.setBrkLength,
        length: this.state.brkLength }),
      React.createElement(TimerLengthControl, {
        titleID: "session-label", minID: "session-decrement",
        addID: "session-increment", lengthID: "session-length",
        title: "Session Length", onClick: this.setSeshLength,
        length: this.state.seshLength }),
      React.createElement("div", { className: "timer", style: this.state.alarmColor },
      React.createElement("div", { className: "timer-wrapper" },
      React.createElement("div", { id: "timer-label" },
      this.state.timerType),

      React.createElement("div", { id: "time-left" },
      this.clockify()))),



      React.createElement("div", { className: "timer-control" },
      React.createElement("button", { id: "start_stop", onClick: this.timerControl },
      React.createElement("i", { className: "fa fa-play fa-2x" }),
      React.createElement("i", { className: "fa fa-pause fa-2x" })),

      React.createElement("button", { id: "reset", onClick: this.reset },
      React.createElement("i", { className: "fa fa-refresh fa-2x" }))),


      React.createElement("div", { className: "author" }, " Designed and Coded by ", React.createElement("br", null),
      React.createElement("a", { target: "_blank", href: "https://github.com/eniola-oladele" }, "Eniola")),



      React.createElement("audio", { id: "beep", preload: "auto",
        src: "https://goo.gl/65cBl1",
        ref: audio => {this.audioBeep = audio;} })));


  }}
;

ReactDOM.render(React.createElement(Timer, null), document.getElementById('app'));