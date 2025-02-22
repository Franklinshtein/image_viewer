"use strict";
const data = [
    {
        src: './photo/1.jpg',
        title: 'title',
        content: 'content'
    },
    {
        src: './photo/2.jpg',
        title: 'title',
        content: 'content'
    },
    {
        src: './photo/3.jpg',
        title: 'title',
        content: 'content'
    },
    {
        src: './photo/4.jpg',
        title: 'title',
        content: 'content'
    },
    {
        src: './photo/5.jpg',
        title: 'title',
        content: 'content'
    },
    {
        src: './photo/6.jpg',
        title: 'title',
        content: 'content'
    },
    {
        src: './photo/7.jpg',
        title: 'title',
        content: 'content'
    },
    {
        src: './photo/8.jpg',
        title: 'title',
        content: 'content'
    },
    {
        src: './photo/9.jpg',
        title: 'title',
        content: 'content'
    },
    {
        src: './photo/10.jpg',
        title: 'title',
        content: 'content'
    },
    {
        src: './photo/11.jpg',
        title: 'title',
        content: 'content'
    },
    {
        src: './photo/12.jpg',
        title: 'title',
        content: 'content'
    }
];
// ------------
const { Component, PropTypes } = React;
const ZOOM_LEVEL = {
    MIN: 0,
    MAX: 4
};
const VISIBLE_INDICATORS_COUNT = 8;
const KEY_CODE = {
    LEFT: 37,
    RIGTH: 39
};
const OFFSET_DEFAULT = {
    x: 0,
    y: 0
};
class ImageWrapper extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            loading: false,
            onload: false,
            zoom: 0,
            offset: OFFSET_DEFAULT
        };
        this.draggable = false;
        this.offsetRange = OFFSET_DEFAULT;
        this.clientOffset = {
            x: undefined,
            y: undefined
        };
    }
    loadImage(src) {
        this.state.loading = true;
        this.setState(this.state);
        this.src = new Image();
        this.src.src = src;
        this.src.onload = () => {
            if (!this.src)
                return;
            this.state.loading = false;
            this.state.onload = true;
            this.setState(this.state);
        };
        this.src.onerror = () => {
            if (!this.src)
                return;
            this.state.loading = false;
            this.state.onload = false;
            this.setState(this.state);
        };
    }
    resetOffset() {
        this.state.offset = OFFSET_DEFAULT;
        this.setState(this.state);
    }
    setOffsetRange() {
        const zoom = this.state.zoom;
        const dx = this.image.scrollWidth * (1 + zoom / 2) - this.imageOuter.clientWidth;
        const dy = this.image.scrollHeight * (1 + zoom / 2) - this.imageOuter.clientHeight;
        this.offsetRange = {
            x: Math.max(0, dx / 2),
            y: Math.max(0, dy / 2)
        };
    }
    zoomIn() {
        if (!this.state.onload)
            return;
        this.state.zoom = Math.min(this.state.zoom + 1, ZOOM_LEVEL.MAX);
        this.setState(this.state);
        this.setOffsetRange();
    }
    zoomOut() {
        if (!this.state.onload)
            return;
        this.state.zoom = Math.max(0, this.state.zoom - 1);
        this.setState(this.state);
        this.resetOffset();
        this.setOffsetRange();
    }
    onMoveStart(e) {
        if (!this.offsetRange.x && !this.offsetRange.y) {
            return;
        }
        this.clientOffset = {
            x: e.clientX,
            y: e.clientY
        };
        this.draggable = true;
    }
    onMove(e) {
        if (!e.clientX && !e.clientY || !this.draggable) {
            return;
        }
        const offset = {
            x: e.clientX - this.clientOffset.x,
            y: e.clientY - this.clientOffset.y,
        };
        this.clientOffset = {
            x: e.clientX,
            y: e.clientY
        };
        this.state.offset = {
            x: this.state.offset.x + offset.x,
            y: this.state.offset.y + offset.y,
        };
        this.setState(this.state);
    }
    onMoveEnd(e) {
        if (!this.mounted)
            return;
        this.draggable = false;
        const offset = {
            x: Math.abs(this.state.offset.x),
            y: Math.abs(this.state.offset.y)
        };
        if (Math.abs(this.state.offset.x) >= this.offsetRange.x) {
            this.state.offset.x = this.state.offset.x < 0 ? Math.min(0, -(this.offsetRange.x)) : Math.max(0, this.offsetRange.x);
            this.setState(this.state);
        }
        if (Math.abs(this.state.offset.y) >= this.offsetRange.y) {
            this.state.offset.y = this.state.offset.y < 0 ? Math.min(0, -(this.offsetRange.y)) : Math.max(0, this.offsetRange.y);
            this.setState(this.state);
        }
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.image.src != nextProps.image.src) {
            this.resetOffset();
            this.loadImage(nextProps.image.src);
            this.setState({
                zoom: 0
            });
        }
    }
    componentDidMount() {
        this.mounted = true;
        this.loadImage(this.props.image.src);
        window.addEventListener('resize', this.setOffsetRange.bind(this));
        document.documentElement.addEventListener("mouseup", this.onMoveEnd.bind(this));
    }
    componentWillUnmount() {
        this.mounted = false;
        if (!!this.src) {
            this.src = undefined;
        }
        window.removeEventListener('resize', this.setOffsetRange.bind(this));
        document.documentElement.removeEventListener("mouseup", this.onMoveEnd.bind(this));
    }
    render() {
        const { image, index, showIndex } = this.props;
        const { offset, zoom, loading } = this.state;
        const value = `translate3d(${offset.x}px, ${offset.y}px, 0px)`;
        const imageCls = `zoom-${zoom} image-outer ${this.draggable ? 'dragging' : ''}`;
        const caption = (React.createElement("p", { className: "caption" },
            image.title ? React.createElement("span", { className: "title" }, image.title) : null,
            image.title && image.content ? React.createElement("span", null, ` - `) : null,
            image.title ? React.createElement("span", { className: "content" }, image.content) : null));
        return (React.createElement("div", { className: "image-wrapper" },
            React.createElement("div", { style: { transform: value }, ref: (component) => this.imageOuter = component, className: imageCls }, loading ? (React.createElement("div", { className: "spinner" },
                React.createElement("div", { className: "bounce" }))) : React.createElement("img", { className: "image", ref: (component) => this.image = component, src: image.src, alt: image.title || '', draggable: false, onDragStart: (e) => e.preventDefault(), onMouseMove: this.onMove.bind(this), onMouseDown: this.onMoveStart.bind(this), onMouseUp: this.onMoveEnd.bind(this) })),
            React.createElement("div", { className: "tool-bar" },
                showIndex && React.createElement("div", { className: "index-indicator" }, index),
                caption,
                React.createElement("div", { className: "button-group" },
                    React.createElement("div", { className: "zoom-out button", onClick: this.zoomOut.bind(this) }),
                    React.createElement("div", { className: "zoom-in button", onClick: this.zoomIn.bind(this) })))));
    }
}
class ImageViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeIndex: this.props.activeIndex
        };
    }
    renderIndicators(list) {
        const activeIndex = this.state.activeIndex;
        const ret = Math.round(VISIBLE_INDICATORS_COUNT / 2);
        const length = list.length;
        return list.map((item, index) => {
            const isActive = activeIndex === index;
            const itemInvisible = length > VISIBLE_INDICATORS_COUNT && (index < Math.min(length - VISIBLE_INDICATORS_COUNT - 1, activeIndex - ret) || index > Math.max(activeIndex + ret, VISIBLE_INDICATORS_COUNT));
            const itemCls = `indicators-item ${isActive ? 'active' : ''} ${itemInvisible ? 'invisible' : ''} ${this.props.showPreview ? 'preview' : ''}`;
            return (React.createElement("div", { key: index, className: itemCls, onClick: this.itemControl.bind(this, index) }, this.props.showPreview && (React.createElement("div", { className: "image", style: { background: `url(${item.src})` } }))));
        });
    }
    onPrev() {
        let index = (this.state.activeIndex + this.props.images.length - 1) % this.props.images.length;
        this.itemControl(index);
    }
    onNext() {
        let index = (this.state.activeIndex + 1) % this.props.images.length;
        this.itemControl(index);
    }
    itemControl(index) {
        if (index === this.state.activeIndex)
            return;
        this.state.activeIndex = index;
        this.setState(this.state);
    }
    onKeyDown(e) {
        if (!this.mounted)
            return;
        e.stopPropagation();
        switch (e.which || e.keyCode) {
            case KEY_CODE.LEFT:
                this.onPrev();
                break;
            case KEY_CODE.RIGTH:
                this.onNext();
                break;
        }
    }
    componentDidMount() {
        this.mounted = true;
        document.documentElement.addEventListener("keydown", this.onKeyDown.bind(this));
    }
    componentWillUnmount() {
        this.mounted = false;
        document.documentElement.removeEventListener("keydown", this.onKeyDown.bind(this));
    }
    render() {
        const { images, showIndex, prefixCls } = this.props;
        const { activeIndex } = this.state;
        const indicatorVisible = images.length > 1;
        return (React.createElement("div", { className: `react-image-viewer ${prefixCls}-image-viewer`, ref: (component) => this.container = component },
            React.createElement(ImageWrapper, { showIndex: showIndex, index: `${activeIndex + 1}/${images.length}`, image: images[activeIndex] }),
            indicatorVisible ?
                React.createElement("div", { className: "direction-control-button" },
                    React.createElement("div", { className: "prev-button button", onClick: this.onPrev.bind(this) },
                        React.createElement("div", { className: "bar" })),
                    React.createElement("div", { className: "next-button button", onClick: this.onNext.bind(this) },
                        React.createElement("div", { className: "bar" })),
                    React.createElement("div", { className: "indicators" }, indicatorVisible && this.renderIndicators(images)))
                : null));
    }
}
ImageViewer.defaultProps = {
    prefixCls: 'react-image-viewer',
    className: '',
    showIndex: true,
    showPreview: true,
    activeIndex: 0,
};
ImageViewer.propTypes = {
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    showIndex: PropTypes.bool,
    showPreview: PropTypes.bool,
    activeIndex: PropTypes.number,
};
class Modal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            activeIndex: undefined
        };
    }
    open(activeIndex) {
        this.setState({
            visible: true,
            activeIndex: activeIndex || 0
        });
    }
    close() {
        this.setState({
            visible: false,
            activeIndex: undefined
        });
    }
    render() {
        const { images, prefixCls, className, showIndex, showPreview } = this.props;
        const { activeIndex } = this.state;
        return this.state.visible ? (React.createElement("div", { className: 'modal' },
            React.createElement(ImageViewer, { showPreview: showPreview, showIndex: showIndex, prefixCls: prefixCls, activeIndex: activeIndex, images: images }),
            React.createElement("div", { className: 'close-button', onClick: this.close.bind(this) }))) : null;
    }
}
class Root extends Component {
    render() {
        const { images } = this.props;
        return (React.createElement("div", { className: "image-gallery" },
            images.map((item, index) => (React.createElement("div", { className: "image-item", key: index, onClick: this.open.bind(this, index) },
                React.createElement("div", { className: "image-inner", style: { background: `url(${item.src})` } })))),
            React.createElement(Modal, { images: images, showIndex: true, showPreview: true, ref: (component) => this.modal = component })));
    }
    open(index) {
        this.modal.open(index);
    }
}
ReactDOM.render(React.createElement(Root, { images: data }), document.getElementById('root'));