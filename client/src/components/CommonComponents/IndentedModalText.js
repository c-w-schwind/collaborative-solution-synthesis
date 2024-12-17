import "./IndentedModalText.css";

const IndentedModalText = ({ children }) => (
    <span className="indented-line">
        <span className="arrow-symbol">➤</span>
        <span className="indented-text">{children}</span>
    </span>
);

export default IndentedModalText;