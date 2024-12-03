import "./IndentedModalText.css";

const IndentedModalText = ({ children }) => (
    <div className="indented-line">
        <span className="arrow-symbol">➤</span>
        <span className="indented-text">{children}</span>
    </div>
);

export default IndentedModalText;