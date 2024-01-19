import './DiscussionSpace.css';
import {useState} from "react";
import MessageCard from "./MessageCard";
import MessageInput from "./MessageInput";

function DiscussionSpace () {
    const [messages, setMessages] = useState([{ title: 'Title', content: 'Message.', author: 'Author', timestamp: '0:00 Uhr - 01.01.24', authorPictureUrl: 'nothing working'}]);

    function addMessage([message]) {
        setMessages([...messages, message])
    }

    //TODO: add key for child elements
    return (
        <div className="messageBlock">
            {messages.map(message => (
                <MessageCard
                    key={"s"}
                    title={message.title}
                    content={message.content}
                    author={message.author}
                    timestamp={message.timestamp}
                    authorPictureUrl={message.authorPictureUrl}
                />
                ))};
            <MessageInput/>
        </div>
    );
}

export default DiscussionSpace;