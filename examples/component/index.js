import {h, render, Component} from '../../preact';

class Person extends Component {
    constructor() {
        super();
        this.state = {
            name: "youngwind",
            age: 25
        }
    }

    change() {
        let {name, age} = this.state;
        this.setState({
            name: name + '啦',
            age: age + 1
        });
    }

    render() {
        return (
            <div>
                <button onclick={this.change.bind(this)}>改变</button>
                <Name name={this.state.name}/>
                <Age age={this.state.age}/>
            </div>
        )
    }

    componentDidMount() {
        console.log('Person didMount');
    }
}

class Name extends Component {

    componentWillMount() {
        console.log('Name WillMount');
    }

    render(props) {
        return (
            <div>
                <label>姓名：</label>
                <span>{props.name}</span>
            </div>
        )
    }

    componentDidMount() {
        console.log('Name didMount');
    }

    componentWillReceiveProps(newProps, oldProps) {
        console.log('Name Will Receive Props, newProps', newProps, 'oldProps', oldProps);
    }

    componentDidUpdate() {
        console.log('Name didUpdate');
    }
}

class Age extends Component {
    render(props) {
        return (
            <div>
                <label>年龄：</label>
                <span>{props.age}</span>
            </div>
        )
    }
}

render(<Person />, document.body);